import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword, generateOtpCode, hashOtp, compareOtp } from '../utils/hash.js';
import { signAccessToken, signRefreshToken } from '../utils/token.js';
import { SessionService } from '../services/sessionService.js';
import { EmailService } from '../services/emailService.js';
import { QrService } from '../services/qrService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DeviceType, Role, UserStatus } from '@prisma/client';

export class AuthController {
  /**
   * 1. Register with Email/Password & trigger 6-digit OTP
   */
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, academicLevel = 'HSC_2026' } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required.');
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return sendError(res, 'An account with this email already exists.');
      }

      const passwordHash = await hashPassword(password);

      // Create user with PENDING_VERIFICATION status
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: Role.STUDENT,
          status: UserStatus.PENDING_VERIFICATION,
        },
      });

      // Generate 6-digit OTP
      const otpCode = generateOtpCode();
      const otpHash = await hashOtp(otpCode);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

      await prisma.otpVerification.create({
        data: {
          email: user.email,
          otpHash,
          purpose: 'REGISTRATION',
          expiresAt,
          userId: user.id,
        },
      });

      // Dispatch Email OTP
      await EmailService.sendOtpEmail(user.email, otpCode, 'REGISTRATION');

      return sendSuccess(
        res,
        { email: user.email, userId: user.id },
        'Registration initiated. 6-digit OTP has been sent to your email.'
      );
    } catch (error: any) {
      console.error('[Register Error]', error);
      return sendError(res, 'Failed to register account.', 500, error.message);
    }
  }

  /**
   * 2. Verify 6-digit OTP to activate account and assign Student ID
   */
  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp, academicLevel = 'HSC_2026' } = req.body;

      if (!email || !otp) {
        return sendError(res, 'Email and OTP are required.');
      }

      const verification = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          purpose: 'REGISTRATION',
          verified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return sendError(res, 'Invalid or expired OTP. Please request a new code.');
      }

      const isValid = await compareOtp(otp, verification.otpHash);
      if (!isValid) {
        return sendError(res, 'Incorrect OTP code.');
      }

      // Mark OTP verified
      await prisma.otpVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      // Activate User
      const user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { status: UserStatus.ACTIVE },
      });

      // Generate Unique Student ID (RSB-YY-XXX)
      const currentYearShort = new Date().getFullYear().toString().slice(-2);
      const studentCount = await prisma.studentProfile.count();
      const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;

      // Generate QR Code
      const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.name, academicLevel);
      const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);

      // Create initial profile
      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentIdNumber,
          academicLevel,
          qrCodeDataUrl,
          isCompleted: false,
        },
      });

      return sendSuccess(
        res,
        { user: { id: user.id, email: user.email, name: user.name, role: user.role }, profile },
        'Account verified successfully! Please log in.'
      );
    } catch (error: any) {
      console.error('[Verify OTP Error]', error);
      return sendError(res, 'Verification failed.', 500, error.message);
    }
  }

  /**
   * 3. Login with Dual-Device Control (Max 2 FIFO eviction)
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password, deviceId, deviceName } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required.');
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { profile: { include: { batch: true } } },
      });

      if (!user) {
        return sendError(res, 'Invalid credentials.', 401);
      }

      if (user.status === UserStatus.PENDING_VERIFICATION) {
        return sendError(res, 'Please verify your email OTP before logging in.', 403);
      }

      if (user.status === UserStatus.SUSPENDED) {
        return sendError(res, 'Your account has been suspended. Contact Rayhan Sir.', 403);
      }

      const passwordMatch = await comparePassword(password, user.passwordHash);
      if (!passwordMatch) {
        return sendError(res, 'Invalid credentials.', 401);
      }

      // Parse Device Info
      const userAgent = req.headers['user-agent'] || 'Unknown Agent';
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const effectiveDeviceId = deviceId || Buffer.from(`${user.id}-${userAgent}-${ip}`).toString('base64').slice(0, 32);

      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;

      // Temporary refresh token to initialize session
      const tempRefreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

      // Register session with Dual-Device FIFO Eviction
      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: deviceName || (isMobile ? 'Mobile Device' : 'Desktop Browser'),
          deviceType,
          browser: userAgent.slice(0, 80),
          os: isMobile ? 'Mobile OS' : 'Desktop OS',
          ipAddress: ip,
        },
        tempRefreshToken
      );

      // Sign Access Token embedding the sessionId
      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      // Update session with final refresh token
      await prisma.deviceSession.update({
        where: { id: session.id },
        data: { refreshToken },
      });

      const activeSessions = await SessionService.getUserSessions(user.id);

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          profile: user.profile,
          tokens: {
            accessToken,
            refreshToken,
          },
          sessionId: session.id,
          activeDevicesCount: activeSessions.length,
          activeDevices: activeSessions,
        },
        'Login successful.'
      );
    } catch (error: any) {
      console.error('[Login Error]', error);
      return sendError(res, 'Login failed.', 500, error.message);
    }
  }

  /**
   * 4. Get Current User info, Profile & Sessions
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: {
          profile: {
            include: { batch: true },
          },
        },
      });

      if (!user) {
        return sendError(res, 'User not found.', 404);
      }

      const activeSessions = await SessionService.getUserSessions(user.id);

      return sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        profile: user.profile,
        activeSessions,
      });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch user.', 500);
    }
  }

  /**
   * 5. Get Active Device Sessions
   */
  static async getActiveSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const sessions = await SessionService.getUserSessions(req.user!.userId);
      return sendSuccess(res, sessions);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch sessions.', 500);
    }
  }

  /**
   * 6. Terminate / Remote Logout a specific device session
   */
  static async terminateSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      await SessionService.terminateSession(req.user!.userId, sessionId);
      return sendSuccess(res, null, 'Device session terminated.');
    } catch (error: any) {
      return sendError(res, 'Failed to terminate session.', 500);
    }
  }

  /**
   * 7. Forgot Password - Request 6-digit OTP
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        // Return success for security obfuscation
        return sendSuccess(res, null, 'If that email exists, an OTP has been sent.');
      }

      const otpCode = generateOtpCode();
      const otpHash = await hashOtp(otpCode);

      await prisma.otpVerification.create({
        data: {
          email: user.email,
          otpHash,
          purpose: 'PASSWORD_RESET',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          userId: user.id,
        },
      });

      await EmailService.sendOtpEmail(user.email, otpCode, 'PASSWORD_RESET');
      return sendSuccess(res, null, 'Password reset OTP has been sent to your email.');
    } catch (error: any) {
      return sendError(res, 'Failed to request password reset.', 500);
    }
  }

  /**
   * 8. Reset Password using verified OTP
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      const verification = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          purpose: 'PASSWORD_RESET',
          verified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return sendError(res, 'Invalid or expired OTP.');
      }

      const isValid = await compareOtp(otp, verification.otpHash);
      if (!isValid) {
        return sendError(res, 'Incorrect OTP.');
      }

      await prisma.otpVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash },
      });

      return sendSuccess(res, null, 'Password has been updated. Please log in with your new password.');
    } catch (error: any) {
      return sendError(res, 'Failed to reset password.', 500);
    }
  }
}

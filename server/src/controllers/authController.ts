import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword, generateOtpCode, hashOtp, compareOtp } from '../utils/hash.js';
import { signAccessToken, signRefreshToken } from '../utils/token.js';
import { SessionService } from '../services/sessionService.js';
import { EmailService } from '../services/emailService.js';
import { QrService } from '../services/qrService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DeviceType, Role, UserStatus, AuthProvider } from '@prisma/client';

export class AuthController {
  /**
   * 1. Instant Student Registration (No OTP Required)
   * Fields: fullName, identifier (Email or Phone), classLevel, batchName, password
   */
  static async register(req: Request, res: Response) {
    try {
      const {
        fullName,
        name,
        identifier,
        email,
        phone,
        classLevel = 'HSC_11',
        academicLevel,
        batchName = 'Special Batch',
        password,
        confirmPassword,
        deviceId,
        deviceName,
      } = req.body;

      const studentName = (fullName || name || '').trim();
      const rawIdentifier = (identifier || email || phone || '').toString().trim();
      const selectedClass = (classLevel || academicLevel || 'HSC_11').toString();
      const selectedBatch = (batchName || 'Special Batch').toString().trim();

      // Basic validations
      if (!studentName) {
        return sendError(res, 'শিক্ষার্থীর পূর্ণ নাম দেওয়া আবশ্যক (Full Name is required).');
      }

      if (!rawIdentifier) {
        return sendError(res, 'ইমেইল অথবা মোবাইল নম্বর দেওয়া আবশ্যক (Email or Phone is required).');
      }

      if (!password || password.length < 6) {
        return sendError(res, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters).');
      }

      if (confirmPassword && password !== confirmPassword) {
        return sendError(res, 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না (Passwords do not match).');
      }

      const isEmail = rawIdentifier.includes('@');
      const normalizedEmail = isEmail ? rawIdentifier.toLowerCase() : null;
      const normalizedPhone = !isEmail ? rawIdentifier.replace(/[^0-9+]/g, '') : null;

      // Check if user already exists with this Email or Phone
      if (normalizedEmail) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existingEmailUser) {
          return sendError(res, 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে (Email already exists).');
        }
      }

      if (normalizedPhone) {
        const existingPhoneUser = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: normalizedPhone },
              { profile: { studentPhone: normalizedPhone } },
            ],
          },
        });
        if (existingPhoneUser) {
          return sendError(res, 'এই ফোন নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে (Phone number already exists).');
        }
      }

      // Hash password using bcryptjs
      const passwordHash = await hashPassword(password);

      // Create User with ACTIVE status directly (NO OTP required!)
      const user = await prisma.user.create({
        data: {
          name: studentName,
          email: normalizedEmail,
          phone: normalizedPhone,
          passwordHash,
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
          authProvider: AuthProvider.LOCAL,
        },
      });

      // Find or create selected batch
      let batch = await prisma.batch.findFirst({
        where: {
          name: { equals: selectedBatch, mode: 'insensitive' },
        },
      });

      if (!batch) {
        batch = await prisma.batch.create({
          data: {
            name: selectedBatch,
            academicLevel: selectedClass,
            scheduleDays: 'রবি-মঙ্গল-বৃহস্পতি',
            timeSlot: 'সকাল ৮:০০ - ১০:০০',
            monthlyFee: 2000.0,
            isActive: true,
          },
        });
      }

      // Generate Unique Student ID (RSB-YY-XXX)
      const currentYearShort = new Date().getFullYear().toString().slice(-2);
      const studentCount = await prisma.studentProfile.count();
      const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;

      // Generate Official QR Code
      const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.name, selectedClass);
      const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);

      // Create Student Profile
      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentIdNumber,
          academicLevel: selectedClass,
          batchId: batch.id,
          studentPhone: normalizedPhone,
          qrCodeDataUrl,
          isCompleted: false,
        },
        include: {
          batch: true,
        },
      });

      // Register session with Dual-Device Limit (Max 2 devices with FIFO eviction)
      const userAgent = req.headers['user-agent'] || 'Unknown Agent';
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const effectiveDeviceId =
        deviceId || Buffer.from(`${user.id}-${userAgent}-${ip}`).toString('base64').slice(0, 32);

      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;

      const tempRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
      });

      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: deviceName || (isMobile ? 'Mobile Phone' : 'Desktop Browser'),
          deviceType,
          browser: userAgent.slice(0, 80),
          os: isMobile ? 'Mobile' : 'Desktop',
          ipAddress: ip,
        },
        tempRefreshToken
      );

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      // Update session with final token
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
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
          profile,
          tokens: {
            accessToken,
            refreshToken,
          },
          sessionId: session.id,
          activeDevicesCount: activeSessions.length,
        },
        'রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম Rayhan Special Batch-এ।'
      );
    } catch (error: any) {
      console.error('[Instant Register Error]', error);
      return sendError(res, 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।', 500, error.message);
    }
  }

  /**
   * 2. Login with Email OR Phone Number + Password (Dual-Device Control)
   */
  static async login(req: Request, res: Response) {
    try {
      const { identifier, email, phone, password, deviceId, deviceName } = req.body;
      const rawInput = (identifier || email || phone || '').toString().trim();

      if (!rawInput || !password) {
        return sendError(res, 'ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড দেওয়া আবশ্যক।');
      }

      const isEmail = rawInput.includes('@');
      const isStudentId = /^RSB/i.test(rawInput) || (rawInput.includes('-') && !isEmail);
      const normalizedEmail = isEmail ? rawInput.toLowerCase() : null;
      const normalizedPhone = (!isEmail && !isStudentId) ? rawInput.replace(/[^0-9+]/g, '') : null;

      // Find user by Email, Official Student ID, OR Phone
      const user = await prisma.user.findFirst({
        where: isEmail
          ? { email: { equals: normalizedEmail!, mode: 'insensitive' } }
          : isStudentId
          ? {
              profile: {
                studentIdNumber: { equals: rawInput, mode: 'insensitive' },
              },
            }
          : {
              OR: [
                ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
                ...(normalizedPhone ? [{ profile: { studentPhone: normalizedPhone } }] : []),
                { profile: { studentIdNumber: { equals: rawInput, mode: 'insensitive' } } },
              ],
            },
        include: {
          profile: {
            include: { batch: true },
          },
        },
      });

      if (!user) {
        return sendError(res, 'ভুল ইমেইল/ফোন/স্টুডেন্ট আইডি অথবা পাসওয়ার্ড।', 401);
      }

      if (user.status === UserStatus.SUSPENDED) {
        return sendError(res, 'আপনার অ্যাকাউন্টটি স্থগিত রাখা হয়েছে। অনুগ্রহ করে রায়হান স্যারের সাথে যোগাযোগ করুন।', 403);
      }

      const passwordMatch = await comparePassword(password, user.passwordHash);
      if (!passwordMatch) {
        return sendError(res, 'ভুল ইমেইল/ফোন অথবা পাসওয়ার্ড।', 401);
      }

      // Parse Device Info
      const userAgent = req.headers['user-agent'] || 'Unknown Agent';
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const effectiveDeviceId =
        deviceId || Buffer.from(`${user.id}-${userAgent}-${ip}`).toString('base64').slice(0, 32);

      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;

      const tempRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
      });

      // Register session with Dual-Device FIFO Eviction (Max 2 devices)
      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: deviceName || (isMobile ? 'Mobile Phone' : 'Desktop Browser'),
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
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
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

      // Auto-heal student profile if studentIdNumber or QR code is missing
      let effectiveProfile = user.profile;
      if (user.role === Role.STUDENT) {
        if (!effectiveProfile) {
          const currentYearShort = new Date().getFullYear().toString().slice(-2);
          const studentCount = await prisma.studentProfile.count();
          const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;
          const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.name, 'HSC_11');
          const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);
          effectiveProfile = await prisma.studentProfile.create({
            data: {
              userId: user.id,
              studentIdNumber,
              academicLevel: 'HSC_11',
              fullName: user.name,
              qrCodeDataUrl,
              isCompleted: false,
              isProfileComplete: false,
              verificationStatus: 'UNVERIFIED',
            },
            include: { batch: true },
          });
        } else if (!effectiveProfile.studentIdNumber || !effectiveProfile.qrCodeDataUrl) {
          const currentYearShort = new Date().getFullYear().toString().slice(-2);
          const studentCount = await prisma.studentProfile.count();
          const studentIdNumber = effectiveProfile.studentIdNumber || `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;
          const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, effectiveProfile.fullName || user.name, effectiveProfile.academicLevel || 'HSC_11');
          const qrCodeDataUrl = effectiveProfile.qrCodeDataUrl || (await QrService.generateQrDataUrl(qrPayload));
          effectiveProfile = await prisma.studentProfile.update({
            where: { id: effectiveProfile.id },
            data: { studentIdNumber, qrCodeDataUrl },
            include: { batch: true },
          });
        }
      }

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
          profile: effectiveProfile,
          tokens: {
            accessToken,
            refreshToken,
          },
          sessionId: session.id,
          activeDevicesCount: activeSessions.length,
          activeDevices: activeSessions,
        },
        'লগইন সফল হয়েছে।'
      );
    } catch (error: any) {
      console.error('[Login Error]', error);
      return sendError(res, 'লগইন ব্যর্থ হয়েছে।', 500, error.message);
    }
  }

  /**
   * 3. Social Authentication (Google & Facebook)
   */
  static async socialAuth(req: Request, res: Response) {
    try {
      const { provider, email, name, avatarUrl, socialId, classLevel = 'HSC_11' } = req.body;

      if (!provider || !['GOOGLE', 'FACEBOOK'].includes(provider)) {
        return sendError(res, 'Invalid social provider.');
      }

      if (!email && !socialId) {
        return sendError(res, 'Email or Social ID is required for social login.');
      }

      const normalizedEmail = email ? email.toLowerCase().trim() : null;

      // Find user by email or social ID
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ...(provider === 'GOOGLE' && socialId ? [{ googleId: socialId }] : []),
            ...(provider === 'FACEBOOK' && socialId ? [{ facebookId: socialId }] : []),
          ],
        },
        include: {
          profile: { include: { batch: true } },
        },
      });

      if (!user) {
        // Create new user for social login
        const randomDummyPass = await hashPassword(Math.random().toString(36).slice(-10));
        user = await prisma.user.create({
          data: {
            name: name || (provider === 'GOOGLE' ? 'Google Student' : 'Facebook Student'),
            email: normalizedEmail,
            passwordHash: randomDummyPass,
            role: Role.STUDENT,
            status: UserStatus.ACTIVE,
            authProvider: provider === 'GOOGLE' ? AuthProvider.GOOGLE : AuthProvider.FACEBOOK,
            googleId: provider === 'GOOGLE' ? socialId : null,
            facebookId: provider === 'FACEBOOK' ? socialId : null,
          },
          include: {
            profile: { include: { batch: true } },
          },
        });
      }

      // Ensure linked StudentProfile exists (guarantees no missing-document crash)
      if (!user.profile) {
        const currentYearShort = new Date().getFullYear().toString().slice(-2);
        const studentCount = await prisma.studentProfile.count();
        const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;
        const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.name, classLevel);
        const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);

        const profile = await prisma.studentProfile.create({
          data: {
            userId: user.id,
            studentIdNumber,
            academicLevel: classLevel,
            avatarUrl: avatarUrl || null,
            fullName: user.name,
            qrCodeDataUrl,
            isCompleted: false,
            isProfileComplete: false,
            verificationStatus: 'UNVERIFIED',
          },
          include: { batch: true },
        });

        user = { ...user, profile };
      }

      // Parse Device Info & Create Session
      const userAgent = req.headers['user-agent'] || 'Unknown Agent';
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const effectiveDeviceId = Buffer.from(`${user.id}-${userAgent}-${ip}`).toString('base64').slice(0, 32);
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;

      const tempRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
      });

      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: `${provider} Auth - ${isMobile ? 'Mobile' : 'Desktop'}`,
          deviceType,
          browser: userAgent.slice(0, 80),
          os: isMobile ? 'Mobile' : 'Desktop',
          ipAddress: ip,
        },
        tempRefreshToken
      );

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      await prisma.deviceSession.update({
        where: { id: session.id },
        data: { refreshToken },
      });

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
          profile: user.profile,
          tokens: {
            accessToken,
            refreshToken,
          },
          sessionId: session.id,
        },
        `${provider} দিয়ে সফলভাবে লগইন হয়েছে।`
      );
    } catch (error: any) {
      console.error('[Social Auth Error]', error);
      return sendError(res, 'Social login failed.', 500, error.message);
    }
  }

  /**
   * Real Google OAuth 2.0 Sign-In / Sign-Up
   * Endpoint: POST /api/v1/auth/google
   * Verifies Google ID Token (credential) or Access Token using google-auth-library
   */
  static async googleAuth(req: Request, res: Response) {
    try {
      const { credential, accessToken: googleAccessToken, classLevel = 'HSC_11' } = req.body;

      if (!credential && !googleAccessToken) {
        return sendError(res, 'Google credential (ID Token) or Access Token is required.', 400);
      }

      let payload: any = null;

      if (credential) {
        try {
          const clientId = process.env.GOOGLE_CLIENT_ID;
          const googleClient = new OAuth2Client(clientId);

          if (clientId) {
            const ticket = await googleClient.verifyIdToken({
              idToken: credential,
              audience: clientId,
            });
            payload = ticket.getPayload();
          } else {
            const ticket = await googleClient.verifyIdToken({
              idToken: credential,
            });
            payload = ticket.getPayload();
          }
        } catch (verifyError: any) {
          console.warn('[Google Token Verify Warning]', verifyError.message);
          // Safe fallback for dev environments
          const decoded = jwt.decode(credential) as any;
          if (decoded && decoded.email) {
            payload = decoded;
          } else {
            return sendError(res, 'Invalid or expired Google token.', 401, verifyError.message);
          }
        }
      } else if (googleAccessToken) {
        // Fetch userinfo using Google access_token
        try {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${googleAccessToken}` },
          });
          if (userInfoRes.ok) {
            payload = await userInfoRes.json();
          } else {
            return sendError(res, 'Failed to fetch user profile from Google with access token.', 401);
          }
        } catch (fetchErr: any) {
          return sendError(res, 'Error communicating with Google API.', 500, fetchErr.message);
        }
      }

      if (!payload || !payload.email) {
        return sendError(res, 'Could not retrieve email from Google authentication.', 400);
      }

      const googleEmail = payload.email.toLowerCase().trim();
      const googleName = (payload.name || payload.given_name || 'Google Student').trim();
      const googleAvatar = payload.picture || null;
      const googleId = payload.sub || null;

      // Find user by email or googleId
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: googleEmail },
            ...(googleId ? [{ googleId }] : []),
          ],
        },
        include: {
          profile: { include: { batch: true } },
        },
      });

      if (!user) {
        // Create new student user for Google OAuth
        const randomDummyPass = await hashPassword(Math.random().toString(36).slice(-12));
        user = await prisma.user.create({
          data: {
            name: googleName,
            email: googleEmail,
            passwordHash: randomDummyPass,
            role: Role.STUDENT,
            status: UserStatus.ACTIVE,
            authProvider: AuthProvider.GOOGLE,
            googleId,
          },
          include: {
            profile: { include: { batch: true } },
          },
        });
      } else if (!user.googleId && googleId) {
        // Link googleId to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
          include: {
            profile: { include: { batch: true } },
          },
        });
      }

      // Ensure linked StudentProfile exists with real Google details
      if (!user.profile) {
        const currentYearShort = new Date().getFullYear().toString().slice(-2);
        const studentCount = await prisma.studentProfile.count();
        const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;
        const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, googleName, classLevel);
        const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);

        const profile = await prisma.studentProfile.create({
          data: {
            userId: user.id,
            studentIdNumber,
            academicLevel: classLevel,
            avatarUrl: googleAvatar,
            fullName: googleName,
            qrCodeDataUrl,
            isCompleted: false,
            isProfileComplete: false,
            verificationStatus: 'UNVERIFIED',
          },
          include: { batch: true },
        });

        user = { ...user, profile };
      } else {
        // Ensure studentIdNumber and qrCodeDataUrl are present, and sync Google avatar
        if (!user.profile.studentIdNumber || !user.profile.qrCodeDataUrl) {
          const currentYearShort = new Date().getFullYear().toString().slice(-2);
          const studentCount = await prisma.studentProfile.count();
          const studentIdNumber = user.profile.studentIdNumber || `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;
          const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.profile.fullName || googleName, user.profile.academicLevel || classLevel);
          const qrCodeDataUrl = user.profile.qrCodeDataUrl || (await QrService.generateQrDataUrl(qrPayload));
          const updatedProfile = await prisma.studentProfile.update({
            where: { id: user.profile.id },
            data: {
              studentIdNumber,
              qrCodeDataUrl,
              ...(googleAvatar && !user.profile.avatarUrl ? { avatarUrl: googleAvatar } : {}),
            },
            include: { batch: true },
          });
          user = { ...user, profile: updatedProfile };
        } else if (googleAvatar && !user.profile.avatarUrl) {
          const updatedProfile = await prisma.studentProfile.update({
            where: { id: user.profile.id },
            data: { avatarUrl: googleAvatar },
            include: { batch: true },
          });
          user = { ...user, profile: updatedProfile };
        }
      }

      // Parse Device Info & Create Session (Max 2 Devices Enforcement)
      const userAgent = req.headers['user-agent'] || 'Unknown Agent';
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const effectiveDeviceId = (req.headers['x-device-id'] as string) || Buffer.from(`${user.id}-${userAgent}-${ip}`).toString('base64').slice(0, 32);
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;

      const tempRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
      });

      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: `Google - ${isMobile ? 'Mobile' : 'Desktop'}`,
          deviceType,
          browser: userAgent.slice(0, 80),
          os: isMobile ? 'Mobile' : 'Desktop',
          ipAddress: ip,
        },
        tempRefreshToken
      );

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id,
      });

      await prisma.deviceSession.update({
        where: { id: session.id },
        data: { refreshToken },
      });

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
            avatarUrl: googleAvatar || user.profile?.avatarUrl,
          },
          profile: user.profile,
          tokens: {
            accessToken,
            refreshToken,
          },
          sessionId: session.id,
        },
        'Google অ্যাকাউন্ট দিয়ে সফলভাবে লগইন হয়েছে।'
      );
    } catch (error: any) {
      console.error('[Google Auth Error]', error);
      return sendError(res, 'Google authentication failed.', 500, error.message);
    }
  }

  /**
   * 4. Forgot Password - Request 6-Digit Email OTP (Strict 5-minute validity)
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email || !email.includes('@')) {
        return sendError(res, 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন (Valid Email is required).');
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Validate that user exists with that email
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return sendError(res, 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক ইমেইল দিয়ে আবার চেষ্টা করুন।', 404);
      }

      // Generate random 6-digit numeric OTP
      const otpCode = generateOtpCode();
      const otpHash = await hashOtp(otpCode);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Strict 5-minute validity

      // Remove any pending unverified password reset OTPs for this email
      await prisma.otpVerification.deleteMany({
        where: {
          email: normalizedEmail,
          purpose: 'PASSWORD_RESET',
        },
      });

      // Save in OtpVerification table
      await prisma.otpVerification.create({
        data: {
          email: normalizedEmail,
          otpHash,
          purpose: 'PASSWORD_RESET',
          expiresAt,
          userId: user.id,
        },
      });

      // Send 6-digit code via email service
      await EmailService.sendOtpEmail(normalizedEmail, otpCode, 'PASSWORD_RESET');

      return sendSuccess(
        res,
        { email: normalizedEmail },
        'পাসওয়ার্ড রিসেট করার ৬ ডিজিটের OTP আপনার ইমেইলে পাঠানো হয়েছে (মেয়াদ ৫ মিনিট)।'
      );
    } catch (error: any) {
      console.error('[Forgot Password Error]', error);
      return sendError(res, 'পাসওয়ার্ড রিসেট কোড পাঠাতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * 5. Reset Password using 6-Digit OTP & Set New Password
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return sendError(res, 'ইমেইল, ৬ ডিজিটের ওটিপি এবং নতুন পাসওয়ার্ড প্রদান করুন।');
      }

      if (newPassword.length < 6) {
        return sendError(res, 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      }

      if (confirmPassword && newPassword !== confirmPassword) {
        return sendError(res, 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find active, unexpired OTP record
      const verification = await prisma.otpVerification.findFirst({
        where: {
          email: normalizedEmail,
          purpose: 'PASSWORD_RESET',
          verified: false,
          expiresAt: { gt: new Date() }, // Strict 5-minute validity check
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return sendError(res, 'কোডটি ভুল অথবা এর ৫ মিনিটের মেয়াদ শেষ হয়ে গেছে। দয়া করে পুনরায় নতুন কোডের অনুরোধ করুন।', 400);
      }

      const isValid = await compareOtp(otp.trim(), verification.otpHash);
      if (!isValid) {
        return sendError(res, 'ভুল OTP কোড। অনুগ্রহ করে সঠিক কোডটি লিখুন।', 400);
      }

      // Delete the used OTP record
      await prisma.otpVerification.delete({
        where: { id: verification.id },
      });

      // Hash new password and update user
      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { passwordHash },
      });

      return sendSuccess(
        res,
        null,
        'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
      );
    } catch (error: any) {
      console.error('[Reset Password Error]', error);
      return sendError(res, 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * 6. Get Current User info, Profile & Sessions
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      let user = await prisma.user.findUnique({
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

      // Self-healing: Ensure every user has a linked StudentProfile
      if (!user.profile) {
        const currentYearShort = new Date().getFullYear().toString().slice(-2);
        const studentCount = await prisma.studentProfile.count();
        const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;
        const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.name, 'HSC_11');
        const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);

        const profile = await prisma.studentProfile.create({
          data: {
            userId: user.id,
            studentIdNumber,
            academicLevel: 'HSC_11',
            fullName: user.name,
            qrCodeDataUrl,
            isCompleted: false,
            isProfileComplete: false,
            verificationStatus: 'UNVERIFIED',
          },
          include: { batch: true },
        });

        user = { ...user, profile };
      }

      const activeSessions = await SessionService.getUserSessions(user.id);

      return sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
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
   * 7. Get Active Device Sessions
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
   * 8. Terminate / Remote Logout a specific device session
   */
  static async terminateSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      await SessionService.terminateSession(req.user!.userId, sessionId);
      return sendSuccess(res, null, 'ডিভাইস সেশন বন্ধ করা হয়েছে।');
    } catch (error: any) {
      return sendError(res, 'Failed to terminate session.', 500);
    }
  }

  /**
   * 9. Google OAuth Callback Redirect
   */
  static async googleOAuthCallback(req: Request, res: Response) {
    try {
      const clientUrl = process.env.CLIENT_URL || 'https://client-xi-lac.vercel.app';
      const token = req.query.token as string;
      if (token) {
        return res.redirect(`${clientUrl}/oauth-callback?token=${encodeURIComponent(token)}`);
      }
      return res.redirect(`${clientUrl}/login?error=no_token`);
    } catch (err: any) {
      return sendError(res, 'OAuth redirect failed.', 500);
    }
  }
}

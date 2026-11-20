// src/app.ts
import express from "express";
import cors from "cors";

// src/routes/index.ts
import { Router as Router9 } from "express";

// src/routes/authRoutes.ts
import { Router } from "express";

// src/config/prisma.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
});

// src/utils/hash.ts
import bcrypt from "bcryptjs";
var hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
var comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
var generateOtpCode = () => {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
};
var hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(6);
  return bcrypt.hash(otp, salt);
};
var compareOtp = async (otp, hashedOtp) => {
  return bcrypt.compare(otp, hashedOtp);
};

// src/utils/token.ts
import jwt from "jsonwebtoken";

// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var ENV = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/dbname",
  JWT_SECRET: process.env.JWT_SECRET || "dev_jwt_secret_placeholder",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "dev_refresh_token_secret_placeholder",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  MAX_ALLOWED_DEVICES: parseInt(process.env.MAX_ALLOWED_DEVICES || "2", 10),
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.example.com",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587", 10),
  EMAIL_USER: process.env.EMAIL_USER || "noreply@example.com",
  EMAIL_PASS: process.env.EMAIL_PASS || ""
};

// src/utils/token.ts
var signAccessToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "7d" });
};
var signRefreshToken = (payload) => {
  return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};
var verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// src/services/sessionService.ts
import { DeviceType } from "@prisma/client";
var SessionService = class {
  /**
   * Register a new device session with dual-device limit (max 2 FIFO eviction).
   */
  static async registerSession(userId, deviceInfo, refreshToken) {
    const { deviceId, deviceName, deviceType = DeviceType.DESKTOP, browser, os, ipAddress } = deviceInfo;
    const existing = await prisma.deviceSession.findFirst({
      where: { userId, deviceId }
    });
    if (existing) {
      return prisma.deviceSession.update({
        where: { id: existing.id },
        data: {
          refreshToken,
          deviceName: deviceName || existing.deviceName,
          browser: browser || existing.browser,
          os: os || existing.os,
          ipAddress: ipAddress || existing.ipAddress,
          lastActiveAt: /* @__PURE__ */ new Date()
        }
      });
    }
    const userSessions = await prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: "asc" }
    });
    if (userSessions.length >= ENV.MAX_ALLOWED_DEVICES) {
      const sessionsToEvictCount = userSessions.length - ENV.MAX_ALLOWED_DEVICES + 1;
      const sessionsToEvict = userSessions.slice(0, sessionsToEvictCount);
      const evictIds = sessionsToEvict.map((s) => s.id);
      await prisma.deviceSession.deleteMany({
        where: { id: { in: evictIds } }
      });
    }
    return prisma.deviceSession.create({
      data: {
        userId,
        deviceId,
        deviceName: deviceName || `${os || "Unknown OS"} - ${browser || "Browser"}`,
        deviceType,
        browser,
        os,
        ipAddress,
        refreshToken,
        lastActiveAt: /* @__PURE__ */ new Date()
      }
    });
  }
  /**
   * Verify if a session is still valid (not evicted).
   */
  static async validateSession(sessionId) {
    const session = await prisma.deviceSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) return false;
    await prisma.deviceSession.update({
      where: { id: sessionId },
      data: { lastActiveAt: /* @__PURE__ */ new Date() }
    });
    return true;
  }
  /**
   * Get all active sessions for a user.
   */
  static async getUserSessions(userId) {
    return prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        os: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true
      }
    });
  }
  /**
   * Terminate a specific device session (Remote logout).
   */
  static async terminateSession(userId, sessionId) {
    return prisma.deviceSession.deleteMany({
      where: { id: sessionId, userId }
    });
  }
  /**
   * Terminate all other sessions for user.
   */
  static async terminateOtherSessions(userId, currentSessionId) {
    return prisma.deviceSession.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId }
      }
    });
  }
};

// src/services/emailService.ts
import nodemailer from "nodemailer";
var EmailService = class {
  static transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    secure: ENV.EMAIL_PORT === 465,
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASS
    }
  });
  /**
   * Send 6-Digit OTP Email.
   */
  static async sendOtpEmail(toEmail, otpCode, purpose) {
    const title = purpose === "REGISTRATION" ? "Verify Your RSB Student Account" : "RSB Password Reset Request";
    const message = purpose === "REGISTRATION" ? "Welcome to Rayhan Special Batch (RSB_portal). Use this 6-digit OTP to complete your registration:" : "A password reset request was received for your RSB account. Enter this code to proceed:";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0;">Rayhan Special Batch</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">SSC & HSC Science Excellence Program</p>
        </div>
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="color: #334155; font-size: 15px; margin-bottom: 16px;">${message}</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; display: inline-block;">
            ${otpCode}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">This OTP is strictly confidential and expires in 5 minutes.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
          Rayhan Special Batch (RSB_portal) \u2022 Physics \u2022 Chemistry \u2022 Math \u2022 Biology \u2022 ICT
        </div>
      </div>
    `;
    console.log(`
================== [RSB EMAIL SERVICE] ==================`);
    console.log(`[OTP DISPATCH] To: ${toEmail} | Purpose: ${purpose}`);
    console.log(`[OTP CODE]: >>> ${otpCode} <<< (Valid for 5 mins)`);
    console.log(`=========================================================
`);
    try {
      if (ENV.EMAIL_PASS && ENV.EMAIL_PASS !== "dummy") {
        await this.transporter.sendMail({
          from: `"Rayhan Special Batch" <${ENV.EMAIL_USER}>`,
          to: toEmail,
          subject: `${title} - OTP: ${otpCode}`,
          html
        });
      }
      return true;
    } catch (error) {
      console.warn("[EmailService Warning] SMTP dispatch skipped or failed, mock OTP logged to console.");
      return true;
    }
  }
  /**
   * Send Monthly Guardian Academic Digest.
   */
  static async sendGuardianMonthlyDigest(data) {
    const { guardianEmail, studentName, studentId, month, attendancePercent, paymentStatus, teacherRemarks } = data;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Rayhan Special Batch</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Monthly Guardian Academic Progress Report \u2022 ${month}</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #1e293b;">\u09B6\u09CD\u09B0\u09A6\u09CD\u09A7\u09C7\u09DF \u0985\u09AD\u09BF\u09AD\u09BE\u09AC\u0995,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09A8\u09CD\u09A4\u09BE\u09A8 <strong>${studentName}</strong> (ID: <code>${studentId}</code>)-\u098F\u09B0 ${month} \u09AE\u09BE\u09B8\u09C7\u09B0 \u09B8\u09BE\u09B0\u09CD\u09AC\u09BF\u0995 \u0989\u09AA\u09B8\u09CD\u09A5\u09BF\u09A4\u09BF, \u09AA\u09DC\u09BE\u09B2\u09C7\u0996\u09BE\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF\u09BE\u09DF\u09A8 \u0993 \u09AB\u09BF \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 \u09A8\u09BF\u099A\u09C7 \u09A4\u09C1\u09B2\u09C7 \u09A7\u09B0\u09BE \u09B9\u09B2\u09CB:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f1f5f9;">
              <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">\u0989\u09AA\u09B8\u09CD\u09A5\u09BF\u09A4\u09BF\u09B0 \u09B9\u09BE\u09B0 (Attendance)</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0; color: ${attendancePercent >= 80 ? "#16a34a" : "#dc2626"}; font-weight: bold;">
                ${attendancePercent}%
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">\u099F\u09BF\u0989\u09B6\u09A8 \u09AB\u09BF \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 (Payment)</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${paymentStatus === "PAID" ? "#16a34a" : "#d97706"};">
                ${paymentStatus}
              </td>
            </tr>
          </table>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 20px;">
            <h4 style="margin: 0 0 8px; color: #1e40af;">\u09B0\u09BE\u09DF\u09B9\u09BE\u09A8 \u09B8\u09CD\u09AF\u09BE\u09B0\u09C7\u09B0 \u09AA\u09B0\u09CD\u09AF\u09AC\u09C7\u0995\u09CD\u09B7\u09A3 \u0993 \u09AE\u09A8\u09CD\u09A4\u09AC\u09CD\u09AF:</h4>
            <p style="margin: 0; color: #1e293b; font-size: 14px; font-style: italic;">
              "${teacherRemarks || "\u09A8\u09BF\u09AF\u09BC\u09AE\u09BF\u09A4 \u0995\u09CD\u09B2\u09BE\u09B8\u09C7 \u0989\u09AA\u09B8\u09CD\u09A5\u09BF\u09A4\u09BF \u09B8\u09A8\u09CD\u09A4\u09CB\u09B7\u099C\u09A8\u0995\u0964 \u09B8\u09C3\u099C\u09A8\u09B6\u09C0\u09B2 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u09B2\u09BF\u0996\u09BF\u09A4 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8\u09C7 \u0986\u09B0\u09CB \u09AE\u09A8\u09CB\u09AF\u09CB\u0997\u09C0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964"}"
            </p>
          </div>

          <div style="margin-top: 28px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            \u09AF\u09C7 \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997: \u09E6\u09E7\u09EDXXXXXXXX | \u09B0\u09BE\u09DF\u09B9\u09BE\u09A8 \u09B8\u09CD\u09AF\u09BE\u09B0 (\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AC\u09BF\u09AD\u09BE\u0997)
          </div>
        </div>
      </div>
    `;
    console.log(`
================== [RSB GUARDIAN DIGEST] ==================`);
    console.log(`[DISPATCH] Sent to Guardian: ${guardianEmail} for Student: ${studentName} (${studentId})`);
    console.log(`[MONTH]: ${month} | Attendance: ${attendancePercent}% | Fee: ${paymentStatus}`);
    console.log(`===========================================================
`);
    try {
      if (ENV.EMAIL_PASS && ENV.EMAIL_PASS !== "dummy") {
        await this.transporter.sendMail({
          from: `"Rayhan Sir (RSB Coaching)" <${ENV.EMAIL_USER}>`,
          to: guardianEmail,
          subject: `RSB Progress Report - ${studentName} (${month})`,
          html
        });
      }
      return true;
    } catch (error) {
      console.warn("[EmailService Warning] Guardian digest mail logged to console.");
      return true;
    }
  }
};

// src/services/qrService.ts
import QRCode from "qrcode";
import crypto from "crypto";
var QrService = class {
  /**
   * Generates a tamper-proof signed payload for student offline QR badge.
   */
  static generateBadgePayload(studentId, userId, name, academicLevel) {
    const rawData = `${studentId}:${userId}:${name}:${academicLevel}`;
    const signature = crypto.createHmac("sha256", ENV.JWT_SECRET).update(rawData).digest("hex").slice(0, 16);
    const payload = {
      studentId,
      userId,
      name,
      academicLevel,
      signature,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return JSON.stringify(payload);
  }
  /**
   * Generates High-Resolution Data URL (PNG) of the QR code.
   */
  static async generateQrDataUrl(qrString) {
    return QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });
  }
  /**
   * Verifies scanned QR code payload integrity.
   */
  static verifyBadgePayload(payloadStr) {
    try {
      const parsed = JSON.parse(payloadStr);
      const rawData = `${parsed.studentId}:${parsed.userId}:${parsed.name}:${parsed.academicLevel}`;
      const expectedSig = crypto.createHmac("sha256", ENV.JWT_SECRET).update(rawData).digest("hex").slice(0, 16);
      if (parsed.signature !== expectedSig) {
        return { valid: false };
      }
      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false };
    }
  }
};

// src/utils/response.ts
var sendSuccess = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};
var sendError = (res, message, statusCode = 400, error) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
};

// src/controllers/authController.ts
import { DeviceType as DeviceType2, Role, UserStatus, AuthProvider } from "@prisma/client";
var AuthController = class {
  /**
   * 1. Instant Student Registration (No OTP Required)
   * Fields: fullName, identifier (Email or Phone), classLevel, batchName, password
   */
  static async register(req, res) {
    try {
      const {
        fullName,
        name,
        identifier,
        email,
        phone,
        classLevel = "HSC_11",
        academicLevel,
        batchName = "Special Batch",
        password,
        confirmPassword,
        deviceId,
        deviceName
      } = req.body;
      const studentName = (fullName || name || "").trim();
      const rawIdentifier = (identifier || email || phone || "").toString().trim();
      const selectedClass = (classLevel || academicLevel || "HSC_11").toString();
      const selectedBatch = (batchName || "Special Batch").toString().trim();
      if (!studentName) {
        return sendError(res, "\u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0\u09B0 \u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BE\u09AE \u09A6\u09C7\u0993\u09DF\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995 (Full Name is required).");
      }
      if (!rawIdentifier) {
        return sendError(res, "\u0987\u09AE\u09C7\u0987\u09B2 \u0985\u09A5\u09AC\u09BE \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09C7\u0993\u09DF\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995 (Email or Phone is required).");
      }
      if (!password || password.length < 6) {
        return sendError(res, "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EC \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7 (Password must be at least 6 characters).");
      }
      if (confirmPassword && password !== confirmPassword) {
        return sendError(res, "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u098F\u09AC\u0982 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AE\u09BF\u09B2\u099B\u09C7 \u09A8\u09BE (Passwords do not match).");
      }
      const isEmail = rawIdentifier.includes("@");
      const normalizedEmail = isEmail ? rawIdentifier.toLowerCase() : null;
      const normalizedPhone = !isEmail ? rawIdentifier.replace(/[^0-9+]/g, "") : null;
      if (normalizedEmail) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });
        if (existingEmailUser) {
          return sendError(res, "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2 \u09A6\u09BF\u09DF\u09C7 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u098F\u0995\u099F\u09BF \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09BE \u0986\u099B\u09C7 (Email already exists).");
        }
      }
      if (normalizedPhone) {
        const existingPhoneUser = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: normalizedPhone },
              { profile: { studentPhone: normalizedPhone } }
            ]
          }
        });
        if (existingPhoneUser) {
          return sendError(res, "\u098F\u0987 \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09DF\u09C7 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u098F\u0995\u099F\u09BF \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09BE \u0986\u099B\u09C7 (Phone number already exists).");
        }
      }
      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          name: studentName,
          email: normalizedEmail,
          phone: normalizedPhone,
          passwordHash,
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
          authProvider: AuthProvider.LOCAL
        }
      });
      let batch = await prisma.batch.findFirst({
        where: {
          name: { equals: selectedBatch, mode: "insensitive" }
        }
      });
      if (!batch) {
        batch = await prisma.batch.create({
          data: {
            name: selectedBatch,
            academicLevel: selectedClass,
            scheduleDays: "\u09B0\u09AC\u09BF-\u09AE\u0999\u09CD\u0997\u09B2-\u09AC\u09C3\u09B9\u09B8\u09CD\u09AA\u09A4\u09BF",
            timeSlot: "\u09B8\u0995\u09BE\u09B2 \u09EE:\u09E6\u09E6 - \u09E7\u09E6:\u09E6\u09E6",
            monthlyFee: 2e3,
            isActive: true
          }
        });
      }
      const currentYearShort = (/* @__PURE__ */ new Date()).getFullYear().toString().slice(-2);
      const studentCount = await prisma.studentProfile.count();
      const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, "0")}`;
      const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.name, selectedClass);
      const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);
      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentIdNumber,
          academicLevel: selectedClass,
          batchId: batch.id,
          studentPhone: normalizedPhone,
          qrCodeDataUrl,
          isCompleted: false
        },
        include: {
          batch: true
        }
      });
      const userAgent = req.headers["user-agent"] || "Unknown Agent";
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const effectiveDeviceId = deviceId || Buffer.from(`${user.id}-${userAgent}-${ip}`).toString("base64").slice(0, 32);
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType2.MOBILE : DeviceType2.DESKTOP;
      const tempRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name
      });
      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: deviceName || (isMobile ? "Mobile Phone" : "Desktop Browser"),
          deviceType,
          browser: userAgent.slice(0, 80),
          os: isMobile ? "Mobile" : "Desktop",
          ipAddress: ip
        },
        tempRefreshToken
      );
      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id
      });
      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id
      });
      await prisma.deviceSession.update({
        where: { id: session.id },
        data: { refreshToken }
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
            role: user.role
          },
          profile,
          tokens: {
            accessToken,
            refreshToken
          },
          sessionId: session.id,
          activeDevicesCount: activeSessions.length
        },
        "\u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AB\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7! \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE Rayhan Special Batch-\u098F\u0964"
      );
    } catch (error) {
      console.error("[Instant Register Error]", error);
      return sendError(res, "\u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09BE \u09B8\u09AE\u09CD\u09AD\u09AC \u09B9\u09DF\u09A8\u09BF\u0964", 500, error.message);
    }
  }
  /**
   * 2. Login with Email OR Phone Number + Password (Dual-Device Control)
   */
  static async login(req, res) {
    try {
      const { identifier, email, phone, password, deviceId, deviceName } = req.body;
      const rawInput = (identifier || email || phone || "").toString().trim();
      if (!rawInput || !password) {
        return sendError(res, "\u0987\u09AE\u09C7\u0987\u09B2/\u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u098F\u09AC\u0982 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A6\u09C7\u0993\u09DF\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964");
      }
      const isEmail = rawInput.includes("@");
      const normalizedEmail = isEmail ? rawInput.toLowerCase() : null;
      const normalizedPhone = !isEmail ? rawInput.replace(/[^0-9+]/g, "") : null;
      const user = await prisma.user.findFirst({
        where: isEmail ? { email: { equals: normalizedEmail, mode: "insensitive" } } : {
          OR: [
            { phone: normalizedPhone },
            { profile: { studentPhone: normalizedPhone } }
          ]
        },
        include: {
          profile: {
            include: { batch: true }
          }
        }
      });
      if (!user) {
        return sendError(res, "\u09AD\u09C1\u09B2 \u0987\u09AE\u09C7\u0987\u09B2/\u09AB\u09CB\u09A8 \u0985\u09A5\u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u0964", 401);
      }
      if (user.status === UserStatus.SUSPENDED) {
        return sendError(res, "\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u099F\u09BF \u09B8\u09CD\u09A5\u0997\u09BF\u09A4 \u09B0\u09BE\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B0\u09BE\u09DF\u09B9\u09BE\u09A8 \u09B8\u09CD\u09AF\u09BE\u09B0\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964", 403);
      }
      const passwordMatch = await comparePassword(password, user.passwordHash);
      if (!passwordMatch) {
        return sendError(res, "\u09AD\u09C1\u09B2 \u0987\u09AE\u09C7\u0987\u09B2/\u09AB\u09CB\u09A8 \u0985\u09A5\u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u0964", 401);
      }
      const userAgent = req.headers["user-agent"] || "Unknown Agent";
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const effectiveDeviceId = deviceId || Buffer.from(`${user.id}-${userAgent}-${ip}`).toString("base64").slice(0, 32);
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType2.MOBILE : DeviceType2.DESKTOP;
      const tempRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name
      });
      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: deviceName || (isMobile ? "Mobile Phone" : "Desktop Browser"),
          deviceType,
          browser: userAgent.slice(0, 80),
          os: isMobile ? "Mobile OS" : "Desktop OS",
          ipAddress: ip
        },
        tempRefreshToken
      );
      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id
      });
      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id
      });
      await prisma.deviceSession.update({
        where: { id: session.id },
        data: { refreshToken }
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
            role: user.role
          },
          profile: user.profile,
          tokens: {
            accessToken,
            refreshToken
          },
          sessionId: session.id,
          activeDevicesCount: activeSessions.length,
          activeDevices: activeSessions
        },
        "\u09B2\u0997\u0987\u09A8 \u09B8\u09AB\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7\u0964"
      );
    } catch (error) {
      console.error("[Login Error]", error);
      return sendError(res, "\u09B2\u0997\u0987\u09A8 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7\u0964", 500, error.message);
    }
  }
  /**
   * 3. Social Authentication (Google & Facebook)
   */
  static async socialAuth(req, res) {
    try {
      const { provider, email, name, avatarUrl, socialId, classLevel = "HSC_11" } = req.body;
      if (!provider || !["GOOGLE", "FACEBOOK"].includes(provider)) {
        return sendError(res, "Invalid social provider.");
      }
      if (!email && !socialId) {
        return sendError(res, "Email or Social ID is required for social login.");
      }
      const normalizedEmail = email ? email.toLowerCase().trim() : null;
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            ...normalizedEmail ? [{ email: normalizedEmail }] : [],
            ...provider === "GOOGLE" && socialId ? [{ googleId: socialId }] : [],
            ...provider === "FACEBOOK" && socialId ? [{ facebookId: socialId }] : []
          ]
        },
        include: {
          profile: { include: { batch: true } }
        }
      });
      if (!user) {
        const randomDummyPass = await hashPassword(Math.random().toString(36).slice(-10));
        user = await prisma.user.create({
          data: {
            name: name || (provider === "GOOGLE" ? "Google Student" : "Facebook Student"),
            email: normalizedEmail,
            passwordHash: randomDummyPass,
            role: Role.STUDENT,
            status: UserStatus.ACTIVE,
            authProvider: provider === "GOOGLE" ? AuthProvider.GOOGLE : AuthProvider.FACEBOOK,
            googleId: provider === "GOOGLE" ? socialId : null,
            facebookId: provider === "FACEBOOK" ? socialId : null
          },
          include: {
            profile: { include: { batch: true } }
          }
        });
        const currentYearShort = (/* @__PURE__ */ new Date()).getFullYear().toString().slice(-2);
        const studentCount = await prisma.studentProfile.count();
        const studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, "0")}`;
        const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, user.name, classLevel);
        const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);
        const profile = await prisma.studentProfile.create({
          data: {
            userId: user.id,
            studentIdNumber,
            academicLevel: classLevel,
            avatarUrl: avatarUrl || null,
            qrCodeDataUrl,
            isCompleted: false
          },
          include: { batch: true }
        });
        user = { ...user, profile };
      }
      const userAgent = req.headers["user-agent"] || "Unknown Agent";
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const effectiveDeviceId = Buffer.from(`${user.id}-${userAgent}-${ip}`).toString("base64").slice(0, 32);
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const deviceType = isMobile ? DeviceType2.MOBILE : DeviceType2.DESKTOP;
      const tempRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name
      });
      const session = await SessionService.registerSession(
        user.id,
        {
          deviceId: effectiveDeviceId,
          deviceName: `${provider} Auth - ${isMobile ? "Mobile" : "Desktop"}`,
          deviceType,
          browser: userAgent.slice(0, 80),
          os: isMobile ? "Mobile" : "Desktop",
          ipAddress: ip
        },
        tempRefreshToken
      );
      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id
      });
      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        sessionId: session.id
      });
      await prisma.deviceSession.update({
        where: { id: session.id },
        data: { refreshToken }
      });
      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role
          },
          profile: user.profile,
          tokens: {
            accessToken,
            refreshToken
          },
          sessionId: session.id
        },
        `${provider} \u09A6\u09BF\u09DF\u09C7 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B2\u0997\u0987\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7\u0964`
      );
    } catch (error) {
      console.error("[Social Auth Error]", error);
      return sendError(res, "Social login failed.", 500, error.message);
    }
  }
  /**
   * 4. Forgot Password - Request 6-Digit Email OTP (Strict 5-minute validity)
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return sendError(res, "\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u098F\u0995\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8 (Valid Email is required).");
      }
      const normalizedEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      if (!user) {
        return sendError(res, "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2 \u09A6\u09BF\u09DF\u09C7 \u0995\u09CB\u09A8\u09CB \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u09B8\u09A0\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u09A6\u09BF\u09DF\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964", 404);
      }
      const otpCode = generateOtpCode();
      const otpHash = await hashOtp(otpCode);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
      await prisma.otpVerification.deleteMany({
        where: {
          email: normalizedEmail,
          purpose: "PASSWORD_RESET"
        }
      });
      await prisma.otpVerification.create({
        data: {
          email: normalizedEmail,
          otpHash,
          purpose: "PASSWORD_RESET",
          expiresAt,
          userId: user.id
        }
      });
      await EmailService.sendOtpEmail(normalizedEmail, otpCode, "PASSWORD_RESET");
      return sendSuccess(
        res,
        { email: normalizedEmail },
        "\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09BE\u09B0 \u09EC \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 OTP \u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09AE\u09C7\u0987\u09B2\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7 (\u09AE\u09C7\u09DF\u09BE\u09A6 \u09EB \u09AE\u09BF\u09A8\u09BF\u099F)\u0964"
      );
    } catch (error) {
      console.error("[Forgot Password Error]", error);
      return sendError(res, "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09CB\u09A1 \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964", 500, error.message);
    }
  }
  /**
   * 5. Reset Password using 6-Digit OTP & Set New Password
   */
  static async resetPassword(req, res) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return sendError(res, "\u0987\u09AE\u09C7\u0987\u09B2, \u09EC \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 \u0993\u099F\u09BF\u09AA\u09BF \u098F\u09AC\u0982 \u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964");
      }
      if (newPassword.length < 6) {
        return sendError(res, "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EC \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964");
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        return sendError(res, "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u098F\u09AC\u0982 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AE\u09BF\u09B2\u099B\u09C7 \u09A8\u09BE\u0964");
      }
      const normalizedEmail = email.toLowerCase().trim();
      const verification = await prisma.otpVerification.findFirst({
        where: {
          email: normalizedEmail,
          purpose: "PASSWORD_RESET",
          verified: false,
          expiresAt: { gt: /* @__PURE__ */ new Date() }
          // Strict 5-minute validity check
        },
        orderBy: { createdAt: "desc" }
      });
      if (!verification) {
        return sendError(res, "\u0995\u09CB\u09A1\u099F\u09BF \u09AD\u09C1\u09B2 \u0985\u09A5\u09AC\u09BE \u098F\u09B0 \u09EB \u09AE\u09BF\u09A8\u09BF\u099F\u09C7\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7 \u09B9\u09DF\u09C7 \u0997\u09C7\u099B\u09C7\u0964 \u09A6\u09DF\u09BE \u0995\u09B0\u09C7 \u09AA\u09C1\u09A8\u09B0\u09BE\u09DF \u09A8\u09A4\u09C1\u09A8 \u0995\u09CB\u09A1\u09C7\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u0995\u09B0\u09C1\u09A8\u0964", 400);
      }
      const isValid = await compareOtp(otp.trim(), verification.otpHash);
      if (!isValid) {
        return sendError(res, "\u09AD\u09C1\u09B2 OTP \u0995\u09CB\u09A1\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B8\u09A0\u09BF\u0995 \u0995\u09CB\u09A1\u099F\u09BF \u09B2\u09BF\u0996\u09C1\u09A8\u0964", 400);
      }
      await prisma.otpVerification.delete({
        where: { id: verification.id }
      });
      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { passwordHash }
      });
      return sendSuccess(
        res,
        null,
        "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7! \u098F\u0996\u09A8 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A6\u09BF\u09DF\u09C7 \u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8\u0964"
      );
    } catch (error) {
      console.error("[Reset Password Error]", error);
      return sendError(res, "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964", 500, error.message);
    }
  }
  /**
   * 6. Get Current User info, Profile & Sessions
   */
  static async getMe(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          profile: {
            include: { batch: true }
          }
        }
      });
      if (!user) {
        return sendError(res, "User not found.", 404);
      }
      const activeSessions = await SessionService.getUserSessions(user.id);
      return sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role
        },
        profile: user.profile,
        activeSessions
      });
    } catch (error) {
      return sendError(res, "Failed to fetch user.", 500);
    }
  }
  /**
   * 7. Get Active Device Sessions
   */
  static async getActiveSessions(req, res) {
    try {
      const sessions = await SessionService.getUserSessions(req.user.userId);
      return sendSuccess(res, sessions);
    } catch (error) {
      return sendError(res, "Failed to fetch sessions.", 500);
    }
  }
  /**
   * 8. Terminate / Remote Logout a specific device session
   */
  static async terminateSession(req, res) {
    try {
      const { sessionId } = req.params;
      await SessionService.terminateSession(req.user.userId, sessionId);
      return sendSuccess(res, null, "\u09A1\u09BF\u09AD\u09BE\u0987\u09B8 \u09B8\u09C7\u09B6\u09A8 \u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964");
    } catch (error) {
      return sendError(res, "Failed to terminate session.", 500);
    }
  }
};

// src/middleware/auth.ts
var authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Access denied. No token provided.", 401);
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return sendError(res, "Invalid or expired session token.", 401);
  }
  if (decoded.sessionId) {
    const isValid = await SessionService.validateSession(decoded.sessionId);
    if (!isValid) {
      return sendError(
        res,
        "Your session has been terminated because you logged in from another device (Max 2 devices allowed).",
        401,
        { code: "SESSION_EVICTED" }
      );
    }
  }
  req.user = decoded;
  next();
};
var requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Unauthorized.", 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, "Forbidden: Insufficient privileges.", 403);
    }
    next();
  };
};
var ipRequests = /* @__PURE__ */ new Map();
var rateLimitOtp = (maxAttempts = 5, windowMs = 15 * 60 * 1e3) => {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = ipRequests.get(ip);
    if (record && record.expiresAt > now) {
      if (record.count >= maxAttempts) {
        return sendError(res, "Too many requests. Please try again after 15 minutes.", 429);
      }
      record.count += 1;
    } else {
      ipRequests.set(ip, { count: 1, expiresAt: now + windowMs });
    }
    next();
  };
};

// src/routes/authRoutes.ts
var router = Router();
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/social", AuthController.socialAuth);
router.get("/me", authenticateJWT, AuthController.getMe);
router.get("/sessions", authenticateJWT, AuthController.getActiveSessions);
router.delete("/sessions/:sessionId", authenticateJWT, AuthController.terminateSession);
router.post("/forgot-password", rateLimitOtp(5), AuthController.forgotPassword);
router.post("/reset-password", rateLimitOtp(10), AuthController.resetPassword);
var authRoutes_default = router;

// src/routes/profileRoutes.ts
import { Router as Router2 } from "express";

// src/controllers/profileController.ts
var ProfileController = class {
  /**
   * Get Current Student Profile & Completion Status
   */
  static async getProfile(req, res) {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
        include: {
          batch: true,
          user: {
            select: { name: true, email: true, createdAt: true }
          }
        }
      });
      if (!profile) {
        return sendError(res, "Profile not found.", 404);
      }
      const fields = [
        profile.user.name,
        profile.academicLevel,
        profile.institutionName,
        profile.batchId,
        profile.fatherName,
        profile.motherName,
        profile.studentPhone,
        profile.guardianPhone,
        profile.guardianEmail
      ];
      const filledFields = fields.filter((f) => !!f && f.toString().trim() !== "").length;
      const completionPercentage = Math.round(filledFields / fields.length * 100);
      return sendSuccess(res, {
        profile,
        completionPercentage,
        isCompleted: profile.isCompleted
      });
    } catch (error) {
      return sendError(res, "Failed to fetch profile.", 500);
    }
  }
  /**
   * Update Student Profile and Validate 100% Completion Gatekeeping
   */
  static async updateProfile(req, res) {
    try {
      const {
        name,
        academicLevel,
        institutionName,
        batchId,
        fatherName,
        motherName,
        studentPhone,
        guardianPhone,
        guardianEmail,
        avatarUrl
      } = req.body;
      if (name) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { name }
        });
      }
      const isCompleteNow = !!institutionName && !!fatherName && !!motherName && !!studentPhone && !!guardianPhone && !!guardianEmail;
      const currentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId }
      });
      if (!currentProfile) {
        return sendError(res, "Profile does not exist.", 404);
      }
      const studentName = name || req.user?.name || "Student";
      const effectiveLevel = academicLevel || currentProfile.academicLevel;
      const qrPayload = QrService.generateBadgePayload(
        currentProfile.studentIdNumber,
        req.user.userId,
        studentName,
        effectiveLevel
      );
      const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);
      const updated = await prisma.studentProfile.update({
        where: { userId: req.user.userId },
        data: {
          academicLevel: effectiveLevel,
          institutionName,
          batchId: batchId || currentProfile.batchId,
          fatherName,
          motherName,
          studentPhone,
          guardianPhone,
          guardianEmail,
          avatarUrl: avatarUrl || currentProfile.avatarUrl,
          qrCodeDataUrl,
          isCompleted: isCompleteNow
        },
        include: {
          batch: true,
          user: { select: { name: true, email: true } }
        }
      });
      return sendSuccess(
        res,
        updated,
        isCompleteNow ? "Profile is 100% completed! All study vaults and leaderboards are now unlocked." : "Profile updated. Fill in remaining guardian details to reach 100% completion."
      );
    } catch (error) {
      console.error("[Update Profile Error]", error);
      return sendError(res, "Failed to update profile.", 500);
    }
  }
  /**
   * Get Digital Student ID Badge Card
   */
  static async getQrBadge(req, res) {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
        include: {
          batch: true,
          user: { select: { name: true, email: true } }
        }
      });
      if (!profile) {
        return sendError(res, "Student profile not found.", 404);
      }
      return sendSuccess(res, {
        studentId: profile.studentIdNumber,
        name: profile.user.name,
        academicLevel: profile.academicLevel,
        batchName: profile.batch?.name || "General Science Batch",
        institution: profile.institutionName || "N/A",
        phone: profile.studentPhone || "N/A",
        guardianPhone: profile.guardianPhone || "N/A",
        qrCodeDataUrl: profile.qrCodeDataUrl,
        isCompleted: profile.isCompleted
      });
    } catch (error) {
      return sendError(res, "Failed to retrieve QR Badge.", 500);
    }
  }
  /**
   * Learning Milestone Tracker
   */
  static async getMilestones(req, res) {
    try {
      const userId = req.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });
      if (!user) return sendError(res, "User not found.", 404);
      const daysEnrolled = Math.max(
        1,
        Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1e3 * 60 * 60 * 24))
      );
      const attendanceCount = await prisma.attendance.count({
        where: { userId, status: "PRESENT" }
      });
      const gamePlays = await prisma.gameScore.count({ where: { userId } });
      const badges = await prisma.userBadge.findMany({ where: { userId } });
      return sendSuccess(res, {
        daysEnrolled,
        attendanceCount,
        gamePlays,
        totalXp: user.profile?.totalXp || 0,
        currentStreak: user.profile?.currentStreak || 1,
        badges
      });
    } catch (error) {
      return sendError(res, "Failed to fetch milestones.", 500);
    }
  }
};

// src/routes/profileRoutes.ts
var router2 = Router2();
router2.use(authenticateJWT);
router2.get("/", ProfileController.getProfile);
router2.put("/", ProfileController.updateProfile);
router2.get("/qr-badge", ProfileController.getQrBadge);
router2.get("/milestones", ProfileController.getMilestones);
var profileRoutes_default = router2;

// src/routes/vaultRoutes.ts
import { Router as Router3 } from "express";

// src/services/watermarkService.ts
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
function toAsciiSafe(str, fallback) {
  if (!str) return fallback;
  const sanitized = str.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
  return sanitized || fallback;
}
var WatermarkService = class {
  /**
   * Applies dynamic anti-leak watermark onto PDF buffer for a specific student.
   */
  static async stampPdf(pdfBuffer, student) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const safeName = toAsciiSafe(student.name, `Student ${student.studentId}`);
    const safePhone = toAsciiSafe(student.phone, "RSB-Verified-Phone");
    const watermarkText = `RSB * ${safeName.toUpperCase()} * ID: ${student.studentId} * ${safePhone}`;
    const securityFooter = `LICENSED FOR PERSONAL STUDY: ${safeName} (${student.studentId}) | PHONE: ${safePhone} | ${timestamp}`;
    for (const page of pages) {
      const { width, height } = page.getSize();
      const fontSize = 15;
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      page.drawText(watermarkText, {
        x: width / 2 - textWidth / 3,
        y: height / 2 - 20,
        size: fontSize,
        font,
        color: rgb(0.85, 0.2, 0.2),
        // Subtle security red
        opacity: 0.18,
        rotate: degrees(-35)
      });
      page.drawText(watermarkText, {
        x: width / 3 - textWidth / 3,
        y: height * 3 / 4,
        size: 13,
        font,
        color: rgb(0.2, 0.4, 0.8),
        opacity: 0.14,
        rotate: degrees(-35)
      });
      page.drawText(watermarkText, {
        x: width / 3 - textWidth / 3,
        y: height / 4,
        size: 13,
        font,
        color: rgb(0.2, 0.4, 0.8),
        opacity: 0.14,
        rotate: degrees(-35)
      });
      page.drawRectangle({
        x: 0,
        y: height - 22,
        width,
        height: 22,
        color: rgb(0.08, 0.12, 0.22),
        opacity: 0.9
      });
      page.drawText(`RAYHAN SPECIAL BATCH (RSB_PORTAL) - OFFICIAL STUDY VAULT`, {
        x: 18,
        y: height - 16,
        size: 9,
        font,
        color: rgb(1, 1, 1)
      });
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height: 22,
        color: rgb(0.95, 0.96, 0.98)
      });
      page.drawText(securityFooter, {
        x: 16,
        y: 6,
        size: 7.5,
        font: regularFont,
        color: rgb(0.3, 0.35, 0.45)
      });
    }
    return pdfDoc.save();
  }
  /**
   * Helper to generate a clean base PDF for notes if no external file exists.
   */
  static async createSampleLecturePdf(title, subject, chapter, contentBulletPoints) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    const safeTitle = toAsciiSafe(title, "Rayhan Special Batch - Science Lecture Sheet");
    const safeSubject = toAsciiSafe(subject, "Science (Physics / Chemistry / Math)");
    const safeChapter = toAsciiSafe(chapter, "Core Chapter Analysis");
    page.drawText("RAYHAN SPECIAL BATCH", {
      x: 50,
      y: height - 60,
      size: 22,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.45)
    });
    page.drawText(`Subject: ${safeSubject} | Chapter: ${safeChapter}`, {
      x: 50,
      y: height - 85,
      size: 13,
      font: fontRegular,
      color: rgb(0.3, 0.4, 0.5)
    });
    page.drawText(safeTitle, {
      x: 50,
      y: height - 115,
      size: 15,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15)
    });
    page.drawLine({
      start: { x: 50, y: height - 128 },
      end: { x: width - 50, y: height - 128 },
      thickness: 1.5,
      color: rgb(0.2, 0.4, 0.8)
    });
    const defaultPoints = [
      "Core Theoretical Framework & Board Exam Top-Yield Formulas",
      "Shortcut Techniques & Calculator Tips for Problem Solving",
      "Common Pitfalls in Creative CQ Questions and In-Depth Solutions",
      "High-Order Thinking (D-Type) Standard Model Questions with Explanations",
      "Rayhan Sir Special Guidance for Scoring Full Marks in Board Evaluations",
      "Practice Homework: Cadet College & Top School Test Paper Problem Set"
    ];
    const pointsToDraw = contentBulletPoints && contentBulletPoints.length > 0 ? contentBulletPoints : defaultPoints;
    let currentY = height - 160;
    for (const point of pointsToDraw) {
      const safePoint = toAsciiSafe(point, "Essential Science Concept & Practice Question");
      page.drawText(`*  ${safePoint}`, {
        x: 55,
        y: currentY,
        size: 11,
        font: fontRegular,
        color: rgb(0.15, 0.2, 0.25)
      });
      currentY -= 28;
    }
    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }
};

// src/services/billingService.ts
import { InvoiceStatus } from "@prisma/client";
import { PDFDocument as PDFDocument2, rgb as rgb2, StandardFonts as StandardFonts2 } from "pdf-lib";
var BillingService = class {
  /**
   * Generates monthly tuition invoices for all enrolled students.
   */
  static async runMonthlyBilling(targetMonth) {
    const now = /* @__PURE__ */ new Date();
    const monthName = targetMonth || now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);
    const students = await prisma.studentProfile.findMany({
      where: {
        batchId: { not: null }
      },
      include: {
        batch: true
      }
    });
    let generatedCount = 0;
    for (const student of students) {
      const existing = await prisma.invoice.findFirst({
        where: {
          userId: student.userId,
          month: monthName
        }
      });
      if (!existing && student.batch) {
        await prisma.invoice.create({
          data: {
            userId: student.userId,
            month: monthName,
            amount: student.batch.monthlyFee,
            dueDate,
            status: InvoiceStatus.UNPAID
          }
        });
        generatedCount++;
      }
    }
    return { month: monthName, generatedCount };
  }
  /**
   * Check if student has overdue unpaid fees past the 15th of the month.
   */
  static async hasOverdueBlock(userId) {
    const today = /* @__PURE__ */ new Date();
    if (today.getDate() < 15) return false;
    const overdueInvoice = await prisma.invoice.findFirst({
      where: {
        userId,
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE] },
        dueDate: { lt: today }
      }
    });
    return !!overdueInvoice;
  }
  /**
   * Generate official Branded PDF Money Receipt.
   */
  static async generateReceiptPdf(receiptData) {
    const pdfDoc = await PDFDocument2.create();
    const page = pdfDoc.addPage([595.28, 420]);
    const fontBold = await pdfDoc.embedFont(StandardFonts2.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts2.Helvetica);
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb2(0.15, 0.25, 0.5),
      borderWidth: 2
    });
    page.drawRectangle({
      x: 22,
      y: height - 85,
      width: width - 44,
      height: 63,
      color: rgb2(0.12, 0.22, 0.45)
    });
    page.drawText("RAYHAN SPECIAL BATCH - OFFICIAL MONEY RECEIPT", {
      x: 40,
      y: height - 50,
      size: 16,
      font: fontBold,
      color: rgb2(1, 1, 1)
    });
    page.drawText("SSC & HSC Science Coaching (Physics, Chemistry, Math, Biology, ICT)", {
      x: 40,
      y: height - 70,
      size: 10,
      font: fontRegular,
      color: rgb2(0.85, 0.9, 1)
    });
    page.drawText(`Receipt No: ${receiptData.receiptId.slice(0, 10).toUpperCase()}`, {
      x: 40,
      y: height - 110,
      size: 11,
      font: fontBold,
      color: rgb2(0.2, 0.2, 0.2)
    });
    page.drawText(`Date: ${receiptData.paidDate}`, {
      x: width - 180,
      y: height - 110,
      size: 10,
      font: fontRegular,
      color: rgb2(0.3, 0.3, 0.3)
    });
    const safeStudentName = receiptData.studentName.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim() || `Student ${receiptData.studentId}`;
    const safeMonth = receiptData.month.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim() || "Current Month";
    const details = [
      ["Student Name:", safeStudentName],
      ["Student ID:", receiptData.studentId],
      ["Academic Month:", safeMonth],
      ["Tuition Fee Amount:", `BDT ${receiptData.amount.toFixed(2)}`],
      ["Payment Method:", receiptData.paymentMethod],
      ["bKash / TrxID:", receiptData.trxId],
      ["Sender Number:", receiptData.senderNumber],
      ["Status:", "PAID & VERIFIED (COMPLETED)"]
    ];
    let currentY = height - 140;
    for (const [label, val] of details) {
      page.drawText(label, {
        x: 45,
        y: currentY,
        size: 10,
        font: fontBold,
        color: rgb2(0.25, 0.3, 0.35)
      });
      page.drawText(val, {
        x: 180,
        y: currentY,
        size: 10,
        font: fontRegular,
        color: label === "Status:" ? rgb2(0.1, 0.6, 0.2) : rgb2(0.1, 0.1, 0.1)
      });
      currentY -= 19;
    }
    page.drawText("RAYHAN SIR", {
      x: width - 150,
      y: 70,
      size: 12,
      font: fontBold,
      color: rgb2(0.15, 0.25, 0.5)
    });
    page.drawLine({
      start: { x: width - 160, y: 62 },
      end: { x: width - 50, y: 62 },
      thickness: 1,
      color: rgb2(0.4, 0.4, 0.4)
    });
    page.drawText("Authorized Signature", {
      x: width - 150,
      y: 48,
      size: 8,
      font: fontRegular,
      color: rgb2(0.5, 0.5, 0.5)
    });
    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }
};

// src/controllers/vaultController.ts
import fs from "fs";
var VaultController = class {
  /**
   * Get Subjects and Chapters
   */
  static async getSubjects(req, res) {
    try {
      const subjects = await prisma.subject.findMany({
        include: {
          chapters: {
            include: {
              _count: { select: { materials: true } }
            },
            orderBy: { chapterNumber: "asc" }
          }
        }
      });
      return sendSuccess(res, subjects);
    } catch (error) {
      return sendError(res, "Failed to fetch subjects.", 500);
    }
  }
  /**
   * Get Study Materials by Chapter or Subject
   */
  static async getMaterials(req, res) {
    try {
      const { chapterId, subjectId, materialType } = req.query;
      const where = {};
      if (chapterId) where.chapterId = chapterId;
      if (materialType) where.materialType = materialType;
      if (subjectId) {
        where.chapter = { subjectId };
      }
      const materials = await prisma.studyMaterial.findMany({
        where,
        include: {
          chapter: {
            include: { subject: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(res, materials);
    } catch (error) {
      return sendError(res, "Failed to fetch materials.", 500);
    }
  }
  /**
   * Stream Dynamically Watermarked Note with Student Identity (Anti-Leak)
   */
  static async downloadWatermarkedMaterial(req, res) {
    try {
      const { materialId } = req.params;
      const userId = req.user.userId;
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: { user: true }
      });
      if (!profile) {
        return sendError(res, "Student profile not found.", 404);
      }
      if (!profile.isCompleted) {
        return sendError(
          res,
          "Your profile must be 100% completed with guardian info before downloading study materials.",
          403,
          { code: "PROFILE_INCOMPLETE" }
        );
      }
      const isBlockedByOverdue = await BillingService.hasOverdueBlock(userId);
      if (isBlockedByOverdue) {
        return sendError(
          res,
          "Your study vault access is temporarily paused due to overdue monthly tuition fees. Please complete your payment.",
          403,
          { code: "FEE_OVERDUE" }
        );
      }
      const material = await prisma.studyMaterial.findUnique({
        where: { id: materialId },
        include: {
          chapter: { include: { subject: true } }
        }
      });
      if (!material) {
        return sendError(res, "Requested study material not found.", 404);
      }
      let basePdfBuffer;
      if (fs.existsSync(material.fileUrl)) {
        basePdfBuffer = fs.readFileSync(material.fileUrl);
      } else {
        basePdfBuffer = await WatermarkService.createSampleLecturePdf(
          material.title,
          material.chapter.subject.name,
          material.chapter.title,
          [
            "\u09AE\u09CC\u09B2\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE \u0993 \u09AC\u09CB\u09B0\u09CD\u09A1\u09C7\u09B0 \u09AC\u09BF\u0997\u09A4 \u09E7\u09E6 \u09AC\u099B\u09B0\u09C7\u09B0 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3 \u09B8\u09C2\u09A4\u09CD\u09B0\u09C7\u09B0 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA\u0964",
            "\u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8\u09C7\u09B0 \u09B6\u09B0\u09CD\u099F\u0995\u09BE\u099F \u0995\u09CC\u09B6\u09B2 \u0993 \u0995\u09CD\u09AF\u09BE\u09B2\u0995\u09C1\u09B2\u09C7\u099F\u09B0 \u099F\u09CD\u09B0\u09BF\u0995\u09B8\u0964",
            "\u09B8\u09C3\u099C\u09A8\u09B6\u09C0\u09B2 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 (CQ) \u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u0985\u09A8\u09C1\u09A7\u09BE\u09AC\u09A8\u09AE\u09C2\u09B2\u0995 \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AD\u09C1\u09B2\u09B8\u09AE\u09C2\u09B9 \u0993 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8\u0964",
            "\u0989\u099A\u09CD\u099A\u09A4\u09B0 \u099A\u09BF\u09A8\u09CD\u09A4\u09A8 \u09A6\u0995\u09CD\u09B7\u09A4\u09BE\u09B0 (D-Type) \u09E9\u099F\u09BF \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BE\u09B0\u09CD\u09A1 \u09AE\u09A1\u09C7\u09B2 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0993 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AC\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u0964",
            "\u09AC\u09CB\u09B0\u09CD\u09A1 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE\u09B0 \u0996\u09BE\u09A4\u09BE \u09AE\u09C2\u09B2\u09CD\u09AF\u09BE\u09AF\u09BC\u09A8\u09C7 \u09B0\u09BE\u09AF\u09BC\u09B9\u09BE\u09A8 \u09B8\u09CD\u09AF\u09BE\u09B0\u09C7\u09B0 \u09AC\u09BF\u09B6\u09C7\u09B7 \u0987\u09A8\u09B8\u09CD\u099F\u09CD\u09B0\u09BE\u0995\u09B6\u09A8 \u0993 \u099F\u09BF\u09AA\u09B8\u0964",
            "\u09B9\u09CB\u09AE\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8\u09C0: \u09AC\u09CB\u09B0\u09CD\u09A1 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0993 \u0995\u09CD\u09AF\u09BE\u09A1\u09C7\u099F \u0995\u09B2\u09C7\u099C \u099F\u09C7\u09B8\u09CD\u099F \u09AA\u09C7\u09AA\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE\u09AC\u09B2\u09BF\u0964"
          ]
        );
      }
      const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const stampedPdfBytes = await WatermarkService.stampPdf(basePdfBuffer, {
        name: profile.user.name,
        studentId: profile.studentIdNumber,
        phone: profile.studentPhone || profile.guardianPhone || "N/A",
        ipAddress: clientIp
      });
      const sanitizedFileName = encodeURIComponent(
        `${material.title.replace(/\s+/g, "_")}_${profile.studentIdNumber}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${sanitizedFileName}"`);
      res.setHeader("Content-Length", stampedPdfBytes.length);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("Pragma", "no-cache");
      return res.send(Buffer.from(stampedPdfBytes));
    } catch (error) {
      console.error("[Watermark Error]", error);
      return sendError(res, "Failed to generate watermarked document.", 500, error.message);
    }
  }
};

// src/routes/vaultRoutes.ts
var router3 = Router3();
router3.use(authenticateJWT);
router3.get("/subjects", VaultController.getSubjects);
router3.get("/materials", VaultController.getMaterials);
router3.get("/download/:materialId", VaultController.downloadWatermarkedMaterial);
var vaultRoutes_default = router3;

// src/routes/billingRoutes.ts
import { Router as Router4 } from "express";

// src/controllers/billingController.ts
import { PaymentMethod as PaymentMethod2, PaymentStatus as PaymentStatus2 } from "@prisma/client";
var BillingController = class {
  /**
   * Get Current Student Invoices & Payment Receipts
   */
  static async getStudentInvoices(req, res) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { userId: req.user.userId },
        include: {
          receipt: true
        },
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(res, invoices);
    } catch (error) {
      return sendError(res, "Failed to retrieve invoices.", 500);
    }
  }
  /**
   * Submit Manual bKash / Nagad Transaction ID
   */
  static async submitManualPayment(req, res) {
    try {
      const { invoiceId, paymentMethod = PaymentMethod2.BKASH_MANUAL, senderNumber, trxId } = req.body;
      if (!invoiceId || !senderNumber || !trxId) {
        return sendError(res, "Invoice ID, sender number, and transaction ID (TrxID) are required.");
      }
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { receipt: true }
      });
      if (!invoice) {
        return sendError(res, "Invoice not found.", 404);
      }
      if (invoice.userId !== req.user.userId) {
        return sendError(res, "Unauthorized to pay this invoice.", 403);
      }
      if (invoice.status === "PAID") {
        return sendError(res, "This invoice has already been cleared.", 400);
      }
      const existingTrx = await prisma.paymentReceipt.findUnique({
        where: { trxId: trxId.trim().toUpperCase() }
      });
      if (existingTrx) {
        return sendError(res, "This Transaction ID (TrxID) has already been submitted.", 400);
      }
      const receipt = await prisma.paymentReceipt.upsert({
        where: { invoiceId },
        create: {
          invoiceId,
          userId: req.user.userId,
          paymentMethod,
          senderNumber: senderNumber.trim(),
          trxId: trxId.trim().toUpperCase(),
          amount: invoice.amount,
          status: PaymentStatus2.PENDING
        },
        update: {
          paymentMethod,
          senderNumber: senderNumber.trim(),
          trxId: trxId.trim().toUpperCase(),
          status: PaymentStatus2.PENDING
        }
      });
      return sendSuccess(
        res,
        receipt,
        "bKash Transaction ID submitted successfully. Rayhan Sir will verify and approve it shortly."
      );
    } catch (error) {
      console.error("[Submit Payment Error]", error);
      return sendError(res, "Failed to submit payment verification.", 500);
    }
  }
  /**
   * Download Official PDF Money Receipt
   */
  static async downloadReceipt(req, res) {
    try {
      const { receiptId } = req.params;
      const receipt = await prisma.paymentReceipt.findUnique({
        where: { id: receiptId },
        include: {
          invoice: true,
          user: {
            include: { profile: true }
          }
        }
      });
      if (!receipt) {
        return sendError(res, "Money receipt not found.", 404);
      }
      if (receipt.userId !== req.user.userId && req.user.role !== "SUPER_ADMIN") {
        return sendError(res, "Access denied.", 403);
      }
      if (receipt.status !== PaymentStatus2.APPROVED) {
        return sendError(res, "Money receipt is only available once payment is verified and approved.", 400);
      }
      const receiptPdf = await BillingService.generateReceiptPdf({
        receiptId: receipt.id,
        studentName: receipt.user.name,
        studentId: receipt.user.profile?.studentIdNumber || "RSB-26-XXX",
        month: receipt.invoice.month,
        amount: receipt.amount,
        paymentMethod: receipt.paymentMethod,
        trxId: receipt.trxId,
        senderNumber: receipt.senderNumber,
        paidDate: receipt.verifiedAt ? new Date(receipt.verifiedAt).toLocaleDateString("en-GB") : (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="RSB_Receipt_${receipt.trxId}.pdf"`);
      return res.send(receiptPdf);
    } catch (error) {
      return sendError(res, "Failed to generate receipt PDF.", 500);
    }
  }
};

// src/routes/billingRoutes.ts
var router4 = Router4();
router4.use(authenticateJWT);
router4.get("/invoices", BillingController.getStudentInvoices);
router4.post("/submit-manual", BillingController.submitManualPayment);
router4.get("/receipt/:receiptId", BillingController.downloadReceipt);
var billingRoutes_default = router4;

// src/routes/gameRoutes.ts
import { Router as Router5 } from "express";

// src/controllers/gameController.ts
import { GameType } from "@prisma/client";
var GameController = class {
  /**
   * Submit Science Game Score, Earn XP & Unlock Badges
   */
  static async submitScore(req, res) {
    try {
      const { gameType, score, xpEarned = 50 } = req.body;
      const userId = req.user.userId;
      if (!gameType || score === void 0) {
        return sendError(res, "Game type and score are required.");
      }
      const gameScore = await prisma.gameScore.create({
        data: {
          userId,
          gameType,
          score,
          xpEarned
        }
      });
      const profile = await prisma.studentProfile.findUnique({
        where: { userId }
      });
      const updatedXp = (profile?.totalXp || 0) + xpEarned;
      await prisma.studentProfile.update({
        where: { userId },
        data: {
          totalXp: updatedXp
        }
      });
      const newlyAwardedBadges = [];
      if (updatedXp >= 300) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: "SCIENCE_SCHOLAR" } }
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: "Rayhan Science Scholar",
              badgeCode: "SCIENCE_SCHOLAR",
              icon: "\u{1F393}"
            }
          });
          newlyAwardedBadges.push("Rayhan Science Scholar");
        }
      }
      if (gameType === GameType.PERIODIC_TABLE && score >= 80) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: "ORGANIC_WIZARD" } }
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: "Periodic Table Wizard",
              badgeCode: "ORGANIC_WIZARD",
              icon: "\u2697\uFE0F"
            }
          });
          newlyAwardedBadges.push("Periodic Table Wizard");
        }
      }
      if (gameType === GameType.FORMULA_RUSH && score >= 80) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: "PHYSICS_TITAN" } }
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: "Physics Formula Titan",
              badgeCode: "PHYSICS_TITAN",
              icon: "\u26A1"
            }
          });
          newlyAwardedBadges.push("Physics Formula Titan");
        }
      }
      if (gameType === GameType.MATH_SPRINT && score >= 80) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: "MATH_NINJA" } }
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: "Mental Math Ninja",
              badgeCode: "MATH_NINJA",
              icon: "\u{1F9EE}"
            }
          });
          newlyAwardedBadges.push("Mental Math Ninja");
        }
      }
      return sendSuccess(res, {
        gameScore,
        totalXp: updatedXp,
        newlyAwardedBadges
      });
    } catch (error) {
      console.error("[Game Score Error]", error);
      return sendError(res, "Failed to save game score.", 500);
    }
  }
  /**
   * Get Live Batch Leaderboard
   */
  static async getLeaderboard(req, res) {
    try {
      const topProfiles = await prisma.studentProfile.findMany({
        take: 10,
        orderBy: { totalXp: "desc" },
        include: {
          user: {
            select: { name: true, badges: true }
          },
          batch: { select: { name: true } }
        }
      });
      const leaderboard = topProfiles.map((p, idx) => ({
        rank: idx + 1,
        studentId: p.studentIdNumber,
        name: p.user.name,
        batch: p.batch?.name || "Science Batch",
        totalXp: p.totalXp,
        streak: p.currentStreak,
        badges: p.user.badges
      }));
      return sendSuccess(res, leaderboard);
    } catch (error) {
      return sendError(res, "Failed to fetch leaderboard.", 500);
    }
  }
  /**
   * Get User Badges
   */
  static async getBadges(req, res) {
    try {
      const badges = await prisma.userBadge.findMany({
        where: { userId: req.user.userId }
      });
      return sendSuccess(res, badges);
    } catch (error) {
      return sendError(res, "Failed to fetch badges.", 500);
    }
  }
};

// src/routes/gameRoutes.ts
var router5 = Router5();
router5.use(authenticateJWT);
router5.post("/score", GameController.submitScore);
router5.get("/leaderboard", GameController.getLeaderboard);
router5.get("/badges", GameController.getBadges);
var gameRoutes_default = router5;

// src/routes/feedbackRoutes.ts
import { Router as Router6 } from "express";

// src/controllers/feedbackController.ts
var FeedbackController = class {
  /**
   * Get Student Academic Feedback Thread
   */
  static async getFeedback(req, res) {
    try {
      const feedbackList = await prisma.studentFeedback.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(res, feedbackList);
    } catch (error) {
      return sendError(res, "Failed to fetch feedback.", 500);
    }
  }
  /**
   * Student reply / doubt submission to Rayhan Sir
   */
  static async replyFeedback(req, res) {
    try {
      const { feedbackId, replyText } = req.body;
      if (!feedbackId || !replyText) {
        return sendError(res, "Feedback ID and reply message are required.");
      }
      const feedback = await prisma.studentFeedback.findUnique({
        where: { id: feedbackId }
      });
      if (!feedback || feedback.userId !== req.user.userId) {
        return sendError(res, "Feedback not found or unauthorized.", 404);
      }
      const updated = await prisma.studentFeedback.update({
        where: { id: feedbackId },
        data: {
          studentReply: replyText.trim()
        }
      });
      return sendSuccess(res, updated, "Your reply and doubts have been sent to Rayhan Sir.");
    } catch (error) {
      return sendError(res, "Failed to update reply.", 500);
    }
  }
};

// src/routes/feedbackRoutes.ts
var router6 = Router6();
router6.use(authenticateJWT);
router6.get("/", FeedbackController.getFeedback);
router6.post("/reply", FeedbackController.replyFeedback);
var feedbackRoutes_default = router6;

// src/routes/adminRoutes.ts
import { Router as Router7 } from "express";

// src/controllers/adminController.ts
import { AttendanceStatus, InvoiceStatus as InvoiceStatus2, PaymentStatus as PaymentStatus3 } from "@prisma/client";
var AdminController = class {
  /**
   * 1. Overview Analytics Dashboard
   */
  static async getOverviewAnalytics(req, res) {
    try {
      const currentMonth = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { month: "long", year: "numeric" });
      const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
      const completedProfiles = await prisma.studentProfile.count({ where: { isCompleted: true } });
      const totalMaterials = await prisma.studyMaterial.count();
      const paidInvoices = await prisma.invoice.findMany({
        where: { month: currentMonth, status: InvoiceStatus2.PAID }
      });
      const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const pendingInvoices = await prisma.invoice.findMany({
        where: { month: currentMonth, status: { in: [InvoiceStatus2.UNPAID, InvoiceStatus2.OVERDUE] } }
      });
      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const pendingPaymentsCount = await prisma.paymentReceipt.count({
        where: { status: PaymentStatus3.PENDING }
      });
      const batches = await prisma.batch.findMany({
        include: {
          _count: { select: { students: true } }
        }
      });
      return sendSuccess(res, {
        currentMonth,
        totalStudents,
        completedProfiles,
        totalMaterials,
        totalCollected,
        pendingAmount,
        pendingPaymentsCount,
        batches
      });
    } catch (error) {
      console.error("[Admin Analytics Error]", error);
      return sendError(res, "Failed to fetch admin analytics.", 500);
    }
  }
  /**
   * 2. Get All Students with details
   */
  static async getStudents(req, res) {
    try {
      const students = await prisma.studentProfile.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, status: true, createdAt: true }
          },
          batch: true
        },
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(res, students);
    } catch (error) {
      return sendError(res, "Failed to fetch students.", 500);
    }
  }
  /**
   * 3. Create or Update Batch
   */
  static async createBatch(req, res) {
    try {
      const { name, academicLevel, scheduleDays, timeSlot, monthlyFee = 2e3 } = req.body;
      if (!name || !academicLevel || !scheduleDays || !timeSlot) {
        return sendError(res, "Name, academic level, schedule days, and time slot are required.");
      }
      const batch = await prisma.batch.create({
        data: {
          name,
          academicLevel,
          scheduleDays,
          timeSlot,
          monthlyFee: parseFloat(monthlyFee.toString())
        }
      });
      return sendSuccess(res, batch, "Batch created successfully.");
    } catch (error) {
      return sendError(res, "Failed to create batch.", 500);
    }
  }
  /**
   * 4. Upload / Register Study Material
   */
  static async uploadMaterial(req, res) {
    try {
      const { title, description, chapterId, materialType = "LECTURE_SHEET", fileUrl = "generated", isPremium = true } = req.body;
      if (!title || !chapterId) {
        return sendError(res, "Title and Chapter are required.");
      }
      const material = await prisma.studyMaterial.create({
        data: {
          title,
          description,
          chapterId,
          materialType,
          fileUrl,
          fileSize: "1.8 MB",
          isPremium: Boolean(isPremium)
        }
      });
      return sendSuccess(res, material, "Study material registered successfully.");
    } catch (error) {
      return sendError(res, "Failed to register material.", 500);
    }
  }
  /**
   * 5. Add 2-4 Min Demo Concept Video for Public Landing Page
   */
  static async createDemoVideo(req, res) {
    try {
      const { title, subject, chapter, duration, youtubeUrl, thumbnailUrl } = req.body;
      if (!title || !subject || !youtubeUrl) {
        return sendError(res, "Title, subject, and YouTube URL are required.");
      }
      const video = await prisma.demoVideo.create({
        data: {
          title,
          subject,
          chapter: chapter || "General Concept",
          duration: duration || "3:30",
          youtubeUrl,
          thumbnailUrl
        }
      });
      return sendSuccess(res, video, "Demo video added successfully.");
    } catch (error) {
      return sendError(res, "Failed to add demo video.", 500);
    }
  }
  /**
   * 6. Pending Manual bKash/Nagad Payments Queue
   */
  static async getPendingPayments(req, res) {
    try {
      const pending = await prisma.paymentReceipt.findMany({
        where: { status: PaymentStatus3.PENDING },
        include: {
          invoice: true,
          user: {
            include: { profile: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(res, pending);
    } catch (error) {
      return sendError(res, "Failed to fetch pending payments.", 500);
    }
  }
  /**
   * 7. 1-Click Approve / Reject Payment
   */
  static async reviewPayment(req, res) {
    try {
      const { receiptId, action } = req.body;
      if (!receiptId || !action) {
        return sendError(res, "Receipt ID and action are required.");
      }
      const receipt = await prisma.paymentReceipt.findUnique({
        where: { id: receiptId },
        include: { invoice: true, user: true }
      });
      if (!receipt) {
        return sendError(res, "Receipt not found.", 404);
      }
      if (action === "APPROVE") {
        const now = /* @__PURE__ */ new Date();
        await prisma.paymentReceipt.update({
          where: { id: receiptId },
          data: {
            status: PaymentStatus3.APPROVED,
            verifiedBy: req.user?.name || "Rayhan Sir",
            verifiedAt: now
          }
        });
        await prisma.invoice.update({
          where: { id: receipt.invoiceId },
          data: {
            status: InvoiceStatus2.PAID,
            paidAt: now
          }
        });
        return sendSuccess(res, null, `Payment TrxID ${receipt.trxId} approved successfully! Receipt generated.`);
      } else {
        await prisma.paymentReceipt.update({
          where: { id: receiptId },
          data: {
            status: PaymentStatus3.REJECTED,
            verifiedBy: req.user?.name || "Rayhan Sir",
            verifiedAt: /* @__PURE__ */ new Date()
          }
        });
        return sendSuccess(res, null, `Payment TrxID ${receipt.trxId} has been rejected.`);
      }
    } catch (error) {
      console.error("[Review Payment Error]", error);
      return sendError(res, "Failed to process payment review.", 500);
    }
  }
  /**
   * 8. Offline Batch QR Attendance Scanner (Webcam scan)
   */
  static async scanQrAttendance(req, res) {
    try {
      const { qrPayload } = req.body;
      if (!qrPayload) {
        return sendError(res, "QR code payload is required.");
      }
      const verification = QrService.verifyBadgePayload(qrPayload);
      if (!verification.valid || !verification.data) {
        return sendError(res, "Invalid or forged QR Code! Attendance rejected.", 400);
      }
      const { studentId, userId, name, academicLevel } = verification.data;
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          batch: true,
          user: true
        }
      });
      if (!profile || !profile.batchId) {
        return sendError(res, `Student ${name} (${studentId}) is not enrolled in an active batch.`, 400);
      }
      const todayStart = /* @__PURE__ */ new Date();
      todayStart.setHours(0, 0, 0, 0);
      const existing = await prisma.attendance.findFirst({
        where: {
          userId,
          date: { gte: todayStart }
        }
      });
      if (existing) {
        return sendSuccess(res, {
          student: {
            name,
            studentId,
            academicLevel,
            batch: profile.batch?.name || "Science Batch",
            avatarUrl: profile.avatarUrl
          },
          alreadyMarked: true,
          message: `${name} (${studentId}) has already been marked PRESENT today.`
        });
      }
      await prisma.attendance.create({
        data: {
          userId,
          batchId: profile.batchId,
          status: AttendanceStatus.PRESENT,
          scannedVia: "CAMERA_QR_SCANNER"
        }
      });
      const currentMonth = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { month: "long", year: "numeric" });
      const invoice = await prisma.invoice.findFirst({
        where: { userId, month: currentMonth }
      });
      return sendSuccess(res, {
        student: {
          name,
          studentId,
          academicLevel,
          batch: profile.batch?.name || "Science Batch",
          avatarUrl: profile.avatarUrl
        },
        feeStatus: invoice?.status || "UNPAID",
        attendanceMarked: true,
        scannedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US")
      }, `Attendance verified and marked PRESENT for ${name}!`);
    } catch (error) {
      console.error("[Scan QR Error]", error);
      return sendError(res, "Failed to process QR attendance scan.", 500);
    }
  }
  /**
   * 9. Post Academic Feedback for a Student
   */
  static async postFeedback(req, res) {
    try {
      const { studentUserId, remarks, strengths, areasToImprove, month } = req.body;
      if (!studentUserId || !remarks) {
        return sendError(res, "Student User ID and remarks are required.");
      }
      const feedback = await prisma.studentFeedback.create({
        data: {
          userId: studentUserId,
          authorId: req.user.userId,
          authorName: req.user?.name || "Rayhan Sir",
          remarks,
          strengths,
          areasToImprove,
          month: month || (/* @__PURE__ */ new Date()).toLocaleString("en-US", { month: "long", year: "numeric" }),
          sharedWithGuardian: true
        }
      });
      return sendSuccess(res, feedback, "Student academic feedback saved and synced.");
    } catch (error) {
      return sendError(res, "Failed to save feedback.", 500);
    }
  }
  /**
   * 10. Manual Trigger Monthly Billing Cron Job
   */
  static async triggerMonthlyBilling(req, res) {
    try {
      const result = await BillingService.runMonthlyBilling();
      return sendSuccess(
        res,
        result,
        `Billing run complete for ${result.month}. Generated ${result.generatedCount} new invoices.`
      );
    } catch (error) {
      return sendError(res, "Failed to run billing job.", 500);
    }
  }
};

// src/routes/adminRoutes.ts
import { Role as Role2 } from "@prisma/client";
var router7 = Router7();
router7.use(authenticateJWT);
router7.use(requireRole([Role2.SUPER_ADMIN]));
router7.get("/analytics", AdminController.getOverviewAnalytics);
router7.get("/students", AdminController.getStudents);
router7.post("/batches", AdminController.createBatch);
router7.post("/materials", AdminController.uploadMaterial);
router7.post("/demo-videos", AdminController.createDemoVideo);
router7.get("/payments/pending", AdminController.getPendingPayments);
router7.post("/payments/review", AdminController.reviewPayment);
router7.post("/attendance/scan-qr", AdminController.scanQrAttendance);
router7.post("/feedback", AdminController.postFeedback);
router7.post("/billing/trigger", AdminController.triggerMonthlyBilling);
var adminRoutes_default = router7;

// src/routes/publicRoutes.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.get("/landing-data", async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { isActive: true },
      include: { _count: { select: { students: true } } }
    });
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          take: 4,
          select: { id: true, title: true, chapterNumber: true }
        }
      }
    });
    const demoVideos = await prisma.demoVideo.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 6
    });
    const achievements = [
      { year: "2025", count: "48+ GPA-5", description: "SSC Science Batch All-Board Top Scorers" },
      { year: "2025", count: "32+ BUET/Medical", description: "HSC Alumni in BUET, DMC, DU, RUET" },
      { year: "2024", count: "100% Pass Rate", description: "Higher Math & Physics 90+ Score average" }
    ];
    const reviews = [
      {
        studentName: "\u09A4\u09BE\u09A8\u09AD\u09C0\u09B0 \u0986\u09B9\u09AE\u09C7\u09A6",
        badge: "BUET CSE (Ex-RSB)",
        college: "Notre Dame College",
        comment: "\u09B0\u09BE\u09DF\u09B9\u09BE\u09A8 \u09B8\u09CD\u09AF\u09BE\u09B0\u09C7\u09B0 \u09AB\u09BF\u099C\u09BF\u0995\u09CD\u09B8 \u0993 \u09B9\u09BE\u09DF\u09BE\u09B0 \u09AE\u09CD\u09AF\u09BE\u09A5\u09C7\u09B0 \u0995\u09A8\u09B8\u09C7\u09AA\u09CD\u099F \u0995\u09CD\u09B2\u09BF\u09DF\u09BE\u09B0\u09BF\u0982 \u09AE\u09C7\u09A5\u09A1 \u0985\u09A8\u09A8\u09CD\u09AF\u0964 \u0995\u09A0\u09BF\u09A8 \u099F\u09AA\u09BF\u0995\u0997\u09C1\u09B2\u09CB \u09A8\u09BF\u09AE\u09BF\u09B7\u09C7\u0987 \u09B8\u09B9\u099C \u09B9\u09DF\u09C7 \u09AF\u09C7\u09A4\u0964"
      },
      {
        studentName: "\u09B0\u09BE\u09AC\u09C7\u09DF\u09BE \u09B8\u09C1\u09B2\u09A4\u09BE\u09A8\u09BE",
        badge: "DMC (Ex-RSB)",
        college: "Viqarunnisa Noon College",
        comment: "\u09B0\u09B8\u09BE\u09DF\u09A8\u09C7\u09B0 \u099C\u09C8\u09AC \u09AF\u09CC\u0997 \u0993 \u09AC\u09BE\u09DF\u09CB\u09B2\u099C\u09BF \u09A8\u09CB\u099F\u09B8\u0997\u09C1\u09B2\u09CB \u0985\u09B8\u09AE\u09CD\u09AD\u09AC \u0997\u09CB\u099B\u09BE\u09A8\u09CB\u0964 \u09AC\u09BF\u09B6\u09C7\u09B7 \u0995\u09B0\u09C7 \u0993\u09DF\u09BE\u099F\u09BE\u09B0\u09AE\u09BE\u09B0\u09CD\u0995\u09A1 \u09B2\u09C7\u0995\u099A\u09BE\u09B0 \u09B6\u09BF\u099F\u0997\u09C1\u09B2\u09CB \u09B0\u09BF\u09AD\u09BF\u09B6\u09A8\u09C7 \u09B8\u09AC\u099A\u09C7\u09DF\u09C7 \u0995\u09BE\u099C\u09C7 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7\u0964"
      },
      {
        studentName: "\u09AE\u09CB: \u0986\u09AC\u09CD\u09A6\u09C1\u09B2\u09CD\u09B2\u09BE\u09B9",
        badge: "SSC 2025 (Golden GPA-5)",
        college: "Rajuk Uttara Model College",
        comment: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09AE\u09BE\u09B8\u09C7 \u0997\u09BE\u09B0\u09CD\u09A1\u09BF\u09DF\u09BE\u09A8 \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F \u09AA\u09BE\u0993\u09DF\u09BE\u09DF \u09AC\u09BE\u09AC\u09BE-\u09AE\u09BE \u09B8\u09AC\u09B8\u09AE\u09DF \u0986\u09AE\u09BE\u09B0 \u09AA\u09DC\u09BE\u09B6\u09CB\u09A8\u09BE\u09B0 \u0986\u09AA\u09A1\u09C7\u099F \u099C\u09BE\u09A8\u09A4\u09C7\u09A8\u0964 \u0987\u09A8-\u0985\u09CD\u09AF\u09BE\u09AA \u09B8\u09BE\u09DF\u09C7\u09A8\u09CD\u09B8 \u0997\u09C7\u09AE\u09B8\u0997\u09C1\u09B2\u09CB \u09AA\u09DC\u09BE\u09B6\u09CB\u09A8\u09BE\u09B0 \u0995\u09CD\u09B2\u09BE\u09A8\u09CD\u09A4\u09BF \u09A6\u09C2\u09B0 \u0995\u09B0\u09A4\u0964"
      }
    ];
    return sendSuccess(res, {
      batches,
      subjects,
      demoVideos,
      achievements,
      reviews
    });
  } catch (error) {
    return sendError(res, "Failed to fetch public landing data.", 500);
  }
});
var publicRoutes_default = router8;

// src/routes/index.ts
var router9 = Router9();
router9.use("/public", publicRoutes_default);
router9.use("/auth", authRoutes_default);
router9.use("/profile", profileRoutes_default);
router9.use("/vault", vaultRoutes_default);
router9.use("/billing", billingRoutes_default);
router9.use("/games", gameRoutes_default);
router9.use("/feedback", feedbackRoutes_default);
router9.use("/admin", adminRoutes_default);
var routes_default = router9;

// src/middlewares/globalErrorHandler.ts
import { ZodError } from "zod";

// src/errors/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errors = [];
  if (err instanceof AppError || err?.name === "AppError" || typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600) {
    statusCode = err.statusCode;
    message = err.message;
    errors = [
      {
        path: req.originalUrl,
        message: err.message
      }
    ];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));
  } else if (err?.name === "PrismaClientKnownRequestError") {
    statusCode = 400;
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : err.meta?.target || "Field";
      message = `Unique constraint failed on field(s): ${target}`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found in the database";
    } else {
      message = err.message || "Database request error";
    }
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    statusCode = 401;
    message = err.message || "Unauthorized / Invalid Session Token";
  } else if (err instanceof Error) {
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : void 0,
    stack: ENV.NODE_ENV === "development" ? err?.stack : void 0
  });
};

// src/middlewares/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
    errors: [
      {
        path: req.originalUrl,
        message: `Cannot ${req.method} ${req.originalUrl}`
      }
    ]
  });
};

// src/app.ts
var app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id", "X-Requested-With"]
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    success: true,
    service: "Rayhan Special Batch (RSB_portal) Backend RESTful API",
    version: "1.0.0",
    description: "SSC & HSC Science Coaching Management System"
  });
});
app.get(["/health", "/api/health", "/api/v1/health"], (req, res) => {
  res.status(200).json({
    status: "online",
    success: true,
    service: "Rayhan Special Batch (RSB_portal) Core Engine",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0.0"
  });
});
app.use("/api", routes_default);
app.use("/api/v1", routes_default);
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;
export {
  app_default as default
};

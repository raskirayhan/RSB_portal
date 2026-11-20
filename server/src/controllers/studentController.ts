import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { QrService } from '../services/qrService.js';
import { VerificationStatus } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email?: string;
  };
}

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'শিক্ষার্থীর পূর্ণ নাম কমপক্ষে ২ অক্ষরের হতে হবে।'),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
  classLevel: z.string().min(1, 'শ্রেণি নির্বাচন আবশ্যক।'),
  batchName: z.string().min(1, 'ব্যাচ নির্বাচন আবশ্যক।'),
  institution: z.string().min(2, 'স্কুল বা কলেজের নাম প্রদান করুন।'),
  fatherName: z.string().min(2, 'পিতার নাম প্রদান করুন।'),
  guardianPhone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'সঠিক ১১ ডিজিটের অভিভাবকের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
});

export class StudentController {
  /**
   * Mandatory Student Onboarding Submit
   * Verified directly with student's mobile number (No secret code required)
   */
  static async completeOnboarding(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'অনুমোদনহীন অ্যাক্সেস (Unauthorized).', 401);
      }

      // Validate request body
      const parseResult = onboardingSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
        return sendError(res, errorMsg, 400);
      }

      const {
        fullName,
        phone,
        classLevel,
        batchName,
        institution,
        fatherName,
        guardianPhone,
      } = parseResult.data;

      // Normalize phone numbers to 11 digits
      const normalizedPhone = phone.replace(/^(\+88|88)/, '').trim();
      const normalizedGuardianPhone = guardianPhone.replace(/^(\+88|88)/, '').trim();

      // Student is directly verified upon submitting mobile number and details
      const verificationStatus: VerificationStatus = VerificationStatus.VERIFIED;

      // Find or create batch
      let batch = await prisma.batch.findFirst({
        where: {
          name: { equals: batchName.trim(), mode: 'insensitive' },
        },
      });

      if (!batch) {
        batch = await prisma.batch.create({
          data: {
            name: batchName.trim(),
            academicLevel: classLevel,
            scheduleDays: 'রবি-মঙ্গল-বৃহস্পতি',
            timeSlot: 'সকাল ৮:০০ - ১০:০০',
            monthlyFee: 2000.0,
            isActive: true,
          },
        });
      }

      // Find user and existing profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        return sendError(res, 'ব্যবহারকারী পাওয়া যায়নি।', 404);
      }

      // Update User Name and Phone
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: fullName.trim(),
          phone: normalizedPhone,
        },
      });

      // Generate or retrieve studentIdNumber (e.g. RSB-26-001)
      const currentYearShort = new Date().getFullYear().toString().slice(-2);
      let studentIdNumber = user.profile?.studentIdNumber;
      if (!studentIdNumber) {
        const studentCount = await prisma.studentProfile.count();
        studentIdNumber = `RSB-${currentYearShort}-${(studentCount + 1).toString().padStart(3, '0')}`;
      }

      // Generate Official QR Code
      const qrPayload = QrService.generateBadgePayload(studentIdNumber, user.id, fullName, classLevel);
      const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);

      // Upsert StudentProfile
      const updatedProfile = await prisma.studentProfile.upsert({
        where: { userId },
        create: {
          userId,
          studentIdNumber,
          academicLevel: classLevel,
          fullName: fullName.trim(),
          institutionName: institution.trim(),
          batchId: batch.id,
          batchName: batch.name,
          studentPhone: normalizedPhone,
          guardianPhone: normalizedGuardianPhone,
          fatherName: fatherName.trim(),
          qrCodeDataUrl,
          isCompleted: true,
          isProfileComplete: true,
          verificationStatus,
        },
        update: {
          academicLevel: classLevel,
          fullName: fullName.trim(),
          institutionName: institution.trim(),
          batchId: batch.id,
          batchName: batch.name,
          studentPhone: normalizedPhone,
          guardianPhone: normalizedGuardianPhone,
          fatherName: fatherName.trim(),
          qrCodeDataUrl,
          isCompleted: true,
          isProfileComplete: true,
          verificationStatus,
        },
        include: {
          batch: true,
        },
      });

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            name: fullName.trim(),
            email: user.email,
            phone: normalizedPhone,
            role: user.role,
          },
          profile: updatedProfile,
          verified: true,
        },
        'শিক্ষার্থী ভেরিফিকেশন সফল হয়েছে! স্বাগতম Rayhan Special Batch-এ।'
      );
    } catch (error: any) {
      console.error('[Complete Onboarding Error]', error);
      return sendError(res, 'অনবোর্ডিং তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }
}

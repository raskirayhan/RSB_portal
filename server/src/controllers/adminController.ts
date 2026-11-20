import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { BillingService } from '../services/billingService.js';
import { QrService } from '../services/qrService.js';
import { AttendanceStatus, InvoiceStatus, PaymentStatus } from '@prisma/client';

export class AdminController {
  /**
   * 1. Overview Analytics Dashboard
   */
  static async getOverviewAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

      const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
      const completedProfiles = await prisma.studentProfile.count({ where: { isCompleted: true } });
      const totalMaterials = await prisma.studyMaterial.count();

      // Monthly Financials
      const paidInvoices = await prisma.invoice.findMany({
        where: { month: currentMonth, status: InvoiceStatus.PAID },
      });
      const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

      const pendingInvoices = await prisma.invoice.findMany({
        where: { month: currentMonth, status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE] } },
      });
      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

      const pendingPaymentsCount = await prisma.paymentReceipt.count({
        where: { status: PaymentStatus.PENDING },
      });

      // Batches stats
      const batches = await prisma.batch.findMany({
        include: {
          _count: { select: { students: true } },
        },
      });

      return sendSuccess(res, {
        currentMonth,
        totalStudents,
        completedProfiles,
        totalMaterials,
        totalCollected,
        pendingAmount,
        pendingPaymentsCount,
        batches,
      });
    } catch (error: any) {
      console.error('[Admin Analytics Error]', error);
      return sendError(res, 'Failed to fetch admin analytics.', 500);
    }
  }

  /**
   * 2. Get All Students with details
   */
  static async getStudents(req: AuthenticatedRequest, res: Response) {
    try {
      const students = await prisma.studentProfile.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
          },
          batch: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, students);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch students.', 500);
    }
  }

  /**
   * 3. Create or Update Batch
   */
  static async createBatch(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, academicLevel, scheduleDays, timeSlot, monthlyFee = 2000 } = req.body;

      if (!name || !academicLevel || !scheduleDays || !timeSlot) {
        return sendError(res, 'Name, academic level, schedule days, and time slot are required.');
      }

      const batch = await prisma.batch.create({
        data: {
          name,
          academicLevel,
          scheduleDays,
          timeSlot,
          monthlyFee: parseFloat(monthlyFee.toString()),
        },
      });

      return sendSuccess(res, batch, 'Batch created successfully.');
    } catch (error: any) {
      return sendError(res, 'Failed to create batch.', 500);
    }
  }

  /**
   * 4. Upload / Register Study Material
   */
  static async uploadMaterial(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, chapterId, materialType = 'LECTURE_SHEET', fileUrl = 'generated', isPremium = true } = req.body;

      if (!title || !chapterId) {
        return sendError(res, 'Title and Chapter are required.');
      }

      const material = await prisma.studyMaterial.create({
        data: {
          title,
          description,
          chapterId,
          materialType,
          fileUrl,
          fileSize: '1.8 MB',
          isPremium: Boolean(isPremium),
        },
      });

      return sendSuccess(res, material, 'Study material registered successfully.');
    } catch (error: any) {
      return sendError(res, 'Failed to register material.', 500);
    }
  }

  /**
   * 5. Add 2-4 Min Demo Concept Video for Public Landing Page (Deprecated)
   */
  static async createDemoVideo(req: AuthenticatedRequest, res: Response) {
    return sendSuccess(res, null, 'Demo videos have been phased out in favor of the Study Vault.');
  }

  /**
   * 6. Pending Manual bKash/Nagad Payments Queue
   */
  static async getPendingPayments(req: AuthenticatedRequest, res: Response) {
    try {
      const pending = await prisma.paymentReceipt.findMany({
        where: { status: PaymentStatus.PENDING },
        include: {
          invoice: true,
          user: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, pending);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch pending payments.', 500);
    }
  }

  /**
   * 7. 1-Click Approve / Reject Payment
   */
  static async reviewPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { receiptId, action } = req.body; // action: 'APPROVE' | 'REJECT'

      if (!receiptId || !action) {
        return sendError(res, 'Receipt ID and action are required.');
      }

      const receipt = await prisma.paymentReceipt.findUnique({
        where: { id: receiptId },
        include: { invoice: true, user: true },
      });

      if (!receipt) {
        return sendError(res, 'Receipt not found.', 404);
      }

      if (action === 'APPROVE') {
        const now = new Date();
        // Update Receipt
        await prisma.paymentReceipt.update({
          where: { id: receiptId },
          data: {
            status: PaymentStatus.APPROVED,
            verifiedBy: req.user?.name || 'Rayhan Sir',
            verifiedAt: now,
          },
        });

        // Update Invoice
        await prisma.invoice.update({
          where: { id: receipt.invoiceId },
          data: {
            status: InvoiceStatus.PAID,
            paidAt: now,
            amount: receipt.amount,
          },
        });

        return sendSuccess(res, null, `Payment TrxID ${receipt.trxId} approved successfully! Receipt generated.`);
      } else {
        await prisma.paymentReceipt.update({
          where: { id: receiptId },
          data: {
            status: PaymentStatus.REJECTED,
            verifiedBy: req.user?.name || 'Rayhan Sir',
            verifiedAt: new Date(),
          },
        });

        return sendSuccess(res, null, `Payment TrxID ${receipt.trxId} has been rejected.`);
      }
    } catch (error: any) {
      console.error('[Review Payment Error]', error);
      return sendError(res, 'Failed to process payment review.', 500);
    }
  }

  /**
   * 8. Offline Batch QR Attendance Scanner (Webcam scan)
   */
  static async scanQrAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const { qrPayload } = req.body;

      if (!qrPayload) {
        return sendError(res, 'QR কোড বা স্টুডেন্ট আইডি দেওয়া আবশ্যক।', 400);
      }

      let parsedStudentId = '';
      let parsedUserId = '';

      // 1. Try cryptographic verification
      const verification = QrService.verifyBadgePayload(qrPayload);
      if (verification.valid && verification.data) {
        parsedStudentId = verification.data.studentId;
        parsedUserId = verification.data.userId;
      } else {
        // 2. Try JSON payload parse (e.g. from simulator or scanner app)
        try {
          const parsed = typeof qrPayload === 'string' ? JSON.parse(qrPayload) : qrPayload;
          parsedStudentId = parsed.studentId || parsed.studentIdNumber || '';
          parsedUserId = parsed.userId || '';
        } catch {
          // 3. Raw Student ID text (e.g. "RSB-26-001")
          parsedStudentId = typeof qrPayload === 'string' ? qrPayload.trim() : '';
        }
      }

      // Find student and batch
      const profile = await prisma.studentProfile.findFirst({
        where: {
          OR: [
            ...(parsedStudentId ? [{ studentIdNumber: { equals: parsedStudentId, mode: 'insensitive' as const } }] : []),
            ...(parsedUserId ? [{ userId: parsedUserId }] : []),
          ],
        },
        include: {
          batch: true,
          user: true,
        },
      });

      if (!profile) {
        return sendError(res, `স্টুডেন্ট আইডি (${parsedStudentId || qrPayload}) দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি।`, 404);
      }

      const name = profile.fullName || profile.user?.name || 'শিক্ষার্থী';
      const studentId = profile.studentIdNumber || parsedStudentId || 'RSB-26-XXX';
      const academicLevel = profile.academicLevel || 'HSC_11';
      const userId = profile.userId;

      // Auto-assign batch if not assigned
      let batchId = profile.batchId;
      let batchName = profile.batch?.name || profile.batchName;

      if (!batchId) {
        let defaultBatch = await prisma.batch.findFirst({
          where: { isActive: true },
        });
        if (!defaultBatch) {
          defaultBatch = await prisma.batch.create({
            data: {
              name: 'Science Master Batch',
              academicLevel,
              scheduleDays: 'রবি-মঙ্গল-বৃহস্পতি',
              timeSlot: 'সকাল ৮:০০ - ১০:০০',
              monthlyFee: 2000.0,
              isActive: true,
            },
          });
        }
        batchId = defaultBatch.id;
        batchName = defaultBatch.name;

        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: { batchId, batchName },
        });
      }

      // Check today's attendance
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existing = await prisma.attendance.findFirst({
        where: {
          userId,
          date: { gte: todayStart },
        },
      });

      if (existing) {
        return sendSuccess(res, {
          student: {
            name,
            studentId,
            academicLevel,
            batch: batchName || 'Science Batch',
            avatarUrl: profile.avatarUrl,
          },
          alreadyMarked: true,
          message: `${name} (${studentId})-এর আজকের উপস্থিতি ইতিমধ্যে রেকর্ড করা হয়েছে।`,
        });
      }

      // Create attendance
      await prisma.attendance.create({
        data: {
          userId,
          batchId,
          status: AttendanceStatus.PRESENT,
          scannedVia: 'CAMERA_QR_SCANNER',
        },
      });

      // Check current month fee status
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const invoice = await prisma.invoice.findFirst({
        where: { userId, month: currentMonth },
      });

      return sendSuccess(res, {
        student: {
          name,
          studentId,
          academicLevel,
          batch: batchName || 'Science Batch',
          avatarUrl: profile.avatarUrl,
        },
        feeStatus: invoice?.status || 'UNPAID',
        attendanceMarked: true,
        scannedAt: new Date().toLocaleTimeString('en-US'),
      }, `Attendance verified and marked PRESENT for ${name}!`);
    } catch (error: any) {
      console.error('[Scan QR Error]', error);
      return sendError(res, 'Failed to process QR attendance scan.', 500);
    }
  }

  /**
   * 9. Post Academic Feedback for a Student
   */
  static async postFeedback(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentUserId, remarks, strengths, areasToImprove, month } = req.body;

      if (!studentUserId || !remarks) {
        return sendError(res, 'Student User ID and remarks are required.');
      }

      const feedback = await prisma.studentFeedback.create({
        data: {
          userId: studentUserId,
          authorId: req.user!.userId,
          authorName: req.user?.name || 'Rayhan Sir',
          remarks,
          strengths,
          areasToImprove,
          month: month || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          sharedWithGuardian: true,
        },
      });

      return sendSuccess(res, feedback, 'Student academic feedback saved and synced.');
    } catch (error: any) {
      return sendError(res, 'Failed to save feedback.', 500);
    }
  }

  /**
   * 10. Manual Trigger Monthly Billing Cron Job
   */
  static async triggerMonthlyBilling(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await BillingService.runMonthlyBilling();
      return sendSuccess(
        res,
        result,
        `Billing run complete for ${result.month}. Generated ${result.generatedCount} new invoices.`
      );
    } catch (error: any) {
      return sendError(res, 'Failed to run billing job.', 500);
    }
  }

  /**
   * 11. Toggle or Set Student Verification Status (UNVERIFIED <-> VERIFIED)
   */
  static async toggleStudentVerification(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // optional override 'VERIFIED' | 'UNVERIFIED'

      const profile = await prisma.studentProfile.findUnique({
        where: { id },
      });

      if (!profile) {
        return sendError(res, 'শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।', 404);
      }

      const newStatus = status || (profile.verificationStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED');
      const isComplete = newStatus === 'VERIFIED' ? true : profile.isProfileComplete;

      const updated = await prisma.studentProfile.update({
        where: { id },
        data: {
          verificationStatus: newStatus,
          isProfileComplete: isComplete,
          isCompleted: isComplete,
        },
        include: {
          user: true,
          batch: true,
        },
      });

      return sendSuccess(
        res,
        updated,
        `শিক্ষার্থী স্ট্যাটাস সফলভাবে "${newStatus}" করা হয়েছে।`
      );
    } catch (error: any) {
      console.error('[Toggle Verification Error]', error);
      return sendError(res, 'ভেরিফিকেশন স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।', 500);
    }
  }

  /**
   * 12. Get Active Batch Secret Code
   */
  static async getBatchSecretCode(req: AuthenticatedRequest, res: Response) {
    try {
      let setting = await prisma.systemSetting.findUnique({
        where: { key: 'BATCH_SECRET_CODE' },
      });

      if (!setting) {
        setting = await prisma.systemSetting.create({
          data: { key: 'BATCH_SECRET_CODE', value: 'RSB26' },
        });
      }

      return sendSuccess(res, { batchSecretCode: setting.value });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch batch secret code.', 500);
    }
  }

  /**
   * 13. Update Batch Secret Code
   */
  static async updateBatchSecretCode(req: AuthenticatedRequest, res: Response) {
    try {
      const { code } = req.body;
      if (!code || !code.trim()) {
        return sendError(res, 'সিক্রেট কোড প্রদান করা আবশ্যক।');
      }

      const updated = await prisma.systemSetting.upsert({
        where: { key: 'BATCH_SECRET_CODE' },
        update: { value: code.trim().toUpperCase() },
        create: { key: 'BATCH_SECRET_CODE', value: code.trim().toUpperCase() },
      });

      return sendSuccess(
        res,
        { batchSecretCode: updated.value },
        'ব্যাচ সিক্রেট কোড সফলভাবে আপডেট করা হয়েছে!'
      );
    } catch (error: any) {
      return sendError(res, 'Failed to update batch secret code.', 500);
    }
  }
}

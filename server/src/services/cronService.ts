import cron from 'node-cron';
import { BillingService } from './billingService.js';
import { EmailService } from './emailService.js';
import { prisma } from '../config/prisma.js';

export class CronService {
  static init() {
    console.log('[CronService] Initializing scheduled automation tasks for RSB_portal...');

    // 1. First day of month (00:01 AM): Auto-generate monthly tuition fee invoices
    cron.schedule('1 0 1 * *', async () => {
      console.log('[Cron Job] Executing 1st of month tuition bill generation...');
      try {
        const result = await BillingService.runMonthlyBilling();
        console.log(`[Cron Job] Successfully generated ${result.generatedCount} invoices for ${result.month}`);
      } catch (err) {
        console.error('[Cron Job Error] Failed to generate invoices:', err);
      }
    });

    // 2. 16th of month (00:01 AM): Soft-lock overdue unpaid accounts
    cron.schedule('1 0 16 * *', async () => {
      console.log('[Cron Job] Checking and tagging overdue invoices...');
      try {
        const now = new Date();
        await prisma.invoice.updateMany({
          where: {
            status: 'UNPAID',
            dueDate: { lt: now },
          },
          data: {
            status: 'OVERDUE',
          },
        });
      } catch (err) {
        console.error('[Cron Job Error] Overdue update failed:', err);
      }
    });

    // 3. Last day of month (18:00 PM): Dispatch Guardian Email Digest
    cron.schedule('0 18 28-31 * *', async () => {
      // Check if tomorrow is day 1 (meaning today is the last day of month)
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (tomorrow.getDate() === 1) {
        console.log('[Cron Job] Last day of month reached! Dispatching Guardian Email Digests...');
        try {
          await this.dispatchAllGuardianDigests();
        } catch (err) {
          console.error('[Cron Job Error] Guardian digest broadcast failed:', err);
        }
      }
    });
  }

  /**
   * Dispatches monthly guardian report to all enrolled students with guardian emails.
   */
  static async dispatchAllGuardianDigests() {
    const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const students = await prisma.studentProfile.findMany({
      where: {
        guardianEmail: { not: null },
      },
      include: {
        user: true,
      },
    });

    for (const student of students) {
      if (!student.guardianEmail) continue;

      // Calculate attendance rate in the current month
      const totalDays = 12; // Standard 12 classes per month
      const presentCount = await prisma.attendance.count({
        where: {
          userId: student.userId,
          status: 'PRESENT',
        },
      });
      const attendancePercent = Math.min(100, Math.round((presentCount / totalDays) * 100));

      // Get latest payment status
      const latestInvoice = await prisma.invoice.findFirst({
        where: { userId: student.userId, month },
      });
      const paymentStatus = latestInvoice?.status || 'PENDING';

      // Get teacher remarks
      const feedback = await prisma.studentFeedback.findFirst({
        where: { userId: student.userId },
        orderBy: { createdAt: 'desc' },
      });

      await EmailService.sendGuardianMonthlyDigest({
        guardianEmail: student.guardianEmail,
        guardianName: student.fatherName || student.motherName || 'অভিভাবক',
        studentName: student.user.name,
        studentId: student.studentIdNumber,
        month,
        attendancePercent,
        paymentStatus,
        teacherRemarks: feedback?.remarks || 'নিয়মিত ক্লাসে উপস্থিতি এবং হোমওয়ার্ক সন্তোষজনক।',
      });
    }
  }
}

import { prisma } from '../config/prisma.js';
import { InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class BillingService {
  /**
   * Generates monthly tuition invoices for all enrolled students.
   */
  static async runMonthlyBilling(targetMonth?: string) {
    const now = new Date();
    const monthName = targetMonth || now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Due date is the 10th of the current month
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);

    // Get all students enrolled in an active batch
    const students = await prisma.studentProfile.findMany({
      where: {
        batchId: { not: null },
      },
      include: {
        batch: true,
      },
    });

    let generatedCount = 0;

    for (const student of students) {
      // Check if invoice already exists for this month
      const existing = await prisma.invoice.findFirst({
        where: {
          userId: student.userId,
          month: monthName,
        },
      });

      if (!existing && student.batch) {
        await prisma.invoice.create({
          data: {
            userId: student.userId,
            month: monthName,
            amount: student.batch.monthlyFee,
            dueDate,
            status: InvoiceStatus.UNPAID,
          },
        });
        generatedCount++;
      }
    }

    return { month: monthName, generatedCount };
  }

  /**
   * Check if student has overdue unpaid fees past the 15th of the month.
   */
  static async hasOverdueBlock(userId: string): Promise<boolean> {
    const today = new Date();
    if (today.getDate() < 15) return false;

    const overdueInvoice = await prisma.invoice.findFirst({
      where: {
        userId,
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE] },
        dueDate: { lt: today },
      },
    });

    return !!overdueInvoice;
  }

  /**
   * Generate official Branded PDF Money Receipt.
   */
  static async generateReceiptPdf(receiptData: {
    receiptId: string;
    studentName: string;
    studentId: string;
    month: string;
    amount: number;
    paymentMethod: string;
    trxId: string;
    senderNumber: string;
    paidDate: string;
  }): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 420]); // Half A4 landscape voucher size
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();

    // Outer border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.15, 0.25, 0.5),
      borderWidth: 2,
    });

    // Header Background
    page.drawRectangle({
      x: 22,
      y: height - 85,
      width: width - 44,
      height: 63,
      color: rgb(0.12, 0.22, 0.45),
    });

    page.drawText('RAYHAN SPECIAL BATCH - OFFICIAL MONEY RECEIPT', {
      x: 40,
      y: height - 50,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('SSC & HSC Science Coaching (Physics, Chemistry, Math, Biology, ICT)', {
      x: 40,
      y: height - 70,
      size: 10,
      font: fontRegular,
      color: rgb(0.85, 0.9, 1),
    });

    // Receipt Meta
    page.drawText(`Receipt No: ${receiptData.receiptId.slice(0, 10).toUpperCase()}`, {
      x: 40,
      y: height - 110,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(`Date: ${receiptData.paidDate}`, {
      x: width - 180,
      y: height - 110,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Content Grid
    const safeStudentName = receiptData.studentName.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim() || `Student ${receiptData.studentId}`;
    const safeMonth = receiptData.month.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim() || 'Current Month';

    const details = [
      ['Student Name:', safeStudentName],
      ['Student ID:', receiptData.studentId],
      ['Academic Month:', safeMonth],
      ['Tuition Fee Amount:', `BDT ${receiptData.amount.toFixed(2)}`],
      ['Payment Method:', receiptData.paymentMethod],
      ['bKash / TrxID:', receiptData.trxId],
      ['Sender Number:', receiptData.senderNumber],
      ['Status:', 'PAID & VERIFIED (COMPLETED)'],
    ];

    let currentY = height - 140;
    for (const [label, val] of details) {
      page.drawText(label, {
        x: 45,
        y: currentY,
        size: 10,
        font: fontBold,
        color: rgb(0.25, 0.3, 0.35),
      });

      page.drawText(val, {
        x: 180,
        y: currentY,
        size: 10,
        font: fontRegular,
        color: label === 'Status:' ? rgb(0.1, 0.6, 0.2) : rgb(0.1, 0.1, 0.1),
      });

      currentY -= 19;
    }

    // Seal Stamp
    page.drawText('RAYHAN SIR', {
      x: width - 150,
      y: 70,
      size: 12,
      font: fontBold,
      color: rgb(0.15, 0.25, 0.5),
    });

    page.drawLine({
      start: { x: width - 160, y: 62 },
      end: { x: width - 50, y: 62 },
      thickness: 1,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText('Authorized Signature', {
      x: width - 150,
      y: 48,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }
}

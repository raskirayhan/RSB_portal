import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { BillingService } from '../services/billingService.js';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class BillingController {
  /**
   * Get Current Student Invoices & Payment Receipts
   */
  static async getStudentInvoices(req: AuthenticatedRequest, res: Response) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { userId: req.user!.userId },
        include: {
          receipt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, invoices);
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve invoices.', 500);
    }
  }

  /**
   * Submit Manual bKash / Nagad Transaction ID
   */
  static async submitManualPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { invoiceId, paymentMethod = PaymentMethod.BKASH_MANUAL, senderNumber, trxId } = req.body;

      if (!invoiceId || !senderNumber || !trxId) {
        return sendError(res, 'Invoice ID, sender number, and transaction ID (TrxID) are required.');
      }

      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { receipt: true },
      });

      if (!invoice) {
        return sendError(res, 'Invoice not found.', 404);
      }

      if (invoice.userId !== req.user!.userId) {
        return sendError(res, 'Unauthorized to pay this invoice.', 403);
      }

      if (invoice.status === 'PAID') {
        return sendError(res, 'This invoice has already been cleared.', 400);
      }

      // Check if trxId is already used
      const existingTrx = await prisma.paymentReceipt.findUnique({
        where: { trxId: trxId.trim().toUpperCase() },
      });

      if (existingTrx) {
        return sendError(res, 'This Transaction ID (TrxID) has already been submitted.', 400);
      }

      // Create or update receipt
      const receipt = await prisma.paymentReceipt.upsert({
        where: { invoiceId },
        create: {
          invoiceId,
          userId: req.user!.userId,
          paymentMethod,
          senderNumber: senderNumber.trim(),
          trxId: trxId.trim().toUpperCase(),
          amount: invoice.amount,
          status: PaymentStatus.PENDING,
        },
        update: {
          paymentMethod,
          senderNumber: senderNumber.trim(),
          trxId: trxId.trim().toUpperCase(),
          status: PaymentStatus.PENDING,
        },
      });

      return sendSuccess(
        res,
        receipt,
        'bKash Transaction ID submitted successfully. Rayhan Sir will verify and approve it shortly.'
      );
    } catch (error: any) {
      console.error('[Submit Payment Error]', error);
      return sendError(res, 'Failed to submit payment verification.', 500);
    }
  }

  /**
   * Download Official PDF Money Receipt
   */
  static async downloadReceipt(req: AuthenticatedRequest, res: Response) {
    try {
      const { receiptId } = req.params;

      const receipt = await prisma.paymentReceipt.findUnique({
        where: { id: receiptId },
        include: {
          invoice: true,
          user: {
            include: { profile: true },
          },
        },
      });

      if (!receipt) {
        return sendError(res, 'Money receipt not found.', 404);
      }

      if (receipt.userId !== req.user!.userId && req.user!.role !== 'SUPER_ADMIN') {
        return sendError(res, 'Access denied.', 403);
      }

      if (receipt.status !== PaymentStatus.APPROVED) {
        return sendError(res, 'Money receipt is only available once payment is verified and approved.', 400);
      }

      const receiptPdf = await BillingService.generateReceiptPdf({
        receiptId: receipt.id,
        studentName: receipt.user.name,
        studentId: receipt.user.profile?.studentIdNumber || 'RSB-26-XXX',
        month: receipt.invoice.month,
        amount: receipt.amount,
        paymentMethod: receipt.paymentMethod,
        trxId: receipt.trxId,
        senderNumber: receipt.senderNumber,
        paidDate: receipt.verifiedAt
          ? new Date(receipt.verifiedAt).toLocaleDateString('en-GB')
          : new Date().toLocaleDateString('en-GB'),
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="RSB_Receipt_${receipt.trxId}.pdf"`);
      return res.send(receiptPdf);
    } catch (error: any) {
      return sendError(res, 'Failed to generate receipt PDF.', 500);
    }
  }
}

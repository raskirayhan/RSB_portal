import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { WatermarkService } from '../services/watermarkService.js';
import { BillingService } from '../services/billingService.js';
import fs from 'fs';
import path from 'path';

export class VaultController {
  /**
   * Get Subjects and Chapters
   */
  static async getSubjects(req: AuthenticatedRequest, res: Response) {
    try {
      const subjects = await prisma.subject.findMany({
        include: {
          chapters: {
            include: {
              _count: { select: { materials: true } },
            },
            orderBy: { chapterNumber: 'asc' },
          },
        },
      });

      return sendSuccess(res, subjects);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch subjects.', 500);
    }
  }

  /**
   * Get Study Materials by Chapter or Subject
   */
  static async getMaterials(req: AuthenticatedRequest, res: Response) {
    try {
      const { chapterId, subjectId, materialType } = req.query;

      const where: any = {};
      if (chapterId) where.chapterId = chapterId as string;
      if (materialType) where.materialType = materialType as any;

      if (subjectId) {
        where.chapter = { subjectId: subjectId as string };
      }

      const materials = await prisma.studyMaterial.findMany({
        where,
        include: {
          chapter: {
            include: { subject: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, materials);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch materials.', 500);
    }
  }

  /**
   * Stream Dynamically Watermarked Note with Student Identity (Anti-Leak)
   */
  static async downloadWatermarkedMaterial(req: AuthenticatedRequest, res: Response) {
    try {
      const { materialId } = req.params;
      const userId = req.user!.userId;

      // 1. Fetch Student Profile & Verification Status
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!profile) {
        return sendError(res, 'Student profile not found.', 404);
      }

      // Gatekeeping 1: 100% Profile Completion Requirement
      if (!profile.isCompleted) {
        return sendError(
          res,
          'Your profile must be 100% completed with guardian info before downloading study materials.',
          403,
          { code: 'PROFILE_INCOMPLETE' }
        );
      }

      // Gatekeeping 2: Overdue Fee Lock (after 15th of the month)
      const isBlockedByOverdue = await BillingService.hasOverdueBlock(userId);
      if (isBlockedByOverdue) {
        return sendError(
          res,
          'Your study vault access is temporarily paused due to overdue monthly tuition fees. Please complete your payment.',
          403,
          { code: 'FEE_OVERDUE' }
        );
      }

      // 2. Fetch the Material
      const material = await prisma.studyMaterial.findUnique({
        where: { id: materialId },
        include: {
          chapter: { include: { subject: true } },
        },
      });

      if (!material) {
        return sendError(res, 'Requested study material not found.', 404);
      }

      // 3. Load or Generate base PDF
      let basePdfBuffer: Buffer;

      if (fs.existsSync(material.fileUrl)) {
        basePdfBuffer = fs.readFileSync(material.fileUrl);
      } else {
        // High-yield procedural content generation for Rayhan Sir's science chapters
        basePdfBuffer = await WatermarkService.createSampleLecturePdf(
          material.title,
          material.chapter.subject.name,
          material.chapter.title,
          [
            "মৌলিক ধারণা ও বোর্ডের বিগত ১০ বছরের গুরুত্বপূর্ণ সূত্রের সারসংক্ষেপ।",
            "গাণিতিক সমস্যা সমাধানের শর্টকাট কৌশল ও ক্যালকুলেটর ট্রিকস।",
            "সৃজনশীল প্রশ্ন (CQ) জ্ঞান ও অনুধাবনমূলক সাধারণ ভুলসমূহ ও সমাধান।",
            "উচ্চতর চিন্তন দক্ষতার (D-Type) ৩টি স্ট্যান্ডার্ড মডেল প্রশ্ন ও সম্পূর্ণ ব্যাখ্যা।",
            "বোর্ড পরীক্ষার খাতা মূল্যায়নে রায়হান স্যারের বিশেষ ইনস্ট্রাকশন ও টিপস।",
            "হোমওয়ার্ক অনুশীলনী: বোর্ড প্রশ্নব্যাংক ও ক্যাডেট কলেজ টেস্ট পেপার সমস্যাবলি।"
          ]
        );
      }

      // 4. Apply Dynamic Anti-Piracy Watermark across ALL pages
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const stampedPdfBytes = await WatermarkService.stampPdf(basePdfBuffer, {
        name: profile.user.name,
        studentId: profile.studentIdNumber,
        phone: profile.studentPhone || profile.guardianPhone || 'N/A',
        ipAddress: clientIp,
      });

      // 5. Stream dynamically stamped PDF
      const sanitizedFileName = encodeURIComponent(
        `${material.title.replace(/\s+/g, '_')}_${profile.studentIdNumber}.pdf`
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${sanitizedFileName}"`);
      res.setHeader('Content-Length', stampedPdfBytes.length);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');

      return res.send(Buffer.from(stampedPdfBytes));
    } catch (error: any) {
      console.error('[Watermark Error]', error);
      return sendError(res, 'Failed to generate watermarked document.', 500, error.message);
    }
  }
}

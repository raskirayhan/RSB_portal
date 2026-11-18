import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { QrService } from '../services/qrService.js';

export class ProfileController {
  /**
   * Get Current Student Profile & Completion Status
   */
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.userId },
        include: {
          batch: true,
          user: {
            select: { name: true, email: true, createdAt: true },
          },
        },
      });

      if (!profile) {
        return sendError(res, 'Profile not found.', 404);
      }

      // Calculate completion percentage
      const fields = [
        profile.user.name,
        profile.academicLevel,
        profile.institutionName,
        profile.batchId,
        profile.fatherName,
        profile.motherName,
        profile.studentPhone,
        profile.guardianPhone,
        profile.guardianEmail,
      ];
      const filledFields = fields.filter((f) => !!f && f.toString().trim() !== '').length;
      const completionPercentage = Math.round((filledFields / fields.length) * 100);

      return sendSuccess(res, {
        profile,
        completionPercentage,
        isCompleted: profile.isCompleted,
      });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch profile.', 500);
    }
  }

  /**
   * Update Student Profile and Validate 100% Completion Gatekeeping
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
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
        avatarUrl,
      } = req.body;

      // Update User Name if changed
      if (name) {
        await prisma.user.update({
          where: { id: req.user!.userId },
          data: { name },
        });
      }

      // Check if all essential guardian & academic fields are filled for 100% completion
      const isCompleteNow =
        !!institutionName &&
        !!fatherName &&
        !!motherName &&
        !!studentPhone &&
        !!guardianPhone &&
        !!guardianEmail;

      const currentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.userId },
      });

      if (!currentProfile) {
        return sendError(res, 'Profile does not exist.', 404);
      }

      // Re-generate QR Code with updated info
      const studentName = name || req.user?.name || 'Student';
      const effectiveLevel = academicLevel || currentProfile.academicLevel;
      const qrPayload = QrService.generateBadgePayload(
        currentProfile.studentIdNumber,
        req.user!.userId,
        studentName,
        effectiveLevel
      );
      const qrCodeDataUrl = await QrService.generateQrDataUrl(qrPayload);

      const updated = await prisma.studentProfile.update({
        where: { userId: req.user!.userId },
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
          isCompleted: isCompleteNow,
        },
        include: {
          batch: true,
          user: { select: { name: true, email: true } },
        },
      });

      return sendSuccess(
        res,
        updated,
        isCompleteNow
          ? 'Profile is 100% completed! All study vaults and leaderboards are now unlocked.'
          : 'Profile updated. Fill in remaining guardian details to reach 100% completion.'
      );
    } catch (error: any) {
      console.error('[Update Profile Error]', error);
      return sendError(res, 'Failed to update profile.', 500);
    }
  }

  /**
   * Get Digital Student ID Badge Card
   */
  static async getQrBadge(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.userId },
        include: {
          batch: true,
          user: { select: { name: true, email: true } },
        },
      });

      if (!profile) {
        return sendError(res, 'Student profile not found.', 404);
      }

      return sendSuccess(res, {
        studentId: profile.studentIdNumber,
        name: profile.user.name,
        academicLevel: profile.academicLevel,
        batchName: profile.batch?.name || 'General Science Batch',
        institution: profile.institutionName || 'N/A',
        phone: profile.studentPhone || 'N/A',
        guardianPhone: profile.guardianPhone || 'N/A',
        qrCodeDataUrl: profile.qrCodeDataUrl,
        isCompleted: profile.isCompleted,
      });
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve QR Badge.', 500);
    }
  }

  /**
   * Learning Milestone Tracker
   */
  static async getMilestones(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) return sendError(res, 'User not found.', 404);

      const daysEnrolled = Math.max(
        1,
        Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      );

      const attendanceCount = await prisma.attendance.count({
        where: { userId, status: 'PRESENT' },
      });

      const gamePlays = await prisma.gameScore.count({ where: { userId } });
      const badges = await prisma.userBadge.findMany({ where: { userId } });

      return sendSuccess(res, {
        daysEnrolled,
        attendanceCount,
        gamePlays,
        totalXp: user.profile?.totalXp || 0,
        currentStreak: user.profile?.currentStreak || 1,
        badges,
      });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch milestones.', 500);
    }
  }
}

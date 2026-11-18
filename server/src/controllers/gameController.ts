import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { GameType } from '@prisma/client';

export class GameController {
  /**
   * Submit Science Game Score, Earn XP & Unlock Badges
   */
  static async submitScore(req: AuthenticatedRequest, res: Response) {
    try {
      const { gameType, score, xpEarned = 50 } = req.body;
      const userId = req.user!.userId;

      if (!gameType || score === undefined) {
        return sendError(res, 'Game type and score are required.');
      }

      // 1. Record Game Score
      const gameScore = await prisma.gameScore.create({
        data: {
          userId,
          gameType,
          score,
          xpEarned,
        },
      });

      // 2. Update Student Profile Total XP and Streak
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      const updatedXp = (profile?.totalXp || 0) + xpEarned;

      await prisma.studentProfile.update({
        where: { userId },
        data: {
          totalXp: updatedXp,
        },
      });

      // 3. Award Badges automatically based on achievements
      const newlyAwardedBadges: string[] = [];

      // Check XP milestone badge
      if (updatedXp >= 300) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: 'SCIENCE_SCHOLAR' } },
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: 'Rayhan Science Scholar',
              badgeCode: 'SCIENCE_SCHOLAR',
              icon: '🎓',
            },
          });
          newlyAwardedBadges.push('Rayhan Science Scholar');
        }
      }

      // Check Game-Specific Badges
      if (gameType === GameType.PERIODIC_TABLE && score >= 80) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: 'ORGANIC_WIZARD' } },
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: 'Periodic Table Wizard',
              badgeCode: 'ORGANIC_WIZARD',
              icon: '⚗️',
            },
          });
          newlyAwardedBadges.push('Periodic Table Wizard');
        }
      }

      if (gameType === GameType.FORMULA_RUSH && score >= 80) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: 'PHYSICS_TITAN' } },
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: 'Physics Formula Titan',
              badgeCode: 'PHYSICS_TITAN',
              icon: '⚡',
            },
          });
          newlyAwardedBadges.push('Physics Formula Titan');
        }
      }

      if (gameType === GameType.MATH_SPRINT && score >= 80) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: 'MATH_NINJA' } },
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: 'Mental Math Ninja',
              badgeCode: 'MATH_NINJA',
              icon: '🧮',
            },
          });
          newlyAwardedBadges.push('Mental Math Ninja');
        }
      }

      return sendSuccess(res, {
        gameScore,
        totalXp: updatedXp,
        newlyAwardedBadges,
      });
    } catch (error: any) {
      console.error('[Game Score Error]', error);
      return sendError(res, 'Failed to save game score.', 500);
    }
  }

  /**
   * Get Live Batch Leaderboard
   */
  static async getLeaderboard(req: AuthenticatedRequest, res: Response) {
    try {
      const topProfiles = await prisma.studentProfile.findMany({
        take: 10,
        orderBy: { totalXp: 'desc' },
        include: {
          user: {
            select: { name: true, badges: true },
          },
          batch: { select: { name: true } },
        },
      });

      const leaderboard = topProfiles.map((p, idx) => ({
        rank: idx + 1,
        studentId: p.studentIdNumber,
        name: p.user.name,
        batch: p.batch?.name || 'Science Batch',
        totalXp: p.totalXp,
        streak: p.currentStreak,
        badges: p.user.badges,
      }));

      return sendSuccess(res, leaderboard);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch leaderboard.', 500);
    }
  }

  /**
   * Get User Badges
   */
  static async getBadges(req: AuthenticatedRequest, res: Response) {
    try {
      const badges = await prisma.userBadge.findMany({
        where: { userId: req.user!.userId },
      });

      return sendSuccess(res, badges);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch badges.', 500);
    }
  }
}

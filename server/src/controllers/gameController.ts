import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { GameType, Role } from '@prisma/client';
import { CHAMPIONSHIP_PRESETS, SSC_PHYSICS_PRESET_25 } from '../utils/championshipPresets.js';

export class GameController {
  /**
   * Mode A: Submit Casual Science Practice Game Score, Earn XP & Unlock Badges
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

      // 2. Update Student Profile Total XP and maintain Streak
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      const updatedXp = (profile?.totalXp || 0) + xpEarned;
      const currentStreak = Math.max(1, profile?.currentStreak || 1);

      await prisma.studentProfile.update({
        where: { userId },
        data: {
          totalXp: updatedXp,
          currentStreak,
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
   * Mode B: Get Currently Active 24-Hour Science Championship Session
   */
  static async getActiveChampionship(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const now = new Date();

      // Find an active session whose expiration is still in the future
      let activeSession = await prisma.championshipSession.findFirst({
        where: {
          isActive: true,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          attempts: {
            select: { id: true },
          },
        },
      });

      // If no active session exists yet, automatically initialize the SSC Physics Preset for 24 hours
      if (!activeSession) {
        const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
        activeSession = await prisma.championshipSession.create({
          data: {
            title: CHAMPIONSHIP_PRESETS.PHYSICS.title,
            subject: CHAMPIONSHIP_PRESETS.PHYSICS.subject,
            chapter: CHAMPIONSHIP_PRESETS.PHYSICS.chapter,
            totalQuestions: 25,
            timeLimitMinutes: 12,
            questions: SSC_PHYSICS_PRESET_25 as any,
            startsAt: now,
            expiresAt,
            isActive: true,
            createdBy: 'Rayhan Sir (Auto-Seed)',
          },
          include: {
            attempts: { select: { id: true } },
          },
        });
      }

      // Check if current student has already attempted this round
      const myAttempt = await prisma.championshipAttempt.findUnique({
        where: {
          userId_sessionId: {
            userId,
            sessionId: activeSession.id,
          },
        },
      });

      const questionsRaw = (activeSession.questions as any[]) || [];

      // If student has NOT attempted, strip out correctIndex & explanation to prevent inspecting devtools!
      const questionsForStudent = myAttempt
        ? questionsRaw
        : questionsRaw.map((q, idx) => ({
            id: q.id || idx + 1,
            subject: q.subject,
            chapter: q.chapter,
            questionText: q.questionText,
            options: q.options,
          }));

      return sendSuccess(res, {
        session: {
          id: activeSession.id,
          title: activeSession.title,
          subject: activeSession.subject,
          chapter: activeSession.chapter,
          totalQuestions: activeSession.totalQuestions,
          timeLimitMinutes: activeSession.timeLimitMinutes,
          startsAt: activeSession.startsAt,
          expiresAt: activeSession.expiresAt,
          totalParticipants: activeSession.attempts.length,
          questions: questionsForStudent,
        },
        hasAttempted: !!myAttempt,
        myAttempt: myAttempt
          ? {
              score: myAttempt.score,
              totalQuestions: myAttempt.totalQuestions,
              timeTakenSec: myAttempt.timeTakenSec,
              tabSwitches: myAttempt.tabSwitches,
              answers: myAttempt.answers,
              xpEarned: myAttempt.xpEarned,
              completedAt: myAttempt.completedAt,
            }
          : null,
      });
    } catch (error: any) {
      console.error('[Get Active Championship Error]', error);
      return sendError(res, 'Failed to fetch active championship.', 500);
    }
  }

  /**
   * Mode B: Submit 24-Hour Championship 25-MCQ Attempt (Strict Single-Attempt & Anti-Cheat)
   */
  static async submitChampionshipAttempt(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { sessionId, answers = {}, timeTakenSec = 300, tabSwitches = 0 } = req.body;

      if (!sessionId) {
        return sendError(res, 'Session ID is required.');
      }

      // Find the session
      const session = await prisma.championshipSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return sendError(res, 'Championship session not found.', 404);
      }

      // Check session expiration
      if (!session.isActive || new Date() > session.expiresAt) {
        return sendError(res, 'এই ২৪ ঘণ্টার চ্যাম্পিয়নশিপ রাউন্ডের মেয়াদ শেষ হয়ে গেছে।', 400);
      }

      // STRICT RULE: Check if user already attempted
      const existingAttempt = await prisma.championshipAttempt.findUnique({
        where: {
          userId_sessionId: {
            userId,
            sessionId,
          },
        },
      });

      if (existingAttempt) {
        return sendError(
          res,
          'আপনি ইতিমধ্যে এই ২৪ ঘণ্টার চ্যাম্পিয়নশিপ রাউন্ডে অংশগ্রহণ করেছেন! প্রতি রাউন্ডে কেবল একবারই পরীক্ষা দেওয়া যাবে।',
          400
        );
      }

      const questions = (session.questions as any[]) || [];
      let score = 0;

      // Evaluate student answers
      questions.forEach((q, idx) => {
        const studentChoice = answers[idx] ?? answers[q.id];
        if (studentChoice !== undefined && Number(studentChoice) === Number(q.correctIndex)) {
          score += 1;
        }
      });

      // Calculate XP: 10 XP per correct question + speed bonus
      let bonusXp = 0;
      if (score >= 20) bonusXp += 50; // High score badge bonus
      if (score >= 15 && timeTakenSec < 480) bonusXp += 30; // Fast solver bonus (under 8 mins)
      const totalXpEarned = score * 10 + bonusXp;

      // Record the attempt in database
      const attempt = await prisma.championshipAttempt.create({
        data: {
          sessionId,
          userId,
          score,
          totalQuestions: questions.length,
          timeTakenSec: Math.max(1, Number(timeTakenSec)),
          tabSwitches: Number(tabSwitches) || 0,
          answers,
          xpEarned: totalXpEarned,
        },
      });

      // Update student's total XP and streak in Profile
      const profile = await prisma.studentProfile.findUnique({ where: { userId } });
      const updatedTotalXp = (profile?.totalXp || 0) + totalXpEarned;
      const currentStreak = Math.max(1, profile?.currentStreak || 1);

      await prisma.studentProfile.update({
        where: { userId },
        data: {
          totalXp: updatedTotalXp,
          currentStreak,
        },
      });

      // Check for Championship Master Badge
      if (score >= 22) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: { userId_badgeCode: { userId, badgeCode: 'CHAMPIONSHIP_TOPPER' } },
        });
        if (!existingBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              title: '24-Hour Science Champion',
              badgeCode: 'CHAMPIONSHIP_TOPPER',
              icon: '👑',
            },
          });
        }
      }

      return sendSuccess(res, {
        score,
        totalQuestions: questions.length,
        timeTakenSec,
        tabSwitches,
        xpEarned: totalXpEarned,
        answers,
        fullReview: questions,
      }, 'আপনার ২৫টি এমসিকিউ সফলভাবে সাবমিট হয়েছে!');
    } catch (error: any) {
      console.error('[Submit Championship Attempt Error]', error);
      return sendError(res, 'পরীক্ষা সাবমিট করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Mode B: Get 24-Hour Championship Spotlight & Leaderboard
   * Tie-breaker: score DESC, timeTakenSec ASC (Fastest solver wins!)
   */
  static async getChampionshipLeaderboard(req: Request, res: Response) {
    try {
      // Find active or latest session
      let session = await prisma.championshipSession.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!session) {
        session = await prisma.championshipSession.findFirst({
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!session) {
        return sendSuccess(res, {
          champion: null,
          podium: [],
          rankings: [],
          session: null,
        });
      }

      // Query all attempts ordered strictly by score DESC, timeTakenSec ASC
      const attempts = await prisma.championshipAttempt.findMany({
        where: { sessionId: session.id },
        orderBy: [
          { score: 'desc' },
          { timeTakenSec: 'asc' },
          { completedAt: 'asc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  studentIdNumber: true,
                  academicLevel: true,
                  avatarUrl: true,
                  batch: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      const rankings = attempts.map((att, idx) => ({
        rank: idx + 1,
        attemptId: att.id,
        userId: att.userId,
        name: att.user.name,
        studentId: att.user.profile?.studentIdNumber || 'RSB-26-XXX',
        academicLevel: att.user.profile?.academicLevel || 'SSC Science',
        batchName: att.user.profile?.batch?.name || 'Science VIP Batch',
        avatarUrl: att.user.profile?.avatarUrl || null,
        score: att.score,
        totalQuestions: att.totalQuestions,
        timeTakenSec: att.timeTakenSec,
        tabSwitches: att.tabSwitches,
        xpEarned: att.xpEarned,
        completedAt: att.completedAt,
      }));

      const champion = rankings[0] || null;
      const podium = rankings.slice(0, 3);

      return sendSuccess(res, {
        session: {
          id: session.id,
          title: session.title,
          subject: session.subject,
          chapter: session.chapter,
          expiresAt: session.expiresAt,
          totalParticipants: attempts.length,
        },
        champion,
        podium,
        rankings,
      });
    } catch (error: any) {
      console.error('[Championship Leaderboard Error]', error);
      return sendError(res, 'Failed to fetch championship leaderboard.', 500);
    }
  }

  /**
   * Mode B: Get Available Presets (Physics, Chemistry, Biology)
   */
  static async getChampionshipPresets(req: Request, res: Response) {
    try {
      return sendSuccess(res, CHAMPIONSHIP_PRESETS);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch presets.', 500);
    }
  }

  /**
   * Admin Mode B: Launch / Upload 24-Hour Championship (Drive JSON or Preset)
   */
  static async createChampionship(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      if (user.role !== Role.SUPER_ADMIN) {
        return sendError(res, 'কেবল রায়হান স্যার ও অ্যাডমিন এই পরীক্ষা চালু করতে পারেন।', 403);
      }

      const {
        title,
        subject = 'Physics',
        chapter,
        questions = [],
        timeLimitMinutes = 12,
        durationHours = 24,
      } = req.body;

      if (!title) {
        return sendError(res, 'চ্যাম্পিয়নশিপ পরীক্ষার শিরোনাম প্রদান করা আবশ্যক।');
      }

      if (!Array.isArray(questions) || questions.length < 5) {
        return sendError(res, 'কমপক্ষে ৫টি বা ২৫টি এমসিকিউ প্রশ্ন থাকা আবশ্যক।');
      }

      // Format & validate questions
      const validatedQuestions = questions.map((q: any, i: number) => ({
        id: q.id || i + 1,
        subject: q.subject || subject,
        chapter: q.chapter || chapter || '',
        questionText: q.questionText || `প্রশ্ন ${i + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['অপশন ক', 'অপশন খ', 'অপশন গ', 'অপশন ঘ'],
        correctIndex: q.correctIndex !== undefined ? Number(q.correctIndex) : 0,
        explanation: q.explanation || 'সঠিক উত্তর কনসেপ্ট নোট দেখুন।',
      }));

      // Deactivate any currently active sessions
      await prisma.championshipSession.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      const now = new Date();
      const expiresAt = new Date(Date.now() + Number(durationHours) * 3600 * 1000);

      // Create new live session
      const newSession = await prisma.championshipSession.create({
        data: {
          title: title.trim(),
          subject: subject.trim(),
          chapter: chapter ? chapter.trim() : null,
          totalQuestions: validatedQuestions.length,
          timeLimitMinutes: Number(timeLimitMinutes) || 12,
          questions: validatedQuestions as any,
          startsAt: now,
          expiresAt,
          isActive: true,
          createdBy: user.name || 'Rayhan Sir',
        },
      });

      return sendSuccess(
        res,
        newSession,
        `২৪ ঘণ্টার লাইভ চ্যাম্পিয়নশিপ '${newSession.title}' সফলভাবে চালু করা হয়েছে!`
      );
    } catch (error: any) {
      console.error('[Create Championship Error]', error);
      return sendError(res, 'চ্যাম্পিয়নশিপ তৈরি করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin Mode B: Deactivate Active Championship
   */
  static async deactivateChampionship(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user!.role !== Role.SUPER_ADMIN) {
        return sendError(res, 'অনুমতি নেই।', 403);
      }

      await prisma.championshipSession.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      return sendSuccess(res, null, 'চ্যাম্পিয়নশিপ সেশন নিষ্ক্রিয় করা হয়েছে।');
    } catch (error: any) {
      return sendError(res, 'Failed to deactivate session.', 500);
    }
  }

  /**
   * Mode A: Get Casual Practice Leaderboard
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

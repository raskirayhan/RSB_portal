import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HSC_ICT_CHAPTERS, HSC_ICT_PRESET_QUESTIONS, HscIctPresetQuestion } from '../utils/hscIctPresets.js';
import { HscIctQuestion } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email?: string;
  };
}

// Fisher-Yates array shuffler helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export class HscIctController {
  /**
   * Auto-seed default questions if table is empty
   */
  private static async ensureQuestionsSeeded() {
    const count = await prisma.hscIctQuestion.count();
    if (count === 0) {
      console.log('[HSC ICT] Seeding default master guide question bank...');
      for (const q of HSC_ICT_PRESET_QUESTIONS) {
        await prisma.hscIctQuestion.create({
          data: {
            chapter: q.chapter,
            chapterTitle: q.chapterTitle,
            topic: q.topic || 'সাধারণ বিষয়',
            questionText: q.questionText,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            boardYear: q.boardYear || 'বোর্ড স্ট্যান্ডার্ড',
          },
        });
      }
      console.log(`[HSC ICT] Successfully seeded ${HSC_ICT_PRESET_QUESTIONS.length} questions.`);
    }
  }

  /**
   * Get available chapters & bank statistics
   */
  static async getConfig(req: Request, res: Response) {
    try {
      await HscIctController.ensureQuestionsSeeded();

      // Count questions per chapter
      const chapterCounts = await prisma.hscIctQuestion.groupBy({
        by: ['chapter'],
        _count: { id: true },
      });

      const countMap: Record<number, number> = {};
      chapterCounts.forEach((c: { chapter: number; _count: { id: number } }) => {
        countMap[c.chapter] = c._count.id;
      });

      const chaptersWithCounts = HSC_ICT_CHAPTERS.map((ch: { id: number; title: string }) => ({
        ...ch,
        totalQuestions: countMap[ch.id] || 0,
      }));

      const totalQuestionsInBank = await prisma.hscIctQuestion.count();

      return sendSuccess(res, {
        chapters: chaptersWithCounts,
        allowedLengths: [30, 40],
        totalQuestionsInBank,
      });
    } catch (error: any) {
      console.error('[HSC ICT Config Error]', error);
      return sendError(res, 'আইসিটি কনফিগ লোড করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Smart Non-Repeating Question Generator
   * Generates 30 or 40 questions, prioritizing unseen questions for the logged-in student.
   * Shuffles question order and option order for fresh randomized retakes.
   */
  static async generateExam(req: AuthenticatedRequest, res: Response) {
    try {
      await HscIctController.ensureQuestionsSeeded();
      const userId = req.user!.userId;
      const questionCount = Number(req.body.questionCount) === 40 ? 40 : 30;
      const chapterFilter = req.body.chapterFilter || 'ALL';

      // 1. Build question query filter
      const whereClause: any = {};
      if (chapterFilter !== 'ALL') {
        const chapterNum = parseInt(chapterFilter, 10);
        if (!isNaN(chapterNum)) {
          whereClause.chapter = chapterNum;
        }
      }

      // Fetch all eligible questions in database
      const allEligibleQuestions: HscIctQuestion[] = await prisma.hscIctQuestion.findMany({
        where: whereClause,
      });

      if (allEligibleQuestions.length === 0) {
        return sendError(res, 'নির্বাচিত অধ্যায়ের জন্য পর্যাপ্ত প্রশ্ন পাওয়া যায়নি।');
      }

      // 2. Find question IDs already attempted by this student
      const seenAttemptRecords = await prisma.hscIctAttemptQuestion.findMany({
        where: { userId },
        select: { questionId: true },
      });
      const seenQuestionIds = new Set(seenAttemptRecords.map((r: { questionId: string }) => r.questionId));

      // 3. Separate questions into unseen vs seen
      const unseenQuestions = allEligibleQuestions.filter((q: HscIctQuestion) => !seenQuestionIds.has(q.id));
      const seenQuestions = allEligibleQuestions.filter((q: HscIctQuestion) => seenQuestionIds.has(q.id));

      let selectedQuestions: HscIctQuestion[] = [];

      if (unseenQuestions.length >= questionCount) {
        // We have enough completely fresh, unseen questions!
        selectedQuestions = shuffleArray(unseenQuestions).slice(0, questionCount);
      } else {
        // Take all available unseen questions, fill the remaining randomly from seen questions
        const shuffledSeen = shuffleArray(seenQuestions);
        const needed = questionCount - unseenQuestions.length;
        selectedQuestions = [
          ...unseenQuestions,
          ...shuffledSeen.slice(0, needed),
        ];
      }

      // Final shuffle of question sequence
      selectedQuestions = shuffleArray(selectedQuestions);

      // 4. Randomize options order per question and strip answer keys for security
      const clientPayload = selectedQuestions.map((q: HscIctQuestion, idx: number) => {
        const rawOptions = (q.options as string[]) || [];
        // Shuffle options so options appear in random positions A, B, C, D
        const shuffledOptions = shuffleArray(rawOptions);

        return {
          id: q.id,
          displayNumber: idx + 1,
          chapter: q.chapter,
          chapterTitle: q.chapterTitle,
          topic: q.topic,
          questionText: q.questionText,
          options: shuffledOptions,
          boardYear: q.boardYear,
        };
      });

      return sendSuccess(res, {
        questionCount: clientPayload.length,
        chapterFilter,
        timeLimitMinutes: questionCount === 40 ? 35 : 25,
        questions: clientPayload,
      }, 'ডাইনামিক আইসিটি পরীক্ষার প্রশ্ন প্রস্তুত!');
    } catch (error: any) {
      console.error('[HSC ICT Generate Exam Error]', error);
      return sendError(res, 'আইসিটি পরীক্ষা শুরু করতে ব্যর্থ হয়েছে।', 500, error.message);
    }
  }

  /**
   * Submit Exam, calculate score, accuracy, award rewards, and record seen questions
   */
  static async submitExam(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const {
        questionCount = 30,
        chapterFilter = 'ALL',
        timeTakenSec = 0,
        tabSwitches = 0,
        answers = {}, // { [questionId]: chosenOptionText or chosenIndex }
        questionIds = [],
      } = req.body;

      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return sendError(res, 'প্রশ্ন তালিকা পাওয়া যায়নি।');
      }

      // Fetch official questions from database
      const questions: HscIctQuestion[] = await prisma.hscIctQuestion.findMany({
        where: { id: { in: questionIds } },
      });

      const questionMap = new Map<string, HscIctQuestion>(questions.map((q: HscIctQuestion) => [q.id, q]));

      let score = 0;
      const questionResults: any[] = [];

      for (const qId of questionIds) {
        const q = questionMap.get(qId);
        if (!q) continue;

        const rawOptions = (q.options as string[]) || [];
        const correctOptionText = rawOptions[q.correctIndex] || '';

        const studentChoice = answers[qId];
        let isCorrect = false;
        let chosenText: string | null = null;
        let selectedIndex = -1;

        if (studentChoice !== undefined && studentChoice !== null) {
          if (typeof studentChoice === 'string') {
            chosenText = studentChoice.trim();
            isCorrect = chosenText.toLowerCase() === correctOptionText.trim().toLowerCase();
            selectedIndex = rawOptions.indexOf(chosenText);
          } else if (typeof studentChoice === 'number') {
            selectedIndex = studentChoice;
            chosenText = rawOptions[selectedIndex] || null;
            isCorrect = selectedIndex === q.correctIndex;
          }
        }

        if (isCorrect) score += 1;

        questionResults.push({
          id: q.id,
          chapter: q.chapter,
          chapterTitle: q.chapterTitle,
          topic: q.topic,
          questionText: q.questionText,
          options: rawOptions,
          correctIndex: q.correctIndex,
          correctOptionText,
          chosenText,
          selectedIndex,
          isCorrect,
          explanation: q.explanation || 'সঠিক উত্তর কনসেপ্ট নোট দেখুন।',
          boardYear: q.boardYear,
        });
      }

      const totalQ = questionIds.length;
      const accuracy = totalQ > 0 ? Number(((score / totalQ) * 100).toFixed(1)) : 0;
      const gemsEarned = 3; // On-time completion bonus
      const xpEarned = score * 10 + (accuracy >= 80 ? 50 : 0);

      // Save Attempt in database
      const attempt = await prisma.hscIctExamAttempt.create({
        data: {
          userId,
          questionCount: totalQ,
          chapterFilter: String(chapterFilter),
          score,
          accuracy,
          timeTakenSec: Math.max(1, Number(timeTakenSec)),
          tabSwitches: Number(tabSwitches) || 0,
          xpEarned,
          gemsEarned,
          answers,
          questionsSnapshot: questionResults,
        },
      });

      // Record questions as seen by this student to prioritize new questions on next retake
      const attemptQuestionRecords = questionResults.map((qr) => ({
        attemptId: attempt.id,
        questionId: qr.id,
        userId,
        isCorrect: qr.isCorrect,
      }));

      await prisma.hscIctAttemptQuestion.createMany({
        data: attemptQuestionRecords,
      });

      // Update student profile streak and totalXp
      const profile = await prisma.studentProfile.findUnique({ where: { userId } });
      const currentStreak = Math.max(1, profile?.currentStreak || 1);
      const updatedXp = (profile?.totalXp || 0) + xpEarned;

      await prisma.studentProfile.update({
        where: { userId },
        data: {
          currentStreak,
          totalXp: updatedXp,
        },
      });

      return sendSuccess(res, {
        attemptId: attempt.id,
        score,
        totalQuestions: totalQ,
        accuracy,
        timeTakenSec,
        tabSwitches,
        xpEarned,
        gemsEarned,
        questionsReview: questionResults,
      }, 'আপনার আইসিটি পরীক্ষা সফলভাবে সম্পন্ন হয়েছে!');
    } catch (error: any) {
      console.error('[HSC ICT Submit Exam Error]', error);
      return sendError(res, 'পরীক্ষা সাবমিট করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * HSC ICT Top Performers Leaderboard
   * Ranked by average accuracy, total score, and total questions solved
   */
  static async getLeaderboard(req: Request, res: Response) {
    try {
      const attempts = await prisma.hscIctExamAttempt.findMany({
        include: {
          user: {
            include: {
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
        orderBy: [{ accuracy: 'desc' }, { score: 'desc' }, { timeTakenSec: 'asc' }],
        take: 100,
      });

      // Group per student to get aggregate performance
      const studentMap = new Map<string, any>();

      attempts.forEach((att: any) => {
        const uId = att.userId;
        if (!studentMap.has(uId)) {
          studentMap.set(uId, {
            userId: uId,
            name: att.user.name,
            studentId: att.user.profile?.studentIdNumber || 'ID Pending',
            academicLevel: att.user.profile?.academicLevel || 'HSC ICT',
            batchName: att.user.profile?.batch?.name || 'HSC ICT Batch',
            avatarUrl: att.user.profile?.avatarUrl,
            totalAttempts: 0,
            bestScore: 0,
            bestAccuracy: 0,
            totalScore: 0,
            totalQuestions: 0,
            totalXp: 0,
            fastestTimeSec: 999999,
          });
        }

        const stats = studentMap.get(uId);
        stats.totalAttempts += 1;
        stats.totalScore += att.score;
        stats.totalQuestions += att.questionCount;
        stats.totalXp += att.xpEarned;
        if (att.score > stats.bestScore) stats.bestScore = att.score;
        if (att.accuracy > stats.bestAccuracy) stats.bestAccuracy = att.accuracy;
        if (att.timeTakenSec < stats.fastestTimeSec) stats.fastestTimeSec = att.timeTakenSec;
      });

      const aggregatedList = Array.from(studentMap.values()).map((s: any) => ({
        ...s,
        averageAccuracy:
          s.totalQuestions > 0 ? Number(((s.totalScore / s.totalQuestions) * 100).toFixed(1)) : 0,
      }));

      // Rank by average accuracy DESC, total score DESC, fastest time ASC
      aggregatedList.sort((a: any, b: any) => {
        if (b.averageAccuracy !== a.averageAccuracy) return b.averageAccuracy - a.averageAccuracy;
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.fastestTimeSec - b.fastestTimeSec;
      });

      const ranked = aggregatedList.map((st: any, idx: number) => ({
        ...st,
        rank: idx + 1,
      }));

      const champion = ranked[0] || null;
      const podium = ranked.slice(0, 3);

      return sendSuccess(res, {
        champion,
        podium,
        rankings: ranked,
        totalParticipants: ranked.length,
      });
    } catch (error: any) {
      console.error('[HSC ICT Leaderboard Error]', error);
      return sendError(res, 'লিডারবোর্ড লোড করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Get student's past exam history
   */
  static async getMyHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const history = await prisma.hscIctExamAttempt.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 20,
      });

      const totalAttempts = history.length;
      const totalScore = history.reduce((acc: number, h: { score: number }) => acc + h.score, 0);
      const totalQuestions = history.reduce((acc: number, h: { questionCount: number }) => acc + h.questionCount, 0);
      const averageAccuracy =
        totalQuestions > 0 ? Number(((totalScore / totalQuestions) * 100).toFixed(1)) : 0;

      return sendSuccess(res, {
        totalAttempts,
        totalScore,
        totalQuestions,
        averageAccuracy,
        recentAttempts: history,
      });
    } catch (error: any) {
      console.error('[HSC ICT History Error]', error);
      return sendError(res, 'হিস্ট্রি লোড করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin: Upload bulk HSC ICT questions
   */
  static async adminUploadQuestions(req: AuthenticatedRequest, res: Response) {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        return sendError(res, 'প্রশ্নের তালিকা (JSON Array) প্রদান করুন।');
      }

      let insertedCount = 0;
      for (const q of questions) {
        if (!q.questionText || !Array.isArray(q.options) || q.options.length < 4) {
          continue;
        }

        const chapter = parseInt(q.chapter, 10) || 1;
        const matchedCh = HSC_ICT_CHAPTERS.find((c: { id: number; title: string }) => c.id === chapter);

        await prisma.hscIctQuestion.create({
          data: {
            chapter,
            chapterTitle: q.chapterTitle || matchedCh?.title || `অধ্যায় ${chapter}`,
            topic: q.topic || 'সাধারণ বিষয়',
            questionText: q.questionText,
            options: q.options.slice(0, 4),
            correctIndex: Math.min(3, Math.max(0, parseInt(q.correctIndex, 10) || 0)),
            explanation: q.explanation || 'সঠিক উত্তর কনসেপ্ট নোট দেখুন।',
            boardYear: q.boardYear || 'বোর্ড স্ট্যান্ডার্ড',
          },
        });
        insertedCount++;
      }

      return sendSuccess(
        res,
        { insertedCount },
        `সফলভাবে ${insertedCount}টি আইসিটি বহুনির্বাচনি প্রশ্ন যুক্ত করা হয়েছে!`
      );
    } catch (error: any) {
      console.error('[Admin Upload Questions Error]', error);
      return sendError(res, 'প্রশ্ন আপলোড করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin: Seed default preset questions
   */
  static async adminSeedPresets(req: AuthenticatedRequest, res: Response) {
    try {
      let count = 0;
      for (const q of HSC_ICT_PRESET_QUESTIONS) {
        await prisma.hscIctQuestion.create({
          data: {
            chapter: q.chapter,
            chapterTitle: q.chapterTitle,
            topic: q.topic || 'সাধারণ বিষয়',
            questionText: q.questionText,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            boardYear: q.boardYear || 'বোর্ড স্ট্যান্ডার্ড',
          },
        });
        count++;
      }
      return sendSuccess(res, { count }, `${count}টি মাস্টার গাইড প্রশ্ন সফলভাবে লোড করা হয়েছে!`);
    } catch (error: any) {
      console.error('[Admin Seed Presets Error]', error);
      return sendError(res, 'প্রিসেট প্রশ্ন লোড করতে ব্যর্থ হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin: List questions
   */
  static async adminListQuestions(req: Request, res: Response) {
    try {
      const chapter = req.query.chapter ? parseInt(req.query.chapter as string, 10) : undefined;
      const where: any = {};
      if (chapter) where.chapter = chapter;

      const questions = await prisma.hscIctQuestion.findMany({
        where,
        orderBy: [{ chapter: 'asc' }, { createdAt: 'desc' }],
        take: 200,
      });

      return sendSuccess(res, questions);
    } catch (error: any) {
      console.error('[Admin List Questions Error]', error);
      return sendError(res, 'প্রশ্ন তালিকা লোড করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin: Delete question
   */
  static async adminDeleteQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.hscIctQuestion.delete({ where: { id } });
      return sendSuccess(res, null, 'প্রশ্ন মুছে ফেলা হয়েছে।');
    } catch (error: any) {
      console.error('[Admin Delete Question Error]', error);
      return sendError(res, 'প্রশ্ন মুছে ফেলতে ব্যর্থ হয়েছে।', 500, error.message);
    }
  }
}

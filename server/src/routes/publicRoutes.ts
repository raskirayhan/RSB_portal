import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * Public Landing Data: Batches, Subjects, Demo Videos, Achievements
 */
router.get('/landing-data', async (req: Request, res: Response) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { isActive: true },
      include: { _count: { select: { students: true } } },
    });

    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          take: 4,
          select: { id: true, title: true, chapterNumber: true },
        },
      },
    });

    const demoVideos = await prisma.demoVideo.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const achievements = [
      { year: '2025', count: '48+ GPA-5', description: 'SSC Science Batch All-Board Top Scorers' },
      { year: '2025', count: '32+ BUET/Medical', description: 'HSC Alumni in BUET, DMC, DU, RUET' },
      { year: '2024', count: '100% Pass Rate', description: 'Higher Math & Physics 90+ Score average' },
    ];

    const reviews = [
      {
        studentName: 'তানভীর আহমেদ',
        badge: 'BUET CSE (Ex-RSB)',
        college: 'Notre Dame College',
        comment: 'রায়হান স্যারের ফিজিক্স ও হায়ার ম্যাথের কনসেপ্ট ক্লিয়ারিং মেথড অনন্য। কঠিন টপিকগুলো নিমিষেই সহজ হয়ে যেত।',
      },
      {
        studentName: 'রাবেয়া সুলতানা',
        badge: 'DMC (Ex-RSB)',
        college: 'Viqarunnisa Noon College',
        comment: 'রসায়নের জৈব যৌগ ও বায়োলজি নোটসগুলো অসম্ভব গোছানো। বিশেষ করে ওয়াটারমার্কড লেকচার শিটগুলো রিভিশনে সবচেয়ে কাজে দিয়েছে।',
      },
      {
        studentName: 'মো: আব্দুল্লাহ',
        badge: 'SSC 2025 (Golden GPA-5)',
        college: 'Rajuk Uttara Model College',
        comment: 'প্রতি মাসে গার্ডিয়ান রিপোর্ট পাওয়ায় বাবা-মা সবসময় আমার পড়াশোনার আপডেট জানতেন। ইন-অ্যাপ সায়েন্স গেমসগুলো পড়াশোনার ক্লান্তি দূর করত।',
      },
    ];

    return sendSuccess(res, {
      batches,
      subjects,
      demoVideos,
      achievements,
      reviews,
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch public landing data.', 500);
  }
});

export default router;

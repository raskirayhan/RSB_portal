import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parseDriveUrl } from '../utils/studyNoteUtils.js';
import { STUDY_NOTE_SEEDS } from '../utils/studyNoteSeeds.js';
import { StudyNote } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email?: string;
  };
}

export class StudyVaultController {
  /**
   * Auto-seed default Study Notes if table is empty
   */
  public static async ensureNotesSeeded() {
    try {
      const count = await prisma.studyNote.count();
      if (count === 0) {
        console.log('[Study Vault] Seeding default Rayhan Sir study notes and PDFs...');
        for (const item of STUDY_NOTE_SEEDS) {
          await prisma.studyNote.create({
            data: {
              classLevel: item.classLevel,
              subject: item.subject,
              chapterNumber: item.chapterNumber,
              chapterName: item.chapterName,
              title: item.title,
              driveFileUrl: item.driveFileUrl,
            },
          });
        }
        console.log(`[Study Vault] Successfully seeded ${STUDY_NOTE_SEEDS.length} study notes.`);
      }
    } catch (err) {
      console.error('[Study Vault] Error checking/seeding study notes', err);
    }
  }

  /**
   * Get all study notes with optional filtering (classLevel, subject, search)
   * Enriches each note with auto-parsed previewUrl and 1-click downloadUrl
   */
  static async getNotes(req: Request, res: Response) {
    try {
      await StudyVaultController.ensureNotesSeeded();

      const { classLevel, subject, search } = req.query;

      const where: any = {};

      // 1. Class Filter (e.g. SSC vs HSC)
      if (classLevel && classLevel !== 'ALL') {
        const cLvl = String(classLevel).toUpperCase();
        if (cLvl.includes('SSC') || cLvl.includes('9') || cLvl.includes('10')) {
          where.classLevel = { in: ['SSC', 'SSC_9', 'SSC_10', 'SSC_2026', 'CLASS_8'] };
        } else if (cLvl.includes('HSC') || cLvl.includes('11') || cLvl.includes('12')) {
          where.classLevel = { in: ['HSC', 'HSC_11', 'HSC_12', 'HSC_2026', 'HSC_2027'] };
        } else {
          where.classLevel = cLvl;
        }
      }

      // 2. Subject Filter
      if (subject && subject !== 'ALL') {
        where.subject = String(subject).toUpperCase();
      }

      // 3. Search Filter
      if (search && String(search).trim()) {
        const query = String(search).trim();
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { chapterName: { contains: query, mode: 'insensitive' } },
          { subject: { contains: query, mode: 'insensitive' } },
        ];
      }

      const notes: StudyNote[] = await prisma.studyNote.findMany({
        where,
        orderBy: [{ chapterNumber: 'asc' }, { createdAt: 'desc' }],
      });

      // Enrich notes with auto-parsed Google Drive preview and 1-click download links
      const enrichedNotes = notes.map((note) => {
        const parsed = parseDriveUrl(note.driveFileUrl);
        return {
          id: note.id,
          classLevel: note.classLevel,
          subject: note.subject,
          chapterNumber: note.chapterNumber,
          chapterName: note.chapterName,
          title: note.title,
          driveFileUrl: note.driveFileUrl,
          previewUrl: parsed.previewUrl,
          downloadUrl: parsed.downloadUrl,
          isGoogleDoc: parsed.isGoogleDoc,
          fileId: parsed.fileId,
          createdAt: note.createdAt,
        };
      });

      return sendSuccess(res, enrichedNotes, 'Study notes fetched successfully.');
    } catch (error: any) {
      console.error('[Study Vault Get Notes Error]', error);
      return sendError(res, 'নোট তালিকা লোড করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin: Add a new Google Drive / Docs study note
   */
  static async createNote(req: AuthenticatedRequest, res: Response) {
    try {
      const { classLevel, subject, chapterNumber, chapterName, title, driveFileUrl } = req.body;

      if (!subject || !title || !driveFileUrl) {
        return sendError(res, 'বিষয়, শিরোনাম এবং গুগল ড্রাইভ লিংক প্রদান করা বাধ্যতামূলক।');
      }

      const note = await prisma.studyNote.create({
        data: {
          classLevel: classLevel || 'SSC',
          subject: String(subject).toUpperCase(),
          chapterNumber: parseInt(chapterNumber, 10) || 0,
          chapterName: chapterName || 'সাধারণ অধ্যায়',
          title: title.trim(),
          driveFileUrl: driveFileUrl.trim(),
        },
      });

      const parsed = parseDriveUrl(note.driveFileUrl);
      const enriched = {
        ...note,
        previewUrl: parsed.previewUrl,
        downloadUrl: parsed.downloadUrl,
        isGoogleDoc: parsed.isGoogleDoc,
      };

      return sendSuccess(res, enriched, 'নতুন স্টাডি নোট সফলভাবে যুক্ত করা হয়েছে!');
    } catch (error: any) {
      console.error('[Study Vault Create Note Error]', error);
      return sendError(res, 'নোট যুক্ত করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin: Delete a study note
   */
  static async deleteNote(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.studyNote.delete({ where: { id } });
      return sendSuccess(res, null, 'নোট সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (error: any) {
      console.error('[Study Vault Delete Note Error]', error);
      return sendError(res, 'নোট মুছতে সমস্যা হয়েছে।', 500, error.message);
    }
  }

  /**
   * Admin: 1-Click Seed/Restore Default Notes
   */
  static async seedDefaultNotes(req: AuthenticatedRequest, res: Response) {
    try {
      let count = 0;
      for (const item of STUDY_NOTE_SEEDS) {
        const exists = await prisma.studyNote.findFirst({
          where: { title: item.title, subject: item.subject },
        });
        if (!exists) {
          await prisma.studyNote.create({
            data: {
              classLevel: item.classLevel,
              subject: item.subject,
              chapterNumber: item.chapterNumber,
              chapterName: item.chapterName,
              title: item.title,
              driveFileUrl: item.driveFileUrl,
            },
          });
          count++;
        }
      }

      return sendSuccess(res, { count }, `${count}টি নতুন ড্রাইভ নোট ডেটাবেজে যুক্ত করা হয়েছে!`);
    } catch (error: any) {
      console.error('[Study Vault Seed Notes Error]', error);
      return sendError(res, 'নোট সিড করতে সমস্যা হয়েছে।', 500, error.message);
    }
  }
}

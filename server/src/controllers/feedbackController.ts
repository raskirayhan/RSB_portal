import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class FeedbackController {
  /**
   * Get Student Academic Feedback Thread
   */
  static async getFeedback(req: AuthenticatedRequest, res: Response) {
    try {
      const feedbackList = await prisma.studentFeedback.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, feedbackList);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch feedback.', 500);
    }
  }

  /**
   * Student reply / doubt submission to Rayhan Sir
   */
  static async replyFeedback(req: AuthenticatedRequest, res: Response) {
    try {
      const { feedbackId, replyText } = req.body;

      if (!feedbackId || !replyText) {
        return sendError(res, 'Feedback ID and reply message are required.');
      }

      const feedback = await prisma.studentFeedback.findUnique({
        where: { id: feedbackId },
      });

      if (!feedback || feedback.userId !== req.user!.userId) {
        return sendError(res, 'Feedback not found or unauthorized.', 404);
      }

      const updated = await prisma.studentFeedback.update({
        where: { id: feedbackId },
        data: {
          studentReply: replyText.trim(),
        },
      });

      return sendSuccess(res, updated, 'Your reply and doubts have been sent to Rayhan Sir.');
    } catch (error: any) {
      return sendError(res, 'Failed to update reply.', 500);
    }
  }
}

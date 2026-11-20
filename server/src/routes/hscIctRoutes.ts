import { Router } from 'express';
import { HscIctController } from '../controllers/hscIctController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Student Exam & Config endpoints
router.get('/config', HscIctController.getConfig);
router.post('/generate-exam', authenticateJWT, HscIctController.generateExam);
router.post('/submit-exam', authenticateJWT, HscIctController.submitExam);
router.get('/leaderboard', HscIctController.getLeaderboard);
router.get('/my-history', authenticateJWT, HscIctController.getMyHistory);

// Admin Question Bank endpoints
router.post('/admin/upload-questions', authenticateJWT, requireRole([Role.SUPER_ADMIN]), HscIctController.adminUploadQuestions);
router.post('/admin/seed-presets', authenticateJWT, requireRole([Role.SUPER_ADMIN]), HscIctController.adminSeedPresets);
router.get('/admin/questions', authenticateJWT, requireRole([Role.SUPER_ADMIN]), HscIctController.adminListQuestions);
router.delete('/admin/questions/:id', authenticateJWT, requireRole([Role.SUPER_ADMIN]), HscIctController.adminDeleteQuestion);

export default router;

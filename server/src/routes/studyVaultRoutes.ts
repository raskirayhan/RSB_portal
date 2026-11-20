import { Router } from 'express';
import { StudyVaultController } from '../controllers/studyVaultController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Student / Public: Fetch notes with auto-parsed drive preview & download links
router.get('/notes', StudyVaultController.getNotes);

// Admin Management Endpoints
router.post('/admin/notes', authenticateJWT, requireRole([Role.SUPER_ADMIN]), StudyVaultController.createNote);
router.delete('/admin/notes/:id', authenticateJWT, requireRole([Role.SUPER_ADMIN]), StudyVaultController.deleteNote);
router.post('/admin/seed-notes', authenticateJWT, requireRole([Role.SUPER_ADMIN]), StudyVaultController.seedDefaultNotes);

export default router;

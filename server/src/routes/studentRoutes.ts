import { Router } from 'express';
import { StudentController } from '../controllers/studentController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Mandatory Onboarding Complete Endpoint
router.post('/complete-onboarding', authenticateJWT, StudentController.completeOnboarding);

export default router;

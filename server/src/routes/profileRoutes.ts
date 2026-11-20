import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { StudentController } from '../controllers/studentController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);
router.post('/complete-onboarding', StudentController.completeOnboarding);
router.get('/qr-badge', ProfileController.getQrBadge);
router.get('/milestones', ProfileController.getMilestones);

export default router;

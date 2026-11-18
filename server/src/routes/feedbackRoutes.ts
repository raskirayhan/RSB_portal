import { Router } from 'express';
import { FeedbackController } from '../controllers/feedbackController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', FeedbackController.getFeedback);
router.post('/reply', FeedbackController.replyFeedback);

export default router;

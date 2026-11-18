import { Router } from 'express';
import { GameController } from '../controllers/gameController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.post('/score', GameController.submitScore);
router.get('/leaderboard', GameController.getLeaderboard);
router.get('/badges', GameController.getBadges);

export default router;

import { Router } from 'express';
import { GameController } from '../controllers/gameController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Mode A: Casual practice mini-games
router.post('/score', authenticateJWT, GameController.submitScore);
router.get('/leaderboard', authenticateJWT, GameController.getLeaderboard);
router.get('/badges', authenticateJWT, GameController.getBadges);

// Mode B: 24-Hour Live 25-MCQ Science Championship
router.get('/championship/active', authenticateJWT, GameController.getActiveChampionship);
router.post('/championship/submit', authenticateJWT, GameController.submitChampionshipAttempt);
router.get('/championship/leaderboard', GameController.getChampionshipLeaderboard);
router.get('/championship/presets', GameController.getChampionshipPresets);
router.post('/championship/create', authenticateJWT, GameController.createChampionship);
router.post('/championship/deactivate', authenticateJWT, GameController.deactivateChampionship);

export default router;

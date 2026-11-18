import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJWT, rateLimitOtp } from '../middleware/auth.js';

const router = Router();

router.post('/register', rateLimitOtp(5), AuthController.register);
router.post('/verify-otp', rateLimitOtp(10), AuthController.verifyOtp);
router.post('/login', AuthController.login);
router.get('/me', authenticateJWT, AuthController.getMe);
router.get('/sessions', authenticateJWT, AuthController.getActiveSessions);
router.delete('/sessions/:sessionId', authenticateJWT, AuthController.terminateSession);
router.post('/forgot-password', rateLimitOtp(3), AuthController.forgotPassword);
router.post('/reset-password', rateLimitOtp(5), AuthController.resetPassword);

export default router;

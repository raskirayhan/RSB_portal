import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJWT, rateLimitOtp } from '../middleware/auth.js';

const router = Router();

// 1. Instant Registration (No OTP required)
router.post('/register', AuthController.register);

// 2. Login with Email OR Phone + Password
router.post('/login', AuthController.login);

// 3. Social Authentication (Google / Facebook)
router.post('/social', AuthController.socialAuth);
router.get('/google/callback', AuthController.googleOAuthCallback);

// 4. Session & Me Management
router.get('/me', authenticateJWT, AuthController.getMe);
router.get('/sessions', authenticateJWT, AuthController.getActiveSessions);
router.delete('/sessions/:sessionId', authenticateJWT, AuthController.terminateSession);

// 5. Forgot Password (6-Digit Email OTP - 5 mins) & Reset Password
router.post('/forgot-password', rateLimitOtp(5), AuthController.forgotPassword);
router.post('/reset-password', rateLimitOtp(10), AuthController.resetPassword);

export default router;

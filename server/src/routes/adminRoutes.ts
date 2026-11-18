import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole([Role.SUPER_ADMIN]));

router.get('/analytics', AdminController.getOverviewAnalytics);
router.get('/students', AdminController.getStudents);
router.post('/batches', AdminController.createBatch);
router.post('/materials', AdminController.uploadMaterial);
router.post('/demo-videos', AdminController.createDemoVideo);
router.get('/payments/pending', AdminController.getPendingPayments);
router.post('/payments/review', AdminController.reviewPayment);
router.post('/attendance/scan-qr', AdminController.scanQrAttendance);
router.post('/feedback', AdminController.postFeedback);
router.post('/billing/trigger', AdminController.triggerMonthlyBilling);

export default router;

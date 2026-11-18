import { Router } from 'express';
import { BillingController } from '../controllers/billingController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/invoices', BillingController.getStudentInvoices);
router.post('/submit-manual', BillingController.submitManualPayment);
router.get('/receipt/:receiptId', BillingController.downloadReceipt);

export default router;

import { Router } from 'express';
import { VaultController } from '../controllers/vaultController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/subjects', VaultController.getSubjects);
router.get('/materials', VaultController.getMaterials);
router.get('/download/:materialId', VaultController.downloadWatermarkedMaterial);

export default router;

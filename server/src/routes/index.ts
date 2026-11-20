import { Router } from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import vaultRoutes from './vaultRoutes.js';
import billingRoutes from './billingRoutes.js';
import gameRoutes from './gameRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import adminRoutes from './adminRoutes.js';
import publicRoutes from './publicRoutes.js';
import hscIctRoutes from './hscIctRoutes.js';
import studyVaultRoutes from './studyVaultRoutes.js';

const router = Router();

router.use('/public', publicRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/vault', vaultRoutes);
router.use('/study-vault', studyVaultRoutes);
router.use('/billing', billingRoutes);
router.use('/games', gameRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);
router.use('/hsc-ict', hscIctRoutes);

export default router;

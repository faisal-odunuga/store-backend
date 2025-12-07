import express from 'express';
import * as statsController from '../controllers/stats.controller.js';
import * as authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Admin only
router.use(authMiddleware.restrictTo('ADMIN'));

router.get('/dashboard', statsController.getDashboardStats);

export default router;

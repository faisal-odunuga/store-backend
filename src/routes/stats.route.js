import express from 'express';
import * as statsController from '../controllers/stats.controller.js';
import * as authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.get(
  '/dashboard',
  authMiddleware.protect,
  authMiddleware.restrictTo('ADMIN'),
  statsController.getDashboardStats
);

export default router;

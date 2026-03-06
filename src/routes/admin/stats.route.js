import express from 'express';
import * as statsController from '../../controllers/stats.controller.js';
import * as authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(
  authMiddleware.protect,
  authMiddleware.restrictTo('ADMIN', 'MANAGER')
);

router.get('/', statsController.getDashboardStats);
router.get('/revenue', statsController.getRevenueOverTime);

export default router;

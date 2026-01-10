import express from 'express';
import * as statsController from '../../controllers/stats.controller.js';
import * as authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo('ADMIN'));

router.get('/', statsController.getDashboardStats);

export default router;

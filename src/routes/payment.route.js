import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

import validateZod from '../middlewares/zod.middleware.js';
import { initializePaymentSchema } from '../validators/payment.schema.js';

router.post(
  '/initialize',
  authMiddleware.protect,
  authMiddleware.restrictTo('CUSTOMER'),
  validateZod(initializePaymentSchema),
  paymentController.initializePayment
);
router.get(
  '/verify',
  authMiddleware.protect,
  authMiddleware.restrictTo('CUSTOMER'),
  paymentController.verifyPayment
);

export default router;

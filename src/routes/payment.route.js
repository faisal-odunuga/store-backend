import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import * as authMiddleware from '../middlewares/auth.js';

const router = express.Router();

import validateZod from '../middlewares/validateZod.js';
import { initializePaymentSchema } from '../validators/payment.schema.js';

router.post(
  '/initialize',
  authMiddleware.protect,
  validateZod(initializePaymentSchema),
  paymentController.initializePayment
);
router.get('/verify', authMiddleware.protect, paymentController.verifyPayment);

export default router;

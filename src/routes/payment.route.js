import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import * as authMiddleware from '../middlewares/auth.js';

const router = express.Router();

import validateZod from '../middlewares/validateZod.js';
import { initializePaymentSchema } from '../validators/payment.schema.js';

router.use(authMiddleware.protect);

router.post(
  '/initialize',
  validateZod(initializePaymentSchema),
  paymentController.initializePayment
);
router.get('/verify', paymentController.verifyPayment);

export default router;

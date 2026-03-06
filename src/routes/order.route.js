import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import validateZod from '../middlewares/zod.middleware.js';
import { createOrderSchema } from '../validators/order.schema.js';

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('CUSTOMER'));

router
  .route('/')
  .post(validateZod(createOrderSchema), orderController.createOrder)
  .get(orderController.getMyOrders);

router.route('/:id').get(orderController.getOrder);

export default router;

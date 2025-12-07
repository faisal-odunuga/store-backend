import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import * as authMiddleware from '../middlewares/auth.js';
import validateZod from '../middlewares/validateZod.js';
import { updateOrderStatusSchema } from '../validators/order.schema.js';

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getMyOrders);

router
  .route('/all-orders')
  .get(authMiddleware.restrictTo('ADMIN'), orderController.getAllOrders);

router
  .route('/:id')
  .get(orderController.getOrder)
  .patch(
    authMiddleware.restrictTo('ADMIN'),
    validateZod(updateOrderStatusSchema.partial()),
    orderController.updateOrderStatus
  );

export default router;

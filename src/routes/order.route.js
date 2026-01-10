import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import * as authMiddleware from '../middlewares/auth.js';
import validateZod from '../middlewares/validateZod.js';
import { updateOrderStatusSchema } from '../validators/order.schema.js';

const router = express.Router();

router
  .route('/')
  .post(authMiddleware.protect, orderController.createOrder)
  .get(authMiddleware.protect, orderController.getMyOrders);

// ADMIN ROUTES MOVED TO /admin/orders

router.route('/:id').get(authMiddleware.protect, orderController.getOrder);

export default router;

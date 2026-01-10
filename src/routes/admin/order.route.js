import express from 'express';
import * as orderController from '../../controllers/order.controller.js';
import * as authMiddleware from '../../middlewares/auth.js';
import validateZod from '../../middlewares/validateZod.js';
import { updateOrderStatusSchema } from '../../validators/order.schema.js';

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo('ADMIN'));

router.route('/').get(orderController.getAllOrders);

router
  .route('/:id/status') // Changed structure slightly to be RESTful under /admin/orders
  .patch(
    validateZod(updateOrderStatusSchema.partial()),
    orderController.updateOrderStatus
  );

export default router;

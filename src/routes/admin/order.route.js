import express from 'express';
import * as orderController from '../../controllers/order.controller.js';
import * as authMiddleware from '../../middlewares/auth.middleware.js';
import validateZod from '../../middlewares/zod.middleware.js';
import { updateOrderStatusSchema } from '../../validators/order.schema.js';
import validateId from '../../middlewares/id.middleware.js';

const router = express.Router();

router.use(
  authMiddleware.protect,
  authMiddleware.restrictTo('ADMIN', 'MANAGER')
);

router.route('/').get(orderController.getAllOrders);

router
  .route('/:id')
  .all(validateId)
  .get(orderController.getOrder);

router
  .route('/:id/status')
  .patch(
    validateId,
    validateZod(updateOrderStatusSchema),
    orderController.updateOrderStatus
  );

export default router;

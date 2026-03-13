import express from 'express';
import productRouter from './product.route.js';
import adminRouter from './admin/index.js';
import userRouter from './user.route.js';
import authRouter from './auth.route.js';
import cartRouter from './cart.route.js';
import orderRouter from './order.route.js';
import paymentRouter from './payment.route.js';
import reviewRouter from './review.route.js';
import webhookRouter from './webhook.route.js';

const router = express.Router();

router.use('/products', productRouter);
router.use('/admin', adminRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/payments', paymentRouter);
router.use('/reviews', reviewRouter);
router.use('/webhooks', webhookRouter);

export default router;

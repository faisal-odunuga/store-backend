import express from 'express';
import productRouter from './product.route.js';
import authRouter from './auth.route.js';
import cartRouter from './cart.route.js';
import orderRouter from './order.route.js';
import userRouter from './user.route.js';
import paymentRouter from './payment.route.js';
import statsRouter from './stats.route.js';
import reviewRouter from './review.route.js';

const router = express.Router();

// Mount all routes
router.use('/products', productRouter);
router.use('/auth', authRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/users', userRouter);
router.use('/payments', paymentRouter);
router.use('/stats', statsRouter);
router.use('/reviews', reviewRouter);

export default router;

import express from 'express';
import productRouter from './product.route.js';
import authRouter from './auth.route.js';
import orderRouter from './order.route.js';
import userRouter from './user.route.js';
import paymentRouter from './payment.route.js';
import reviewRouter from './review.route.js';
import adminRouter from './admin/index.js';
import cartRouter from './cart.route.js';

const router = express.Router();

// Public routes
router.use('/products', productRouter);
router.use('/reviews', reviewRouter);

// Auth routes (webhook is public, /me is protected)
router.use('/auth', authRouter);

// Authenticated customer routes
router.use('/orders', orderRouter);
router.use('/users', userRouter);
router.use('/payments', paymentRouter);
router.use('/cart', cartRouter);

// Admin Routes
router.use('/admin', adminRouter);

export default router;

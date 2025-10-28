import express from 'express';
import productRouter from './product.routes.js';
import authRouter from './auth.routes.js';
import cartRouter from './cart.routes.js';
import orderRouter from './order.routes.js';
import userRouter from './user.routes.js';

const router = express.Router();

// Mount all routes
router.use('/products', productRouter);
router.use('/auth', authRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/users', userRouter);

export default router;

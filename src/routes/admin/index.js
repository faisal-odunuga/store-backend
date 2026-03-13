import express from 'express';
import productRouter from './product.route.js';
import userRouter from './user.route.js';
import orderRouter from './order.route.js';
import statsRouter from './stats.route.js';
import inventoryRouter from './inventory.route.js';
import reviewRouter from './review.route.js';

const router = express.Router();

router.use('/products', productRouter);
router.use('/users', userRouter);
router.use('/orders', orderRouter);
router.use('/dashboard', statsRouter);
router.use('/inventory', inventoryRouter);
router.use('/reviews', reviewRouter);

export default router;

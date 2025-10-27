const express = require('express');
const productRouter = require('./product.routes');
const authRouter = require('./auth.routes');
const cartRouter = require('./cart.routes');
const orderRouter = require('./order.routes');
const userRouter = require('./user.routes');


const router = express.Router();

// Mount all routes
router.use('/products', productRouter);
router.use('/auth', authRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/users', userRouter);

module.exports = router;

import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import validateZod from '../middlewares/zod.middleware.js';
import { addToCart, updateQuantity } from '../validators/cart.schema.js';

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo('CUSTOMER'));

router.route('/')
  .post(validateZod(addToCart), cartController.addToCart)
  .get(cartController.getCartItems)
  .delete(cartController.clearCart);

router.route('/:id')
  .patch(validateZod(updateQuantity), cartController.updateCartItem)
  .delete(cartController.removeFromCart);

export default router;

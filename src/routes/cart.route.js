import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import validateId from '../middlewares/validateId.js';
import * as authMiddleWare from '../middlewares/auth.js';
import validateZod from '../middlewares/validateZod.js';
import { addToCart, updateQuantity } from '../validators/cart.schema.js';

const router = express.Router();

router
  .route('/')
  .post(
    authMiddleWare.protect,
    validateZod(addToCart),
    cartController.addToCart
  )
  .get(authMiddleWare.protect, cartController.getCartItems)
  .delete(authMiddleWare.protect, cartController.clearCart);

router
  .route('/:id')
  .all(validateId)
  .patch(
    authMiddleWare.protect,
    validateZod(updateQuantity),
    cartController.updateCartItem
  )
  .delete(authMiddleWare.protect, cartController.removeFromCart);

export default router;

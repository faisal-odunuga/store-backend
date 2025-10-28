import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import validateId from '../middlewares/validateId.js';
import * as authMiddleWare from '../middlewares/auth.js';
import validateZod from '../middlewares/validateZod.js';
import { addToCart } from '../validations/cart.schema.js';
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
  .patch(authMiddleWare.protect, validateId, cartController.updateQuantity)
  .delete(authMiddleWare.protect, validateId, cartController.deleteCartItem);

export default router;

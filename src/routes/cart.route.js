import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import validateId from '../middlewares/validateId.js';
import * as authMiddleWare from '../middlewares/auth.js';
import validateZod from '../middlewares/validateZod.js';
import { addToCart, updateQuantity } from '../validators/cart.schema.js';

const router = express.Router();

router.use(authMiddleWare.protect);
router
  .route('/')
  .post(validateZod(addToCart), cartController.addToCart)
  .get(cartController.getCartItems)
  .delete(cartController.clearCart);

router
  .route('/:id')
  .all(validateId)
  .patch(validateZod(updateQuantity), cartController.updateCartItem)
  .delete(cartController.removeFromCart);

export default router;

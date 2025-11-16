import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import validateId from '../middlewares/validateId.js';
import * as authMiddleWare from '../middlewares/auth.js';
import validateZod from '../middlewares/validateZod.js';
import { addToCart } from '../validations/cart.schema.js';
const router = express.Router();

router.use(authMiddleWare.protect);
router
  .route('/')
  .post(validateZod(addToCart), cartController.addToCart)
  .get(cartController.getCartItems)
  .delete(cartController.clearCart);

router.use(validateId);
router
  .route('/:id')
  .patch(cartController.updateQuantity)
  .delete(cartController.deleteCartItem);

export default router;

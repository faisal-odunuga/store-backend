const express = require('express');
const cartController = require('../../src/controllers/cart.controller');
const validateId = require('../../src/middlewares/validateId');
const authMiddleWare = require('../../src/middlewares/auth');
const validateZod = require('../middlewares/validateZod');
const { addToCart } = require('../validations/cart.schema');
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

module.exports = router;

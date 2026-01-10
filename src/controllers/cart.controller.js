import * as cartService from '../services/cart.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const cartItem = await cartService.addToCart(
    req.user.id,
    productId,
    quantity
  );
  apiResponse(res, 200, 'Item added to cart', { cartItem });
});

export const getCartItems = catchAsync(async (req, res, next) => {
  const cart = await cartService.getCart(req.user.id);
  apiResponse(res, 200, 'Cart retrieved successfully', { cart });
});

export const updateCartItem = catchAsync(async (req, res, next) => {
  const { id: productId } = req.params;
  const { quantity } = req.body;

  const cartItem = await cartService.updateCartItem(
    req.user.id,
    productId,
    quantity
  );

  apiResponse(res, 200, 'Cart item updated', { cartItem });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  const { id: productId } = req.params;
  await cartService.removeFromCart(req.user.id, productId);
  apiResponse(res, 200, 'Item removed from cart');
});

export const clearCart = catchAsync(async (req, res, next) => {
  await cartService.clearCart(req.user.id);
  apiResponse(res, 200, 'Cart cleared');
});

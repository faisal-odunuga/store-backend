import catchAsync from '../utils/catchAsync.js';
import messages from '../messages/index.js';
import AppError from '../utils/appError.js';
import prisma from '../config/prismaClient.js';
import { cleanProduct } from '../utils/helpers.js';

export const addToCart = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { product: productId, quantity } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return next(new AppError('Product not found', 404));

  const existingItem = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } }
  });

  if (existingItem) return next(new AppError('Product already in cart', 400));

  const newItem = await prisma.cartItem.create({
    data: { userId: user.id, productId, quantity },
    select: {
      id: true,
      quantity: true,
      product: { select: { id: true, name: true, imageUrl: true, price: true } }
    }
  });

  res.status(201).json({
    status: messages.success,
    message: 'Product added to cart successfully',
    data: cleanProduct(newItem)
  });
});

export const getCartItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    select: {
      id: true,
      quantity: true,
      product: { select: { id: true, name: true, imageUrl: true, price: true } }
    }
  });

  res.status(200).json({
    status: messages.success,
    results: cartItems.length,
    data: cartItems
  });
});

export const updateQuantity = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id: cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1)
    return next(new AppError('Quantity must be at least 1', 400));

  const existing = await prisma.cartItem.findUnique({
    where: { id: cartItemId, userId }
  });

  if (!existing) return next(new AppError('Cart item not found', 404));

  const updated = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    select: {
      id: true,
      quantity: true,
      product: { select: { id: true, name: true, imageUrl: true, price: true } }
    }
  });

  res.status(200).json({
    status: messages.success,
    message: 'Cart item updated successfully',
    data: updated
  });
});

export const deleteCartItem = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id: cartItemId } = req.params;

  const existing = await prisma.cartItem.findUnique({
    where: { id: cartItemId, userId }
  });

  if (!existing) return next(new AppError('Cart item not found', 404));

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  res.status(204).json({
    status: messages.success,
    message: 'Item removed from cart successfully',
    data: null
  });
});

export const clearCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  await prisma.cartItem.deleteMany({ where: { userId } });

  res.status(204).json({
    status: messages.success,
    message: 'Cart cleared successfully',
    data: null
  });
});

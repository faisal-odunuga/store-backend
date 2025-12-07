import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

export const addToCart = async (userId, productId, quantity = 1) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
  }

  return await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity
    }
  });
};

export const getCart = async userId => {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });
};

export const updateCartItem = async (userId, productId, quantity) => {
  return await prisma.cartItem.update({
    where: {
      userId_productId: {
        userId,
        productId
      }
    },
    data: { quantity }
  });
};

export const removeFromCart = async (userId, productId) => {
  return await prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });
};

export const clearCart = async userId => {
  return await prisma.cartItem.deleteMany({
    where: { userId }
  });
};

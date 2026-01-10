import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

export const createReview = async (userId, reviewData) => {
  const { productId, rating, comment } = reviewData;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId
    }
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      userId,
      productId
    }
  });

  return review;
};

export const getProductReviews = async productId => {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return reviews;
};

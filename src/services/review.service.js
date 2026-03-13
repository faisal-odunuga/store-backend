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

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Check if user has a paid order containing this product that is SHIPPED or DELIVERED
  const purchased = await prisma.order.findFirst({
    where: {
      userId,
      status: { in: ['SHIPPED', 'DELIVERED'] },
      paymentStatus: 'PAID',
      orderItems: {
        some: {
          productId
        }
      }
    }
  });

  if (!purchased) {
    throw new AppError(
      'You can only review products that have been purchased and shipped to you.',
      403
    );
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

export const updateReview = async (id, userId, reviewData) => {
  const { rating, comment } = reviewData;

  const review = await prisma.review.findUnique({
    where: { id }
  });

  if (!review) throw new AppError('Review not found', 404);
  if (review.userId !== userId) {
    throw new AppError('You can only update your own reviews', 403);
  }

  return await prisma.review.update({
    where: { id },
    data: { rating, comment }
  });
};

export const deleteReview = async (id, userId, isAdmin = false) => {
  const review = await prisma.review.findUnique({
    where: { id }
  });

  if (!review) throw new AppError('Review not found', 404);

  if (!isAdmin && review.userId !== userId) {
    throw new AppError('You can only delete your own reviews', 403);
  }

  await prisma.review.delete({ where: { id } });
};

export const getAllReviews = async (query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count()
  ]);

  return {
    reviews,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

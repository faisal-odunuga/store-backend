import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';
import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

export const createReview = catchAsync(async (req, res, next) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId
    }
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      userId,
      productId
    }
  });

  apiResponse(res, 201, 'Review created successfully', { review });
});

export const getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

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

  apiResponse(res, 200, 'Reviews retrieved successfully', { reviews });
});

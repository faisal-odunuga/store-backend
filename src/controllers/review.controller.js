import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';
import * as reviewService from '../services/review.service.js';

export const createReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.createReview(req.user.id, req.body);
  apiResponse(res, 201, 'Review created successfully', { review });
});

export const getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const reviews = await reviewService.getProductReviews(productId);
  apiResponse(res, 200, 'Reviews retrieved successfully', { reviews });
});

export const updateReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.user.id,
    req.body
  );
  apiResponse(res, 200, 'Review updated successfully', { review });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const isAdmin = req.user.role === 'ADMIN';
  await reviewService.deleteReview(req.params.id, req.user.id, isAdmin);
  apiResponse(res, 200, 'Review deleted successfully');
});

export const getAllReviews = catchAsync(async (req, res, next) => {
  const result = await reviewService.getAllReviews(req.query);
  apiResponse(res, 200, 'All reviews retrieved', result);
});

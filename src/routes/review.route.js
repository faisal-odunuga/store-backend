import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

import validateZod from '../middlewares/zod.middleware.js';
import {
  createReviewSchema,
  updateReviewSchema
} from '../validators/review.schema.js';

const router = express.Router();

// Public route to get reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes for customers
router.use(authMiddleware.protectRoute, authMiddleware.restrictTo('CUSTOMER'));

router.post(
  '/',
  validateZod(createReviewSchema),
  reviewController.createReview
);

router
  .route('/:id')
  .patch(validateZod(updateReviewSchema), reviewController.updateReview)
  .delete(reviewController.deleteReview);

export default router;

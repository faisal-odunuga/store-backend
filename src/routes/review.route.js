import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import * as authMiddleware from '../middlewares/auth.js';

import validateZod from '../middlewares/validateZod.js';
import { createReviewSchema } from '../validators/review.schema.js';

const router = express.Router();

router
  .route('/')
  .post(
    authMiddleware.protect,
    validateZod(createReviewSchema),
    reviewController.createReview
  );

router.route('/:productId').get(reviewController.getProductReviews);

export default router;

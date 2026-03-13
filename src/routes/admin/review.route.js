import express from 'express';
import * as reviewController from '../../controllers/review.controller.js';
import * as authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protectRoute, authMiddleware.restrictTo('ADMIN'));

router.get('/', reviewController.getAllReviews);
router.delete('/:id', reviewController.deleteReview);

export default router;

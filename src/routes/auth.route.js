import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as authMiddleWare from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected routes
router.get('/me', authMiddleWare.protectRoute, authController.getLoggedInUser);
router.post(
  '/setup-complete',
  authMiddleWare.protectRoute,
  authController.completeSetup
);

export default router;

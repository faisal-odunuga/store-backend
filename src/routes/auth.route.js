import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as authMiddleWare from '../middlewares/auth.middleware.js';

const router = express.Router();

// Clerk webhook — must use raw body. Add express.json() locally since
// app.js uses express.json() globally but Clerk needs the raw stringified body.
// We handle this by passing req.body (already parsed JSON by express.json()) —
// svix.verify() accepts a string of the raw body, so we re-stringify it.
router.post('/webhook', authController.clerkWebhook);

// Protected routes
router.get('/me', authMiddleWare.protect, authController.getLoggedInUser);
router.post(
  '/setup-complete',
  authMiddleWare.protect,
  authController.completeSetup
);

export default router;

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  resetPassword
} from '../validations/auth.schema.js';
import validateZod from '../middlewares/validateZod.js';
import * as authMiddleWare from '../middlewares/auth.js';
const router = express.Router();

router.route('/signup').post(validateZod(signupSchema), authController.signUp);
router.route('/login').post(validateZod(loginSchema), authController.login);
router.route('/me').get(authMiddleWare.protect, authController.getLoggedInUser);
router
  .route('/change-password')
  .patch(
    authMiddleWare.protect,
    validateZod(updatePasswordSchema),
    authController.changePassword
  );
router.route('/forgot-password').patch(authController.forgotPassword);
router
  .route('/reset-password/:token')
  .patch(validateZod(resetPassword), authController.resetPassword);

export default router;

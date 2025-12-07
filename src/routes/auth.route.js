import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  resetPassword
} from '../validators/auth.schema.js';
import validateZod from '../middlewares/validateZod.js';
import * as authMiddleWare from '../middlewares/auth.js';
const router = express.Router();

router.route('/signup').post(validateZod(signupSchema), authController.signUp);
router.route('/login').post(validateZod(loginSchema), authController.login);
router.route('/forgot-password').patch(authController.forgotPassword);
router
  .route('/reset-password/:token')
  .patch(validateZod(resetPassword), authController.resetPassword);

router.use(authMiddleWare.protect);

router.route('/me').get(authController.getLoggedInUser);
router
  .route('/change-password')
  .patch(validateZod(updatePasswordSchema), authController.changePassword);

router.post('/logout', authController.logout);

export default router;

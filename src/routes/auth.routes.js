const express = require('express');
const authController = require('../controllers/auth.controller.js');
const {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  resetPassword
} = require('../validations/auth.schema.js');
const validateZod = require('../middlewares/validateZod.js');
const authMiddleWare = require('../middlewares/auth.js');
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
router.route('/reset-password/:token').patch(validateZod(resetPassword),authController.resetPassword);

module.exports = router;

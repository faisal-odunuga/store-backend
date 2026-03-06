import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { updateProfileSchema } from '../validators/user.schema.js';
import validateZod from '../middlewares/zod.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .route('/get-me')
  .get(authMiddleware.protect, authMiddleware.restrictTo('CUSTOMER'), userController.getMe);
router
  .route('/update-me')
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('CUSTOMER'),
    validateZod(updateProfileSchema),
    userController.updateMe
  );

// router.route('/delete-me').delete(userController.deleteMe);
// ADMIN ROUTES MOVED TO /admin/users

export default router;

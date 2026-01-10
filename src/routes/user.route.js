import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { updateProfileSchema } from '../validators/user.schema.js';
import validateZod from '../middlewares/validateZod.js';
import * as authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.route('/get-me').get(authMiddleware.protect, userController.getMe);
router
  .route('/update-me')
  .patch(
    authMiddleware.protect,
    validateZod(updateProfileSchema),
    userController.updateMe
  );

// router.route('/delete-me').delete(userController.deleteMe);
router
  .route('/all-users')
  .get(
    authMiddleware.protect,
    authMiddleware.restrictTo('ADMIN'),
    userController.getAllUsers
  );

router
  .route('/:id')
  .all(authMiddleware.protect, authMiddleware.restrictTo('ADMIN'))
  .get(userController.getUser)
  .patch(validateZod(updateProfileSchema), userController.updateUser)
  .delete(userController.deleteUser);

export default router;

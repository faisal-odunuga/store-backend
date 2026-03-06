import express from 'express';
import * as userController from '../../controllers/user.controller.js';
import {
  updateProfileSchema,
  updateUserRoleSchema
} from '../../validators/user.schema.js';
import validateZod from '../../middlewares/zod.middleware.js';
import * as authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo('ADMIN'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createManager);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(validateZod(updateProfileSchema), userController.updateUser)
  .delete(userController.deleteUser);

router
  .route('/:id/role')
  .patch(validateZod(updateUserRoleSchema), userController.updateUserRole);

export default router;

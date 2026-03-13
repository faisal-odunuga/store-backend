import express from 'express';
import * as adminController from '../../controllers/admin.controller.js';
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
  .get(adminController.getAllUsers)
  .post(adminController.createManager);

router
  .route('/:id')
  .get(adminController.getUser)
  .patch(validateZod(updateProfileSchema), adminController.updateUser)
  .delete(adminController.deleteUser);

router
  .route('/:id/role')
  .patch(validateZod(updateUserRoleSchema), adminController.updateUserRole);

export default router;

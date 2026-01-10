import express from 'express';
import * as userController from '../../controllers/user.controller.js';
import { updateProfileSchema } from '../../validators/user.schema.js';
import validateZod from '../../middlewares/validateZod.js';
import * as authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo('ADMIN'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(validateZod(updateProfileSchema), userController.updateUser)
  .delete(userController.deleteUser);

export default router;

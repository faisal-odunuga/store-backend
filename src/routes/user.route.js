import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { updateUserSchema } from '../validators/auth.schema.js';
import validateZod from '../middlewares/validateZod.js';
import * as authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware.protect);
router.route('/get-me').get(userController.getMe);
// router
//   .route('/update-me')
//   .patch(validateZod(updateUserSchema.partial()), userController.updateMe);

// router.route('/delete-me').delete(userController.deleteMe);
router
  .route('/all-users')
  .get(authMiddleware.restrictTo('ADMIN'), userController.getAllUsers);

export default router;

import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { updateUserSchema } from '../validations/auth.schema.js';
import validateZod from '../middlewares/validateZod.js';
import * as authMiddleWare from '../middlewares/auth.js';

const router = express.Router();

router
  .route('/update-me')
  .patch(
    authMiddleWare.protect,
    validateZod(updateUserSchema.partial()),
    userController.updateMe
  );
router
  .route('/delete-me')
  .patch(authMiddleWare.protect, userController.deleteMe);

export default router;

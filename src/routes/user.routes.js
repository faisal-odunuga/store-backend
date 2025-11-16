import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { updateUserSchema } from '../validations/auth.schema.js';
import validateZod from '../middlewares/validateZod.js';
import * as authMiddleWare from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleWare.protect);
router
  .route('/update-me')
  .patch(validateZod(updateUserSchema.partial()), userController.updateMe);

router.route('/delete-me').delete(userController.deleteMe);

export default router;

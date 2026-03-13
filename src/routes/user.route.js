import express from 'express';
import * as userController from '../controllers/user.controller.js';
import {
  updateProfileSchema,
  addressSchema,
  wishlistSchema
} from '../validators/user.schema.js';
import validateZod from '../middlewares/zod.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protectRoute, authMiddleware.restrictTo('CUSTOMER'));

router.get('/get-me', userController.getMe);
router.patch(
  '/update-me',
  validateZod(updateProfileSchema),
  userController.updateMe
);

// Address Routes
router
  .route('/addresses')
  .get(userController.getAddresses)
  .post(validateZod(addressSchema), userController.addAddress);

router
  .route('/addresses/:id')
  .patch(validateZod(addressSchema.partial()), userController.updateAddress)
  .delete(userController.deleteAddress);

// Wishlist Routes
router
  .route('/wishlist')
  .get(userController.getWishlist)
  .post(validateZod(wishlistSchema), userController.addToWishlist);

router.route('/wishlist/:productId').delete(userController.removeFromWishlist);

export default router;

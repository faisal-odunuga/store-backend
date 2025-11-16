import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { productSchema } from '../validations/product.schema.js';
import validateZod from '../middlewares/validateZod.js';
import validateId from '../middlewares/validateId.js';
import * as authMiddleWare from '../middlewares/auth.js';

const router = express.Router();

router.route('/').get(productController.getAllProducts);
router.route('/:id').get(validateId, productController.getProduct);
router
  .route('/:id/related')
  .get(validateId, productController.getRelatedProducts);

router
  .route('/category/:category')
  .get(productController.getProductsByCategory);

// ADMIN PRIVILEDGES
router.use(authMiddleWare.protect, authMiddleWare.restrictTo('ADMIN'));

router
  .route('/')
  .post(validateZod(productSchema), productController.createProduct);

router.use(validateId);
router
  .route('/:id')
  .patch(validateZod(productSchema.partial()), productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;

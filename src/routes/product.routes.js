import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { productSchema } from '../validations/product.schema.js';
import validateZod from '../middlewares/validateZod.js';
import validateId from '../middlewares/validateId.js';
import * as authMiddleWare from '../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    validateZod(productSchema),
    [authMiddleWare.protect, authMiddleWare.restrictTo('ADMIN')],
    productController.createProduct
  );

router
  .route('/:id')
  .get(validateId, productController.getProduct)
  .patch(
    validateId,
    validateZod(productSchema.partial()),
    [authMiddleWare.protect, authMiddleWare.restrictTo('ADMIN')],
    productController.updateProduct
  )
  .delete(
    validateId,
    [authMiddleWare.protect, authMiddleWare.restrictTo('ADMIN')],
    productController.deleteProduct
  );

router
  .route('/:id/related')
  .get(validateId, productController.getRelatedProducts);

router
  .route('/category/:category')
  .get(productController.getProductsByCategory);

export default router;

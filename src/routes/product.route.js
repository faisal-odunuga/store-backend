import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { productSchema } from '../validators/product.schema.js';
import validateZod from '../middlewares/validateZod.js';
import validateId from '../middlewares/validateId.js';
import * as authMiddleWare from '../middlewares/auth.js';
import multer from 'multer';
import multerS3 from 'multer-s3';
const upload = multer({
  storage: multer.memoryStorage()
});

const router = express.Router();

router.route('/').get(productController.getAllProducts);
router.route('/:id').get(validateId, productController.getProduct);

router.route('/category/:category').get(productController.getAllProducts);

// ADMIN PRIVILEGES
router
  .route('/')
  .post(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('ADMIN'),
    upload.single('image'),
    validateZod(productSchema),
    productController.createProduct
  );

router
  .route('/:id')
  .all(validateId)
  .patch(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('ADMIN'),
    validateZod(productSchema.partial()),
    productController.updateProduct
  )
  .delete(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('ADMIN'),
    productController.deleteProduct
  );

export default router;

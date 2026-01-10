import express from 'express';
import * as productController from '../../controllers/product.controller.js';
import { productSchema } from '../../validators/product.schema.js';
import validateZod from '../../middlewares/validateZod.js';
import validateId from '../../middlewares/validateId.js';
import * as authMiddleWare from '../../middlewares/auth.js';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage()
});

const router = express.Router();

router.use(authMiddleWare.protect, authMiddleWare.restrictTo('ADMIN'));

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    upload.single('image'),
    validateZod(productSchema),
    productController.createProduct
  );

router
  .route('/:id')
  .all(validateId)
  .get(productController.getProduct)
  .patch(validateZod(productSchema.partial()), productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;

import express from 'express';
import * as productController from '../../controllers/product.controller.js';
import {
  productSchema,
  adjustStockSchema
} from '../../validators/product.schema.js';
import validateZod from '../../middlewares/zod.middleware.js';
import validateId from '../../middlewares/id.middleware.js';
import * as authMiddleWare from '../../middlewares/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(
  authMiddleWare.protect,
  authMiddleWare.restrictTo('ADMIN', 'MANAGER')
);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    upload.single('image'),
    validateZod(productSchema),
    productController.createProduct
  );

router.route('/low-stock').get(productController.getLowStockProducts);

router
  .route('/:id')
  .all(validateId)
  .get(productController.getProduct)
  .patch(
    upload.single('image'),
    validateZod(productSchema.partial()),
    productController.updateProduct
  )
  .delete(productController.deleteProduct);

router
  .route('/:id/adjust-stock')
  .post(
    validateId,
    validateZod(adjustStockSchema),
    productController.adjustStock
  );

router
  .route('/:id/inventory-logs')
  .get(validateId, productController.getInventoryLogs);

export default router;

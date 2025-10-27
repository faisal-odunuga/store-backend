const express = require('express');
const productController = require('../controllers/product.controller.js');
const { productSchema } = require('../validations/product.schema.js');
const validateZod = require('../middlewares/validateZod.js');
const validateId = require('../middlewares/validateId.js');
const authMiddleWare = require('../middlewares/auth.js');

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

module.exports = router;

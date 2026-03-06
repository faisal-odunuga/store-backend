import express from 'express';
import * as productController from '../controllers/product.controller.js';
import validateId from '../middlewares/id.middleware.js';

const router = express.Router();

// Public routes — no auth required
router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', validateId, productController.getProduct);

export default router;

import express from 'express';
import * as inventoryController from '../../controllers/inventory.controller.js';
import * as authMiddleware from '../../middlewares/auth.middleware.js';
import validateZod from '../../middlewares/zod.middleware.js';
import { adjustStockSchema } from '../../validators/product.schema.js';
import validateId from '../../middlewares/id.middleware.js';

const router = express.Router();

router.use(
  authMiddleware.protect,
  authMiddleware.restrictTo('ADMIN', 'MANAGER')
);

router.get('/', inventoryController.getAllInventoryLogs);
router.get('/low-stock', inventoryController.getLowStockProducts);

router.post(
  '/:id/adjust',
  validateId,
  validateZod(adjustStockSchema),
  inventoryController.adjustStock
);

router.get('/:id/logs', validateId, inventoryController.getInventoryLogs);

export default router;

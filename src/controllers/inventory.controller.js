import * as productService from '../services/product.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const adjustStock = catchAsync(async (req, res) => {
  const { quantity, type, note } = req.body;
  const product = await productService.adjustStock(
    req.params.id,
    quantity,
    type,
    note
  );
  apiResponse(res, 200, 'Stock adjusted successfully', { product });
});

export const getLowStockProducts = catchAsync(async (req, res) => {
  const products = await productService.getLowStockProducts();
  apiResponse(res, 200, 'Low stock products retrieved', {
    products,
    count: products.length
  });
});

export const getInventoryLogs = catchAsync(async (req, res) => {
  const logs = await productService.getInventoryLogs(req.params.id);
  apiResponse(res, 200, 'Inventory logs retrieved', { logs });
});

export const getAllInventoryLogs = catchAsync(async (req, res) => {
  const data = await productService.getAllInventoryLogs(req.query);
  apiResponse(res, 200, 'All inventory logs retrieved', data);
});

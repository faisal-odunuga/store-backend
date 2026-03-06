import * as productService from '../services/product.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.file);
  apiResponse(res, 201, 'Product created successfully', { product });
});

export const getAllProducts = catchAsync(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  apiResponse(res, 200, 'Products retrieved successfully', result);
});

export const getProductsByCategory = catchAsync(async (req, res) => {
  const result = await productService.getProductsByCategory(
    req.params.category
  );
  apiResponse(res, 200, 'Products retrieved successfully', result);
});

export const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  apiResponse(res, 200, 'Product retrieved successfully', { product });
});

export const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.file
  );
  apiResponse(res, 200, 'Product updated successfully', { product });
});

export const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  apiResponse(res, 204, 'Product deleted successfully');
});

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

import * as productService from '../services/product.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const createProduct = catchAsync(async (req, res, next) => {
  const product = await productService.createProduct(req.body, req.file);
  apiResponse(res, 201, 'Product created successfully', { product });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const result = await productService.getAllProducts(req.query);
  apiResponse(res, 200, 'Products retrieved successfully', result);
});

export const getProductsByCategory = catchAsync(async (req, res, next) => {
  const result = await productService.getProductsByCategory(req.params.category);
  apiResponse(res, 200, 'Products retrieved successfully', result);
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);
  apiResponse(res, 200, 'Product retrieved successfully', { product });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  apiResponse(res, 200, 'Product updated successfully', { product });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  await productService.deleteProduct(req.params.id);
  apiResponse(res, 204, 'Product deleted successfully');
});

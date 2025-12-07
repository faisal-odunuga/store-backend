import * as productService from '../services/product.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

import cloudinary from '../config/cloudinary.config.js';

export const createProduct = catchAsync(async (req, res, next) => {
  let imageUrl = null;

  if (req.file) {
    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'products'
    });
    imageUrl = result.secure_url;
  }

  const product = await productService.createProduct(req.body, imageUrl);
  apiResponse(res, 201, 'Product created successfully', { product });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const result = await productService.getAllProducts(req.query);
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

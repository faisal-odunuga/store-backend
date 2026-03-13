import * as userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  apiResponse(res, 200, 'User profile retrieved', { user });
});

export const updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);
  apiResponse(res, 200, 'Profile updated successfully', { user });
});

// Address Management
export const getAddresses = catchAsync(async (req, res) => {
  const addresses = await userService.getAddresses(req.user.id);
  apiResponse(res, 200, 'Addresses retrieved', { addresses });
});

export const addAddress = catchAsync(async (req, res) => {
  const address = await userService.addAddress(req.user.id, req.body);
  apiResponse(res, 201, 'Address added successfully', { address });
});

export const updateAddress = catchAsync(async (req, res) => {
  const address = await userService.updateAddress(
    req.params.id,
    req.user.id,
    req.body
  );
  apiResponse(res, 200, 'Address updated successfully', { address });
});

export const deleteAddress = catchAsync(async (req, res) => {
  await userService.deleteAddress(req.params.id, req.user.id);
  apiResponse(res, 200, 'Address deleted successfully');
});

// Wishlist Management
export const getWishlist = catchAsync(async (req, res) => {
  const wishlist = await userService.getWishlist(req.user.id);
  apiResponse(res, 200, 'Wishlist retrieved', { wishlist });
});

export const addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;
  const item = await userService.addToWishlist(req.user.id, productId);
  apiResponse(res, 201, 'Added to wishlist', { item });
});

export const removeFromWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;
  await userService.removeFromWishlist(req.user.id, productId);
  apiResponse(res, 200, 'Removed from wishlist');
});

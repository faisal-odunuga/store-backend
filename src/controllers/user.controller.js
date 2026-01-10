import * as userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const getMe = catchAsync(async (req, res, next) => {
  const user = await userService.getUserProfile(req.user.id);
  apiResponse(res, 200, 'User profile retrieved', { user });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getAllUsers();
  apiResponse(res, 200, 'All users retrieved', { users });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);
  apiResponse(res, 200, 'Profile updated successfully', { user });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await userService.getUserProfile(req.params.id);
  apiResponse(res, 200, 'User retrieved successfully', { user });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await userService.updateUserProfile(req.params.id, req.body);
  apiResponse(res, 200, 'User updated successfully', { user });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await userService.deleteUser(req.params.id);
  apiResponse(res, 204, 'User deleted successfully', null);
});

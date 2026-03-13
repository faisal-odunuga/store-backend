import * as userService from '../services/user.service.js';
import * as adminService from '../services/admin.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  apiResponse(res, 200, 'All users retrieved', result);
});

export const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.params.id);
  apiResponse(res, 200, 'User retrieved successfully', { user });
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserProfile(req.params.id, req.body);
  apiResponse(res, 200, 'User updated successfully', { user });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  const user = await userService.updateUserRole(req.params.id, role);
  apiResponse(res, 200, 'User role updated successfully', { user });
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  apiResponse(res, 204, 'User deleted successfully');
});

export const createManager = catchAsync(async (req, res) => {
  const user = await adminService.createManagerUser(req.body);
  apiResponse(res, 201, 'Manager account created successfully', { user });
});

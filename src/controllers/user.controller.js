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


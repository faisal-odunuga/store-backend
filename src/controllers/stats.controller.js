import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';
import * as statsService from '../services/stats.service.js';

export const getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await statsService.getDashboardStats();
  apiResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
});

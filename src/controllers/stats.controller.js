import * as statsService from '../services/stats.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

export const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await statsService.getDashboardStats();
  let revenueData = await statsService.getRevenueOverTime(30);

  if (req.user?.role !== 'ADMIN') {
    delete stats.profit;
    revenueData = revenueData.map(entry => ({
      date: entry.date,
      revenue: entry.revenue
    }));
  }

  apiResponse(res, 200, 'Dashboard stats retrieved', {
    stats: { ...stats, revenueData }
  });
});

export const getRevenueOverTime = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  let data = await statsService.getRevenueOverTime(days);
  if (req.user?.role !== 'ADMIN') {
    data = data.map(entry => ({ date: entry.date, revenue: entry.revenue }));
  }
  apiResponse(res, 200, 'Revenue data retrieved', { data });
});

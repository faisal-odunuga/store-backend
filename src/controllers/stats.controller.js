import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';
import prisma from '../config/prismaClient.js';

export const getDashboardStats = catchAsync(async (req, res, next) => {
  const [userCount, orderCount, productCount, totalRevenue] = await Promise.all(
    [
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: {
            not: 'CANCELLED' // Assuming we don't count cancelled orders
          }
        }
      })
    ]
  );

  const stats = {
    users: userCount,
    orders: orderCount,
    products: productCount,
    revenue: totalRevenue._sum.totalAmount || 0
  };

  apiResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
});

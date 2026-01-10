import prisma from '../config/prismaClient.js';

export const getDashboardStats = async () => {
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

  return {
    users: userCount,
    orders: orderCount,
    products: productCount,
    revenue: totalRevenue._sum.totalAmount || 0
  };
};

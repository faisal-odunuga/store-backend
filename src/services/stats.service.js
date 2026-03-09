import prisma from '../config/prismaClient.js';

export const getDashboardStats = async () => {
  const [
    userCount,
    orderCount,
    productCount,
    revenueAgg,
    pendingOrderCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true, profitAmount: true },
      where: { paymentStatus: 'PAID' }
    }),
    prisma.order.count({ where: { status: 'PENDING' } })
  ]);

  // Get low stock the Prisma-compatible way
  const allActive = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      lowStockAlert: true
    }
  });

  const lowStockItems = allActive.filter(p => p.stock <= p.lowStockAlert);
  const lowStockCount = lowStockItems.length;
  const lowStockProductsList = lowStockItems
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const recentTransactions = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      user: { select: { name: true } }
    }
  });

  const topSellingCounts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  });

  const topSellingProducts = await Promise.all(
    topSellingCounts.map(async item => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          imageUrl: true
        }
      });
      return {
        ...product,
        totalSold: item._sum.quantity
      };
    })
  );

  return {
    users: userCount,
    orders: orderCount,
    products: productCount,
    revenue: revenueAgg._sum.totalAmount || 0,
    profit: revenueAgg._sum.profitAmount || 0,
    lowStockProducts: lowStockCount,
    pendingOrders: pendingOrderCount,
    lowStockProductsList,
    recentTransactions,
    topSellingProducts
  };
};

export const getRevenueOverTime = async (days = 30) => {
  const windowDays = Math.min(Math.max(parseInt(days, 10) || 30, 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, paymentStatus: 'PAID' },
    select: { createdAt: true, totalAmount: true, profitAmount: true }
  });

  // Group by date
  const grouped = {};
  orders.forEach(({ createdAt, totalAmount, profitAmount }) => {
    const date = createdAt.toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = { revenue: 0, profit: 0 };
    grouped[date].revenue += totalAmount;
    grouped[date].profit += profitAmount || 0;
  });

  return Object.entries(grouped)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

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
    select: { id: true, stock: true, lowStockAlert: true }
  });
  const lowStock = allActive.filter(p => p.stock <= p.lowStockAlert).length;

  return {
    users: userCount,
    orders: orderCount,
    products: productCount,
    revenue: revenueAgg._sum.totalAmount || 0,
    profit: revenueAgg._sum.profitAmount || 0,
    lowStockProducts: lowStock,
    pendingOrders: pendingOrderCount
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

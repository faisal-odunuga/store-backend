import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

export const createOrder = async userId => {
  // 1. Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (!cartItems.length) throw new AppError('Cart is empty', 400);

  // 2. Calculate total and prepare order items
  let totalAmount = 0;
  const orderItemsData = cartItems.map(item => {
    totalAmount += item.product.price * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price
    };
  });

  // 3. Create order transactionally
  const order = await prisma.$transaction(async tx => {
    // Create Order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        orderItems: {
          create: orderItemsData
        }
      },
      include: { orderItems: true }
    });

    // Clear Cart
    await tx.cartItem.deleteMany({ where: { userId } });

    // Update Stock (Optimized: Parallel execution + Sorted to prevent deadlocks)
    // Sort items by productId to ensure consistent locking order
    const sortedItems = [...cartItems].sort((a, b) =>
      a.productId.localeCompare(b.productId)
    );

    await Promise.all(
      sortedItems.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    );

    return newOrder;
  });

  return order;
};

export const getUserOrders = async userId => {
  return await prisma.order.findMany({
    where: { userId },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const getOrderById = async id => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: { include: { product: true } },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true
        }
      }
    }
  });
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateOrderStatus = async (id, status) => {
  return await prisma.order.update({
    where: { id },
    data: { status }
  });
};

import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';
import { ORDER_RESERVATION_MINUTES } from '../secrets.js';

const generateOrderNumber = () => {
  const timestamp = Date.now()
    .toString(36)
    .toUpperCase();
  const random = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const getReservationExpiry = () => {
  const minutes =
    Number.isFinite(ORDER_RESERVATION_MINUTES) && ORDER_RESERVATION_MINUTES > 0
      ? ORDER_RESERVATION_MINUTES
      : 30;
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Creates an order from an items array directly (no Cart model in schema).
 * @param {string} userId - Internal DB user ID
 * @param {Array} items - [{ productId, quantity }]
 * @param {string} shippingAddress
 * @param {object} options - { paymentMethod, discountAmount }
 */
export const createOrder = async (
  userId,
  items,
  shippingAddress,
  options = {}
) => {
  const { paymentMethod, discountAmount = 0 } = options;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must have at least one item', 400);
  }

  const normalizedItemsMap = new Map();
  items.forEach(item => {
    const qty = Number(item.quantity);
    if (!item?.productId || !Number.isFinite(qty) || qty <= 0) {
      throw new AppError('Invalid order item payload', 400);
    }
    normalizedItemsMap.set(
      item.productId,
      (normalizedItemsMap.get(item.productId) || 0) + qty
    );
  });
  const normalizedItems = Array.from(normalizedItemsMap.entries()).map(
    ([productId, quantity]) => ({ productId, quantity })
  );

  // 1. Fetch all products at once
  const productIds = normalizedItems.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  if (products.length !== productIds.length) {
    throw new AppError('One or more products not found', 404);
  }
  const productMap = new Map(products.map(product => [product.id, product]));

  // 2. Build order items and compute totals
  let subtotal = 0;
  let profitAmount = 0;

  const orderItemsData = normalizedItems.map(item => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new AppError('One or more products not found', 404);
    }
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for product: ${product.name}`,
        400
      );
    }
    const itemTotal = product.sellingPrice * item.quantity;
    const itemProfit =
      (product.sellingPrice - product.costPrice) * item.quantity;
    subtotal += itemTotal;
    profitAmount += itemProfit;
    return {
      productId: item.productId,
      quantity: item.quantity,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      totalPrice: itemTotal
    };
  });

  const taxAmount = 0; // configurable in future
  const shippingFee = 0; // configurable in future
  const normalizedDiscount = Number(discountAmount) || 0;
  if (normalizedDiscount < 0) {
    throw new AppError('Discount amount cannot be negative', 400);
  }

  const totalBeforeDiscount = subtotal + taxAmount + shippingFee;
  if (normalizedDiscount > totalBeforeDiscount) {
    throw new AppError('Discount amount cannot exceed order total', 400);
  }
  const totalAmount = totalBeforeDiscount - normalizedDiscount;

  // 3. Create everything in a transaction
  const order = await prisma.$transaction(async tx => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        subtotal,
        taxAmount,
        shippingFee,
        discountAmount: normalizedDiscount,
        totalAmount,
        profitAmount,
        shippingAddress,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        expiresAt: getReservationExpiry(),
        orderItems: { create: orderItemsData }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
                sellingPrice: true
              }
            }
          }
        }
      }
    });

    // Decrement stock and log inventory OUT
    await Promise.all(
      normalizedItems.map(async item => {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });
        if (updated.count === 0) {
          const product = productMap.get(item.productId);
          throw new AppError(
            `Insufficient stock for product: ${product?.name ?? item.productId}`,
            400
          );
        }
      })
    );

    await tx.inventoryLog.createMany({
      data: normalizedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        type: 'OUT',
        note: `Order ${newOrder.orderNumber}`
      }))
    });

    return newOrder;
  });

  return order;
};

export const releaseOrderReservation = async (
  orderId,
  reason = 'Reservation expired'
) => {
  return await prisma.$transaction(async tx => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'PENDING' || order.paymentStatus !== 'PENDING') {
      return null;
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED'
      }
    });

    await Promise.all(
      order.orderItems.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      )
    );

    await tx.inventoryLog.createMany({
      data: order.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        type: 'IN',
        note: reason
      }))
    });

    return order;
  });
};

export const releaseExpiredOrders = async (now = new Date()) => {
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      expiresAt: { lt: now }
    },
    select: { id: true }
  });

  let releasedCount = 0;
  for (const { id } of expiredOrders) {
    const released = await releaseOrderReservation(id, 'Reservation expired');
    if (released) releasedCount += 1;
  }

  return { releasedCount };
};

export const getUserOrders = async userId => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              imageUrl: true,
              sellingPrice: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getOrderById = async idOrNumber => {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: idOrNumber },
        { orderNumber: { equals: idOrNumber, mode: 'insensitive' } }
      ]
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              imageUrl: true,
              sellingPrice: true
            }
          }
        }
      },
      user: { select: { id: true, name: true, email: true, phone: true } }
    }
  });
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

export const getAllOrders = async (query = {}) => {
  const { status, paymentStatus, page = 1, limit = 20 } = query;
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: pageSize,
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, imageUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize)
  };
};

export const updateOrderStatus = async (id, { status, paymentStatus }) => {
  const data = {};
  if (status) data.status = status;
  if (paymentStatus) data.paymentStatus = paymentStatus;

  if (!Object.keys(data).length) {
    throw new AppError('Provide status or paymentStatus to update', 400);
  }

  if (
    (data.status === 'REFUNDED' || data.paymentStatus === 'REFUNDED') &&
    !data.status
  ) {
    data.status = 'REFUNDED';
  }
  if (
    (data.status === 'REFUNDED' || data.paymentStatus === 'REFUNDED') &&
    !data.paymentStatus
  ) {
    data.paymentStatus = 'REFUNDED';
  }

  if (data.status && ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(data.status)) {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { paymentStatus: true }
    });
    if (order?.paymentStatus !== 'PAID') {
      throw new AppError('Order must be paid before advancing status', 400);
    }
  }

  return await prisma.order.update({ where: { id }, data });
};

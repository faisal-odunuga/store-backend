import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

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

/**
 * Normalizes input items: validates payload and merges duplicate productIds.
 */
const normalizeOrderItems = items => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must have at least one item', 400);
  }

  const normalizedMap = new Map();
  items.forEach(item => {
    const qty = Number(item.quantity);
    if (!item?.productId || !Number.isFinite(qty) || qty <= 0) {
      throw new AppError('Invalid order item payload', 400);
    }
    normalizedMap.set(
      item.productId,
      (normalizedMap.get(item.productId) || 0) + qty
    );
  });

  return Array.from(normalizedMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity
  }));
};

/**
 * Fetches products from database and ensures all requested IDs exist.
 */
const fetchProductsForOrder = async productIds => {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  if (products.length !== productIds.length) {
    throw new AppError('One or more products not found', 404);
  }

  return new Map(products.map(product => [product.id, product]));
};

/**
 * Validates stock and prepares order items data with totals.
 */
const processOrderItems = (normalizedItems, productMap) => {
  let subtotal = 0;
  let profitAmount = 0;

  const orderItemsData = normalizedItems.map(item => {
    const product = productMap.get(item.productId);
    if (!product) throw new AppError('One or more products not found', 404);

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

  return { orderItemsData, subtotal, profitAmount };
};

/**
 * Calculates final totals including discounts.
 */
const calculateFinalTotals = (subtotal, discountAmount = 0) => {
  const taxAmount = 0;
  const shippingFee = 0;
  const normalizedDiscount = Number(discountAmount) || 0;

  if (normalizedDiscount < 0) {
    throw new AppError('Discount amount cannot be negative', 400);
  }

  const totalBeforeDiscount = subtotal + taxAmount + shippingFee;
  if (normalizedDiscount > totalBeforeDiscount) {
    throw new AppError('Discount amount cannot exceed order total', 400);
  }

  return {
    subtotal,
    taxAmount,
    shippingFee,
    discountAmount: normalizedDiscount,
    totalAmount: totalBeforeDiscount - normalizedDiscount
  };
};

/**
 * Creates an order from an items array directly (no Cart model in schema).
 * @param {string} userId - Internal DB user ID
 * @param {Array} items - [{ productId, quantity }]
 * @param {string} shippingAddress
 * @param {object} options - { paymentMethod, discountAmount, contactName, contactEmail, contactPhone, addressId }
 */
export const createOrder = async (
  userId,
  items,
  shippingAddress,
  options = {}
) => {
  const {
    paymentMethod,
    discountAmount = 0,
    contactName,
    contactEmail,
    contactPhone,
    addressId
  } = options;

  let resolvedAddress = shippingAddress;
  let resolvedAddressId = addressId;

  if (!resolvedAddress && addressId) {
    const addr = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });
    if (!addr) throw new AppError('Address not found', 404);
    resolvedAddress = `${addr.street}, ${addr.city}${
      addr.state ? ', ' + addr.state : ''
    }, ${addr.country}`;
  }

  if (!resolvedAddress) {
    throw new AppError('Shipping address is required', 400);
  }

  // 1. Normalize and Fetch
  const normalizedItems = normalizeOrderItems(items);
  const productMap = await fetchProductsForOrder(
    normalizedItems.map(i => i.productId)
  );

  // 2. Validate and Calculate
  const { orderItemsData, subtotal, profitAmount } = processOrderItems(
    normalizedItems,
    productMap
  );
  const totals = calculateFinalTotals(subtotal, discountAmount);

  // 3. Persist
  return await prisma.$transaction(async tx => {
    return await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        ...totals,
        profitAmount,
        shippingAddress: resolvedAddress,
        shippingAddressId: resolvedAddressId,
        contactName,
        contactEmail,
        contactPhone,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING',
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
                images: true,
                sellingPrice: true
              }
            }
          }
        }
      }
    });
  });
};

/**
 * Atomically decrements stock and logs inventory for multiple items.
 * Designed to be used within a Prisma transaction.
 */
const updateStockAndInventory = async (tx, order) => {
  // 1. Decrement stock
  await Promise.all(
    order.orderItems.map(async item => {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      });
      if (updated.count === 0) {
        throw new AppError(
          `Insufficient stock for product in order ${order.orderNumber}`,
          400
        );
      }
    })
  );

  // 2. Create inventory logs
  await tx.inventoryLog.createMany({
    data: order.orderItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      type: 'OUT',
      note: `Order ${order.orderNumber} (Paid)`
    }))
  });
};

/**
 * Processes a successful payment: updates status, decrements stock, and logs inventory.
 */
export const processSuccessfulPayment = async (orderId, transactionRef) => {
  return await prisma.$transaction(async tx => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });

    if (!order) throw new AppError('Order not found', 404);
    if (order.paymentStatus === 'PAID') return order;

    // 1. Core Stock & Inventory logic
    await updateStockAndInventory(tx, order);

    // 2. Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        transactionRef
      }
    });

    // 3. Clear User Cart
    await tx.cartItem.deleteMany({
      where: { userId: order.userId }
    });

    return updatedOrder;
  });
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
              images: true,
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
              images: true,
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
              select: { id: true, name: true, sku: true, images: true }
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

  if (
    data.status &&
    ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(data.status)
  ) {
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

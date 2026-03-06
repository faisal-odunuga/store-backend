import paystack from '../config/paystack.config.js';
import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';
import messages from '../messages/index.js';
import { FRONTEND_URL } from '../secrets.js';
import { releaseOrderReservation } from './order.service.js';

export const initializePayment = async (orderId, user) => {
  // 1. Get order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!order) {
    throw new AppError(messages.error.orderNotFound, 404);
  }
  if (order.userId !== user.id) {
    throw new AppError('You are not authorized to pay for this order', 403);
  }

  // 2. Check if order is already paid, cancelled, or expired
  if (order.paymentStatus === 'PAID') {
    throw new AppError('Order is already paid', 400);
  }
  if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
    throw new AppError('Order cannot be paid in its current state', 400);
  }
  if (order.expiresAt && order.expiresAt < new Date()) {
    await releaseOrderReservation(order.id, 'Payment window expired');
    throw new AppError('Payment window expired. Please place a new order.', 400);
  }
  if (order.totalAmount <= 0) {
    throw new AppError('Invalid order total amount', 400);
  }

  // 3. Initialize Paystack transaction
  // Amount is in kobo, so multiply by 100
  const amountInKobo = Math.round(order.totalAmount * 100);

  try {
    const response = await paystack.post('/transaction/initialize', {
      email: user.email,
      amount: amountInKobo,
      metadata: {
        orderId: order.id,
        userId: user.id
      },
      callback_url: `${FRONTEND_URL}/payment/callback`
    });

    const reference = response.data?.data?.reference;
    if (reference) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          transactionRef: reference,
          paymentMethod: order.paymentMethod ?? 'PAYSTACK',
          paymentStatus: 'PENDING'
        }
      });
    }

    return {
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Payment initialization failed: ' + error.message, 500);
  }
};

export const verifyPayment = async reference => {
  if (!reference) {
    throw new AppError('Payment reference is required', 400);
  }

  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    const { status, metadata, amount, currency } = response.data.data || {};
    const orderId = metadata?.orderId;

    if (!orderId) {
      throw new AppError('Payment metadata is missing order reference', 400);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError(messages.error.orderNotFound, 404);
    }
    if (order.paymentStatus === 'PAID') {
      return order;
    }
    if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
      throw new AppError('Order cannot be paid in its current state', 400);
    }
    if (order.expiresAt && order.expiresAt < new Date()) {
      await releaseOrderReservation(order.id, 'Payment window expired');
      throw new AppError('Payment window expired. Please place a new order.', 400);
    }

    const expectedAmount = Math.round(order.totalAmount * 100);
    if (Number.isFinite(amount) && amount !== expectedAmount) {
      throw new AppError('Payment amount does not match order total', 400);
    }
    if (currency && currency !== 'NGN') {
      throw new AppError('Unsupported payment currency', 400);
    }

    if (status === 'success') {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: order.status === 'PENDING' ? 'PROCESSING' : order.status,
          paymentStatus: 'PAID',
          transactionRef: reference,
          paymentMethod: order.paymentMethod ?? 'PAYSTACK'
        }
      });

      return updatedOrder;
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          transactionRef: reference,
          paymentMethod: order.paymentMethod ?? 'PAYSTACK'
        }
      });
      throw new AppError('Payment verification failed', 400);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Payment verification error: ' + error.message, 500);
  }
};

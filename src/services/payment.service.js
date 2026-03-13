import paystack from '../config/paystack.config.js';
import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';
import messages from '../messages/index.js';
import { FRONTEND_URL, PAYSTACK_SECRET_KEY } from '../secrets.js';
import { processSuccessfulPayment } from './order.service.js';

/**
 * Validates order state, ownership, and amount before payment.
 */
const validateOrderForPayment = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, email: true }
      }
    }
  });

  if (!order) throw new AppError(messages.error.orderNotFound, 404);
  if (order.userId !== userId) {
    throw new AppError('You are not authorized to pay for this order', 403);
  }
  if (order.paymentStatus === 'PAID') {
    throw new AppError('Order is already paid', 400);
  }
  if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
    throw new AppError('Order cannot be paid in its current state', 400);
  }
  if (order.totalAmount <= 0) {
    throw new AppError('Invalid order total amount', 400);
  }

  return order;
};

/**
 * Prepares the Paystack initialization payload.
 */
const preparePaystackPayload = (order, callbackUrl) => {
  const defaultCallback = Array.isArray(FRONTEND_URL)
    ? FRONTEND_URL[0]
    : FRONTEND_URL;

  return {
    email: order.user.email,
    amount: Math.round(order.totalAmount * 100), // convert to kobo
    metadata: {
      orderId: order.id,
      userId: order.userId
    },
    callback_url: callbackUrl || `${defaultCallback}/payment/callback`
  };
};

export const initializePayment = async (orderId, user, callbackUrl) => {
  // 1. Validate
  const order = await validateOrderForPayment(orderId, user.id);

  // 2. Prepare & Initialize
  const payload = preparePaystackPayload(order, callbackUrl);

  try {
    const response = await paystack.post('/transaction/initialize', payload);

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
    if (error instanceof AppError) throw error;
    throw new AppError('Payment initialization failed: ' + error.message, 500);
  }
};

export const verifyPayment = async reference => {
  if (!reference) {
    throw new AppError('Payment reference is required', 400);
  }

  try {
    const response = await paystack.get(
      `/transaction/verify/${encodeURIComponent(reference)}`
    );
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

    const expectedAmount = Math.round(order.totalAmount * 100);
    if (Number.isFinite(amount) && amount !== expectedAmount) {
      throw new AppError('Payment amount does not match order total', 400);
    }
    if (currency && currency !== 'NGN') {
      throw new AppError('Unsupported payment currency', 400);
    }

    if (status === 'success') {
      return await processSuccessfulPayment(orderId, reference);
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

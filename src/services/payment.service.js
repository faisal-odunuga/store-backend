import paystack from '../config/paystack.config.js';
import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';
import messages from '../messages/index.js';
import { FRONTEND_URL } from '../secrets.js';

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
          phone: true,
          address: true
        }
      }
    }
  });

  if (!order) {
    throw new AppError(messages.error.orderNotFound, 404);
  }

  // 2. Check if order is already paid or cancelled
  if (order.status !== 'PENDING') {
    throw new AppError('Order is not in pending state', 400);
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

    return {
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference
    };
  } catch (error) {
    throw new AppError('Payment initialization failed: ' + error.message, 500);
  }
};

export const verifyPayment = async reference => {
  if (!reference) {
    throw new AppError('Payment reference is required', 400);
  }

  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    const { status, metadata } = response.data.data;

    if (status === 'success') {
      // Update order status
      const order = await prisma.order.update({
        where: { id: metadata.orderId },
        data: {
          status: 'PROCESSING' // Or PAID if you have that status
        }
      });

      return order;
    } else {
      throw new AppError('Payment verification failed', 400);
    }
  } catch (error) {
    throw new AppError('Payment verification error: ' + error.message, 500);
  }
};

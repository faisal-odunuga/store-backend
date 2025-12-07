import paystack from '../config/paystack.config.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import prisma from '../config/prismaClient.js';
import messages from '../messages/index.js';

export const initializePayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  const user = req.user;

  // 1. Get order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true
    }
  });

  if (!order) {
    return next(new AppError(messages.error.orderNotFound, 404));
  }

  // 2. Check if order is already paid or cancelled
  if (order.status !== 'PENDING') {
    return next(new AppError('Order is not in pending state', 400));
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
      callback_url: `${req.protocol}://${req.get(
        'host'
      )}/api/v1/payments/verify` // Or frontend URL
    });

    res.status(200).json({
      status: messages.success,
      data: {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference
      }
    });
  } catch (error) {
    return next(
      new AppError('Payment initialization failed: ' + error.message, 500)
    );
  }
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  const { reference } = req.query;

  if (!reference) {
    return next(new AppError('Payment reference is required', 400));
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

      res.status(200).json({
        status: messages.success,
        message: 'Payment verified successfully',
        data: {
          order
        }
      });
    } else {
      return next(new AppError('Payment verification failed', 400));
    }
  } catch (error) {
    return next(
      new AppError('Payment verification error: ' + error.message, 500)
    );
  }
});

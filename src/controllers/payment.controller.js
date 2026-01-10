import catchAsync from '../utils/catchAsync.js';
import messages from '../messages/index.js';
import * as paymentService from '../services/payment.service.js';

export const initializePayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  const user = req.user;

  const paymentData = await paymentService.initializePayment(orderId, user);

  res.status(200).json({
    status: messages.success,
    data: paymentData
  });
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  const { reference } = req.query;

  const order = await paymentService.verifyPayment(reference);

  res.status(200).json({
    status: messages.success,
    message: 'Payment verified successfully',
    data: {
      order
    }
  });
});

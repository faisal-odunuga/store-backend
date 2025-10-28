import prisma from '../config/prismaClient.js';
import messages from '../messages/index.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const createOrder = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: messages.success
  });
});

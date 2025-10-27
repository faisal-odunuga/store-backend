const prisma = require('../config/prismaClient');
const messages = require('../messages');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createOrder = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: messages.success
  });
});

const prisma = require('../config/prismaClient');
const messages = require('../messages');
const AppError = require('../utils/appError');
const { cleanUser } = require('../utils/helpers');
const { compareSycnc } = require('bcrypt');
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(new AppError('This route is not for password updates', 400));

  const data = req.validatedData;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data
  });
  res.status(200).json({
    status: 'success',
    message: messages.userUpdated,
    data: {
      user: cleanUser(updatedUser)
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  if (!req.body.password)
    return next(new AppError('Please provide your password', 400));

  if (!compareSycnc(req.body.password, req.user.password))
    return next(new AppError(messages.incorrectPassword, 400));

  await prisma.user.delete({
    where: { id: req.user.id }
  });
  res.status(204).json({
    status: 'success',
    message: messages.userDeleted,
    data: null
  });
});

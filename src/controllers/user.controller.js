import catchAsync from '../utils/catchAsync.js';
import messages from '../messages/index.js';
import AppError from '../utils/appError.js';
import prisma from '../config/prismaClient.js';
import { cleanUser } from '../utils/helpers.js';
import compareSycnc from 'bcrypt';

export const updateMe = catchAsync(async (req, res, next) => {
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

export const deleteMe = catchAsync(async (req, res, next) => {
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

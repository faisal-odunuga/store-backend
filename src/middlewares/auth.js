import prisma from '../config/prismaClient.js';
import messages from '../messages/index.js';
import { JWT_SECRET } from '../secrets.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import { cleanUser } from '../utils/helpers.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.headers.authorization;
  }

  if (!token) {
    return next(
      new AppError(messages.notAuthenticated || 'Not authenticated', 401)
    );
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(
      new AppError(
        messages.invalidToken || 'Invalid token or expired token',
        401
      )
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  if (!user) {
    return next(new AppError(messages.userNotFound || 'User not found', 401));
  }
  if (
    user.passwordChangedAt &&
    payload.iat < parseInt(user.passwordChangedAt.getTime() / 1000, 10)
  ) {
    return next(
      new AppError(
        messages.passwordRecentlyChanged || 'Password recently changed',
        401
      )
    );
  }

  req.user = cleanUser(user);
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(messages.unAuthorized || 'Unauthorized', 403));
    }
    next();
  };
};

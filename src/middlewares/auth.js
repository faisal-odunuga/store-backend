const prisma = require('../config/prismaClient');
const messages = require('../messages');
const { JWT_SECRET } = require('../secrets');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const { cleanUser } = require('../utils/helpers');

exports.protect = catchAsync(async (req, res, next) => {
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

// module.exports = authMiddleware;

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(messages.unAuthorized || 'Unauthorized', 403));
    }
    next();
  };
};

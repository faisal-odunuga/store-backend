// controllers/error.controller.js

import AppError from '../utils/appError.js';
import messages from '../messages/index.js';
import { SentenseCase } from '../utils/helpers.js';

const handlePrismaErrors = err => {
  // Duplicate value error (unique constraint)
  if (err.code === 'P2002') {
    const fields = err.meta?.target?.join(', ') || 'field';
    const message = `${SentenseCase(fields)} already exists.`;
    return new AppError(message, 400);
  }

  // Record not found
  if (err.code === 'P2025') {
    return new AppError(messages.recordNotFound || 'Record not found.', 404);
  }

  // Invalid query format
  if (err.message?.includes('Invalid `prisma`')) {
    return new AppError(messages.invalidData || 'Invalid data provided.', 400);
  }

  // Database connection error
  if (err.code === 'P1001' || err.code === 'P1002') {
    return new AppError(messages.dbError || 'Cannot connect to database.', 503);
  }

  return err; // If not a Prisma error, return original
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Prisma errors gracefully
  if (err.code && err.code.startsWith('P')) err = handlePrismaErrors(err);

  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR 💥', err);
    // Verbose output for debugging
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // In production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && err.errors.length > 0 && { errors: err.errors }) // ✅ include errors only when present
    });
  }

  // Programming or unknown error: don’t leak details
  console.error('💥 ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!'
  });
};

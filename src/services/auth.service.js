import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = async userData => {
  const { name, email, password, role, phone, address } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'CUSTOMER',
      phone,
      address
    }
  });

  const token = signToken(user.id);
  user.password = undefined;

  return { user, token };
};

export const login = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  const token = signToken(user.id);
  user.password = undefined;

  return { user, token };
};

export const forgotPassword = async email => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('There is no user with that email address.', 404);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken,
      passwordResetExpires
    }
  });

  // TODO: Send email with resetToken
  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() }
    }
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date()
    }
  });

  const newToken = signToken(user.id);
  return { user, token: newToken };
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    throw new AppError('Incorrect current password', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date()
    }
  });

  const token = signToken(user.id);
  return { user, token };
};

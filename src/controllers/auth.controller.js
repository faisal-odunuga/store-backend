import messages from '../messages/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { hashSync, compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_COOKIE_EXPIRES_IN,
  NODE_ENV
} from '../secrets.js';
import { cleanUser, createPasswordResetToken } from '../utils/helpers.js';
import prisma from '../config/prismaClient.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

export const signUp = catchAsync(async (req, res, next) => {
  const data = req.validatedData;
  const { email, name, password } = data;
  let user = await prisma.user.findUnique({
    where: { email }
  });
  if (user) {
    return next(new AppError('User already exists', 400));
  }
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashSync(password, 12)
    }
  });

  res.status(201).json({
    status: messages.success,
    messages: 'User Created Successfully',
    data: { user: cleanUser(newUser) }
  });
});

export const login = catchAsync(async (req, res, next) => {
  const data = req.validatedData;
  const { email, password } = data;
  let user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) {
    return next(new AppError('User does not exist', 400));
  }
  if (!compareSync(password, user.password)) {
    return next(new AppError(messages.incorrectPassword, 400));
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: true
  };

  if (NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(201).json({
    status: messages.success,
    data: {
      token,
      user: cleanUser(user)
    }
  });
});

export const getLoggedInUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: messages.success,
    data: req.user
  });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.validatedData;
  const { id: userId } = req.user;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return next(new AppError(messages.userNotFound, 400));
  }

  if (!compareSync(oldPassword, user.password)) {
    return next(new AppError(messages.incorrectPassword, 400));
  }

  if (oldPassword === newPassword) {
    return next(new AppError(messages.newPasswordSame, 400));
  }

  const hashedPassword = hashSync(newPassword, 12);
  const now = new Date();

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      passwordChangedAt: now
    }
  });

  // 5️⃣ Send response
  res.status(200).json({
    status: messages.success,
    message: 'Password updated successfully'
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) return next(new AppError(messages.emailRequired, 400));

  const user = await prisma.user.findUnique({
    where: { email: req.body.email }
  });

  if (!user) return next(new AppError(messages.userNotFound, 400));

  const {
    resetToken,
    passwordResetToken,
    passwordResetExpires
  } = createPasswordResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken,
      passwordResetExpires
    }
  });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message =
    'Forgot your password? Submit a PATCH request with your new password to: ' +
    resetUrl +
    ". If you didn't forget your password, please ignore this email!";
  const mail = {
    email: user.email,
    subject: 'Your Password Reset Token',
    message
  };
  try {
    await sendEmail(mail);
    res.status(200).json({
      status: messages.success,
      message: 'Password reset token sent to email successfully'
    });
  } catch (error) {
    console.log(error);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });
    return next(new AppError(messages.emailNotSent, 500, error.message));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: Date.now() }
    }
  });

  if (!user) return next(new AppError(messages.invalidToken, 400));

  // if(req.params.token)
  const now = new Date();
  const password = hashSync(req.validatedData.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: now
    }
  });

  res.status(200).json({
    status: messages.success,
    message: messages.passwordResetSuccess
  });
});

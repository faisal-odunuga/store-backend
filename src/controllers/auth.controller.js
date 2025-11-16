import messages from '../messages/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { hash } from 'bcrypt';
import {
  cleanUser,
  createPasswordResetToken,
  createToken
} from '../utils/helpers.js';
import prisma from '../config/prismaClient.js';
import crypto from 'crypto';
import sendEmail from '../emails/index.js';
import { FRONTEND_URL } from '../secrets.js';
import {
  clearAuthCookie,
  ensureUserDoesNotExist,
  ensureUserExists,
  newPasswordSame,
  sendResponse,
  setAuthCookie,
  validatePassword
} from '../utils/abstractions.js';

export const signUp = catchAsync(async (req, res, next) => {
  const data = req.validatedData;

  const { email, name, password } = data;

  await ensureUserDoesNotExist(prisma.user, email);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: await hash(password, 12)
    }
  });

  sendResponse(res, 201, 'User Created Successfully', {
    user: cleanUser(newUser)
  });
});

export const login = catchAsync(async (req, res, next) => {
  const user = await ensureUserExists(prisma.user, req.validatedData.email);
  await validatePassword(req.validatedData.password, user.password);

  const token = createToken(user);
  if (!token) {
    return next(new AppError('Errro creating token', 400));
  }
  setAuthCookie(res, req, token);
  sendResponse(res, 200, messages.loggedIn, { user: cleanUser(user) });
});

export const logout = catchAsync(async (req, res, next) => {
  clearAuthCookie(res, req);
  sendResponse(res, 200, messages.loggedOut);
});

export const getLoggedInUser = catchAsync(async (req, res, next) => {
  sendResponse(res, 200, messages.success, { user: req.user });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.validatedData;

  const user = ensureUserExists(prisma.user, req.user.email);
  await validatePassword(oldPassword, user.password);

  newPasswordSame(req.validatedData.oldPassword, req.validatedData.newPassword);

  await prisma.user.update({
    where: { email: user.id },
    data: {
      password: await hash(newPassword, 12),
      passwordChangedAt: new Date(Date.now())
    }
  });

  sendResponse(res, 201, messages.passwordUpdated);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) return next(new AppError(messages.emailRequired, 400));

  const user = await ensureUserExists(prisma.user, req.body.email);

  const {
    resetToken,
    passwordResetToken,
    passwordResetExpires
  } = createPasswordResetToken();

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      passwordResetToken,
      passwordResetExpires
    }
  });
  const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
  const mail = {
    email: user.email,
    subject: 'Your Password Reset Token',
    resetLink: resetUrl
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
      where: {
        id: user.id
      },
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
      passwordResetExpires: { gt: new Date(Date.now()) }
    }
  });

  if (!user) return next(new AppError(messages.invalidToken, 400));

  // if(req.params.token)
  const now = new Date();
  const password = await hash(req.validatedData.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: now
    }
  });

  sendResponse(res, 200, messages.passwordResetSuccess);
});

import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);
  user.password = undefined;

  const cookieOptions = {
    expires: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  apiResponse(res, statusCode, 'Login Successfull', { user });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { user } = await authService.register(req.body);
  createSendToken(user, 201, req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user } = await authService.login(email, password);
  createSendToken(user, 200, req, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const resetToken = await authService.forgotPassword(req.body.email);
  apiResponse(res, 200, 'Token sent to email!', { resetToken });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { user } = await authService.resetPassword(
    req.params.token,
    req.body.password
  );
  createSendToken(user, 200, req, res);
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { user } = await authService.changePassword(
    req.user.id,
    req.body.oldPassword,
    req.body.newPassword
  );
  createSendToken(user, 200, req, res);
});

export const getLoggedInUser = catchAsync(async (req, res, next) => {
  const user = await userService.getUserProfile(req.user.id);
  apiResponse(res, 200, 'User profile retrieved', { user });
});

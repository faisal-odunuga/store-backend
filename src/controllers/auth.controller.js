import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';

const setAuthCookie = (res, req, token) => {
  const origin = req.headers.origin || '';

  // default assumptions
  let isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
  let cookieDomain;

  // try to derive a sensible cookie domain from the request origin
  try {
    if (origin) {
      const hostname = new URL(origin).hostname;
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        isLocal = true;
      }

      // Production frontend: www.coloredbricksstudio.com -> set cookie for parent domain
      if (hostname.endsWith('coloredbricksstudio.com')) {
        cookieDomain = '.coloredbricksstudio.com';
      }
      // Railway dev domain (e.g. cbsbackend-development.up.railway.app)
      else if (
        hostname.endsWith('railway.app') ||
        hostname.endsWith('up.railway.app')
      ) {
        // use the public railway parent domain so cookies apply to the app subdomain
        cookieDomain = '.up.railway.app';
      }
      // Vercel / other hosting: leave undefined to allow host default
      else {
        cookieDomain = undefined;
      }
    }
  } catch (err) {
    // if origin parsing fails, fall back to defaults (no domain override)
    cookieDomain = undefined;
  }

  const expiresDate = new Date(
    Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: !isLocal, // true in production (HTTPS), false locally
    sameSite: isLocal ? 'lax' : 'none',
    expires: expiresDate,
    domain: cookieDomain,
    path: '/'
  });
};

const createSendToken = (user, token, statusCode, req, res) => {
  user.password = undefined;
  setAuthCookie(res, req, token);
  apiResponse(res, statusCode, 'Login Successfull', { user, token });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.register(req.body);
  createSendToken(user, token, 201, req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  createSendToken(user, token, 200, req, res);
});

export const adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authService.adminLogin(email, password);
  createSendToken(user, token, 200, req, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const resetToken = await authService.forgotPassword(req.body.email);
  apiResponse(res, 200, 'Token sent to email!', { resetToken });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.resetPassword(
    req.params.token,
    req.body.password
  );
  createSendToken(user, token, 200, req, res);
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.changePassword(
    req.user.id,
    req.body.oldPassword,
    req.body.newPassword
  );
  createSendToken(user, token, 200, req, res);
});

export const getLoggedInUser = catchAsync(async (req, res, next) => {
  const user = await userService.getUserProfile(req.user.id);
  apiResponse(res, 200, 'User profile retrieved', { user });
});

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  apiResponse(res, 200, 'Logged out successfully');
};

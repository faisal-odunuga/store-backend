import AppError from './appError.js';
import messages from './messages.js';
import crypto from 'crypto';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  JWT_COOKIE_EXPIRES_IN,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  NIGERIA_TZ,
  NODE_ENV
} from '../secrets.js';

export const validatePassword = async (plain, hashed) => {
  const isValid = await compare(plain, hashed);
  if (!isValid) throw new AppError(messages.incorrectPassword, 400);
};

export const ensureUserDoesNotExist = async (model, email) => {
  const existing = await model.findUnique({ where: { email } });
  if (existing)
    throw new AppError(messages.userExists || 'User already exists', 400);
};

export const ensureUserExists = async (model, email) => {
  const user = await model.findUnique({ where: { email } });
  if (!user) throw new AppError(messages.userNotFound, 404);
  return user;
};

export const newPasswordSame = (oldPassword, newPassword) => {
  if (oldPassword === newPassword)
    throw new AppError(messages.newPasswordSame, 400);
};

export const createToken = user => {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
  return token;
};

export const setAuthCookie = (res, req, token) => {
  const origin = req.headers.origin || '';

  // default assumptions
  let isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
  let cookieDomain;

  // try to derive a sensible cookie domain from the request origin
  try {
    if (origin) {
      const hostname = new URL(origin).hostname;
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1'))
        isLocal = true;

      // Production frontend: www.coloredbricksstudio.com -> set cookie for parent domain
      //   if (hostname.endsWith('coloredbricksstudio.com')) {
      //     cookieDomain = '.coloredbricksstudio.com';
      //   }

      //   // Railway dev domain (e.g. cbsbackend-development.up.railway.app)
      //   else if (
      //     hostname.endsWith('railway.app') ||
      //     hostname.endsWith('up.railway.app')
      //   ) {
      //     // use the public railway parent domain so cookies apply to the app subdomain
      //     cookieDomain = '.up.railway.app';
      //   }

      //   // Vercel / other hosting: leave undefined to allow host default
      //   else {
      //     cookieDomain = undefined;
      //   }
    }
  } catch (err) {
    // if origin parsing fails, fall back to defaults (no domain override)
    cookieDomain = undefined;
  }

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: !isLocal, // true in production (HTTPS), false locally
    sameSite: isLocal ? 'lax' : 'none',
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    domain: cookieDomain,
    path: '/'
  });
};

export const clearAuthCookie = (res, req) => {
  const origin = req.headers.origin || '';

  let isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
  let cookieDomain;

  try {
    if (origin) {
      const hostname = new URL(origin).hostname;
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1'))
        isLocal = true;

      if (hostname.endsWith('coloredbricksstudio.com'))
        cookieDomain = '.coloredbricksstudio.com';
      else if (
        hostname.endsWith('railway.app') ||
        hostname.endsWith('up.railway.app')
      )
        cookieDomain = '.up.railway.app';
      else cookieDomain = undefined;
    }
  } catch (err) {
    cookieDomain = undefined;
  }

  res.clearCookie('jwt', {
    httpOnly: true,
    secure: !isLocal,
    sameSite: isLocal ? 'lax' : 'none',
    domain: cookieDomain,
    path: '/'
  });
};

export const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return { resetToken, passwordResetToken, passwordResetExpires };
};

export const sendResponse = (
  res,
  statusCode,
  message = null,
  data = {},
  result = null
) => {
  const response = {
    status: 'success'
  };

  if (message) response.message = message;
  if (result !== null) response.result = result;

  // if data is not empty, spread its content at the root level
  if (data && Object.keys(data).length > 0) {
    Object.assign(response, data);
  }

  res.status(statusCode).json(response);
};

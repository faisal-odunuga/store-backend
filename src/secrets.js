export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const NIGERIA_TZ = 'Africa/Lagos';

export const DB_URL = process.env.DATABASE_URL;
export const DB_NAME = process.env.DB_NAME;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN;

export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const EMAIL_PORT = process.env.EMAIL_PORT;

export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const normalizeOrigins = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const FRONTEND_URL =
  process.env.NODE_ENV === 'development'
    ? normalizeOrigins([process.env.FRONTEND_URL_DEV, process.env.FRONTEND_URL_DEV2])
    : normalizeOrigins([process.env.FRONTEND_URL_PROD, process.env.FRONTEND_URL_PROD2]);

export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY;
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export const ORDER_RESERVATION_MINUTES = Number(
  process.env.ORDER_RESERVATION_MINUTES ?? 30
);

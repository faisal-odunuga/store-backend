import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const DB_URL = process.env.DATABASE_URL;
export const DB_NAME = process.env.DB_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const EMAIL_PORT = process.env.EMAIL_PORT;

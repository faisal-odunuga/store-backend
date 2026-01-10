import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import messages from './src/messages/index.js';
import AppError from './src/utils/appError.js';
import globalErrorHandler from './src/controllers/error.controller.js';
import * as paymentController from './src/controllers/payment.controller.js';

import apiRoutes from './src/routes/index.js'; // 👈 import the global route handler

const app = express();

app.use(helmet());
// app.use(xss());
app.use(hpp());
app.use(cookieParser());

app.use(
  cors({
    origin: ['https://store-frontend-test.vercel.app'],
    credentials: true
  })
);

// ─── WEBHOOKS ──────────────────────────────────
// Stripe webhook needs raw body, so it must be defined before express.json()
// app.post(
//   '/api/v1/payments/webhook',
//   express.raw({ type: 'application/json' }),
//   paymentController.webhook
// );

// ─── MIDDLEWARE ────────────────────────────────
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 1000,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour'
});
app.use('/api', limiter);

// ─── ROUTES ────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).json({
    status: messages.success,
    message: '✅ Server is running successfully'
  });
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: messages.success,
    message: 'Welcome to the Store API'
  });
});

// Global route handler
app.use('/api/v1', apiRoutes);

// ─── UNHANDLED ROUTES ──────────────────────────
app.use((req, res, next) => {
  next(new AppError(`❌ Can't find ${req.originalUrl} on this server`, 404));
});

// ─── GLOBAL ERROR HANDLER ──────────────────────
app.use(globalErrorHandler);

export default app;

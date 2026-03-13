import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { clerkMiddleware } from '@clerk/express';

import messages from './src/messages/index.js';
import AppError from './src/utils/appError.js';
import globalErrorHandler from './src/controllers/error.controller.js';

import apiRoutes from './src/routes/index.js';
import { FRONTEND_URL } from './src/secrets.js';

const app = express();

// Needed on platforms like Render/Heroku to trust X-Forwarded-* headers
app.set('trust proxy', 1);

app.use(helmet());
app.use(hpp());
app.use(cookieParser());

const allowedOrigins = Array.isArray(FRONTEND_URL)
  ? FRONTEND_URL
  : [FRONTEND_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError('Not allowed by CORS', 403), false);
    },
    credentials: true
  })
);

app.use('/api/v1/webhooks/clerk', express.raw({ type: 'application/json' }));
app.use('/api/v1/webhooks/paystack', express.raw({ type: 'application/json' }));

app.use(clerkMiddleware());
app.use(
  express.json({
    limit: '10kb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  })
);

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

app.use('/api/v1', apiRoutes);

// ─── UNHANDLED ROUTES ──────────────────────────
app.use((req, res, next) => {
  next(new AppError(`❌ Can't find ${req.originalUrl} on this server`, 404));
});

// ─── GLOBAL ERROR HANDLER ──────────────────────
app.use(globalErrorHandler);

export default app;

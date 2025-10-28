import express from 'express';
import morgan from 'morgan';
import messages from './messages/index.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/error.controller.js';
import apiRoutes from './routes/index.js'; // 👈 import the global route handler

const app = express();

// ─── MIDDLEWARE ────────────────────────────────
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── ROUTES ────────────────────────────────────
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: messages.success,
    message: '✅ Server is running successfully'
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

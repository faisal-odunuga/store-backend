const express = require('express');
const morgan = require('morgan');

const messages = require('./messages');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');
const apiRoutes = require('./routes'); // 👈 import the global route handler

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

module.exports = app;

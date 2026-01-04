// Load environment variables first
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import app from './app.js';
import { PORT, NODE_ENV } from './src/secrets.js';

const prisma = new PrismaClient();

app.use(bodyParser.json());

const port = PORT || 8080;

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectWithRetry = async (retryCount = 0) => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error(`❌ Database connection failed: ${err.message}`);
    if (retryCount < MAX_RETRIES) {
      console.log(
        `🔁 Retrying in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount +
          1}/${MAX_RETRIES})`
      );
      await new Promise(res => setTimeout(res, RETRY_DELAY));
      return connectWithRetry(retryCount + 1);
    } else {
      console.error('💥 Max retries reached. Exiting...');
      process.exit(1);
    }
  }
};

// Run server only after successful DB connection
(async () => {
  await connectWithRetry();

  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port} in ${NODE_ENV} mode`);
  });

  const gracefulShutdown = async signal => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    await prisma.$disconnect();
    server.close(() => {
      console.log('✅ Server closed. Prisma disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
})();

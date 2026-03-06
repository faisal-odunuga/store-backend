import { releaseExpiredOrders } from '../services/order.service.js';

const run = async () => {
  const startedAt = new Date();
  try {
    const result = await releaseExpiredOrders();
    console.log(
      `[cleanupExpiredOrders] released=${result.releasedCount} at ${startedAt.toISOString()}`
    );
  } catch (error) {
    console.error('[cleanupExpiredOrders] failed', error);
    process.exitCode = 1;
  }
};

run();

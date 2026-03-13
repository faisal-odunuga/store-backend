import catchAsync from '../utils/catchAsync.js';
import * as webhookService from '../services/webhook.service.js';
import AppError from '../utils/appError.js';

export const clerkWebhook = catchAsync(async (req, res) => {
  const result = await webhookService.handleClerkWebhook(req.body, req.headers);
  res.status(200).json(result);
});

export const paystackWebhook = catchAsync(async (req, res, next) => {
  console.log('🚨 Paystack Webhook hit!');

  if (!req.body) return next(new AppError('No body provided', 400));

  const signature = req.headers['x-paystack-signature'];
  const isValid = webhookService.verifyPaystackSignature(req.body, signature);

  if (!isValid) {
    console.log('❌ Paystack Signature mismatch');
    return next(new AppError('Invalid Paystack signature', 401));
  }

  // Parse raw JSON after verifying signature
  let event;
  try {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : req.body;
    event = JSON.parse(rawBody);
    console.log('✅ Webhook body parsed:', event.event);
  } catch (err) {
    return next(new AppError('Invalid JSON payload', 400));
  }

  await webhookService.handlePaystackWebhook(event);

  res.status(200).send('Webhook received');
});

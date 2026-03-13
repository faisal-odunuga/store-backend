import { Webhook } from 'svix';
import crypto from 'crypto';
import * as authService from './auth.service.js';
import * as orderService from './order.service.js';
import { PAYSTACK_SECRET_KEY } from '../secrets.js';

export const handleClerkWebhook = async (reqBody, headers) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Clerk Webhook secret not configured');
  }

  const svixHeaders = {
    'svix-id': headers['svix-id'],
    'svix-timestamp': headers['svix-timestamp'],
    'svix-signature': headers['svix-signature']
  };

  const wh = new Webhook(WEBHOOK_SECRET);
  const rawBody = Buffer.isBuffer(reqBody)
    ? reqBody.toString('utf8')
    : JSON.stringify(reqBody);
  const event = wh.verify(rawBody, svixHeaders);

  const {
    id: clerkId,
    email_addresses,
    first_name,
    last_name,
    public_metadata,
    private_metadata
  } = event.data;

  const email = email_addresses?.[0]?.email_address;
  const name = [first_name, last_name].filter(Boolean).join(' ');
  const role = private_metadata?.role || public_metadata?.role;

  if (event.type === 'user.created' || event.type === 'user.updated') {
    await authService.syncClerkUser({ clerkId, email, name, role });
  }

  return { received: true };
};

export const verifyPaystackSignature = (body, signature) => {
  if (!signature) return false;
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');
  return hash === signature;
};

export const handlePaystackWebhook = async event => {
  // Only process successful charges
  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;
    const orderId = metadata?.orderId;

    if (!orderId) {
      console.error(
        '⚠️ Metadata missing orderId in Paystack event:',
        reference
      );
      return;
    }

    try {
      await orderService.processSuccessfulPayment(orderId, reference);
      console.log('✅ Payment processed successfully for Order:', orderId);
    } catch (err) {
      console.error('❌ Error processing Paystack webhook:', err.message);

      // Handle specific conflicts (like insufficient stock after payment)
      if (err.message.includes('Insufficient stock')) {
        console.log(
          '⚠️ Stock conflict detected for Order:',
          orderId,
          '. Manual refund or intervention required.'
        );
        // Here you would trigger a refund service call:
        // await PaymentService.refundPayment(reference);
      }

      // We don't re-throw here because we want to return 200 to Paystack
      // to acknowledge receipt, even if internal processing had a conflict.
    }
  }
};

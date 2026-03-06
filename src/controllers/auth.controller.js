import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import * as adminService from '../services/admin.service.js';
import catchAsync from '../utils/catchAsync.js';
import apiResponse from '../utils/apiResponse.js';
import { Webhook } from 'svix';
import { createClerkClient } from '@clerk/express';

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export const getLoggedInUser = catchAsync(async (req, res, next) => {
  // Use clerkId from middleware (always present if 'protect' passed)
  const clerkId = req.clerkId || req.user?.clerkId;

  // If user is not in DB yet, return basic info or empty user object
  const user = req.user ? await userService.getUserProfile(req.user.id) : null;

  let setupComplete;

  try {
    if (clerkClient && clerkId) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const metaSetup =
        clerkUser?.privateMetadata?.setupComplete ?? clerkUser?.publicMetadata?.setupComplete;
      setupComplete = metaSetup !== false;
    }
  } catch (error) {
    console.warn('Failed to load Clerk metadata for setup status.');
  }

  apiResponse(res, 200, 'User profile retrieved', {
    user: user
      ? {
          ...user,
          ...(setupComplete !== undefined ? { setupComplete } : {})
        }
      : {
          clerkId,
          role: 'CUSTOMER', // Default role if not synced
          setupComplete: true
        }
  });
});

export const completeSetup = catchAsync(async (req, res) => {
  const updated = await adminService.markSetupComplete(req.user.clerkId);
  apiResponse(res, 200, 'Setup completed', { user: updated });
});

/**
 * Clerk webhook — syncs user into the DB after creation in Clerk.
 * Set up in Clerk dashboard: Webhook URL = POST /api/v1/auth/webhook
 * Events: user.created, user.updated
 */
export const clerkWebhook = catchAsync(async (req, res, next) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const svixHeaders = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature']
  };

  let event;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    // req.body is a Buffer when using express.raw()
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : JSON.stringify(req.body);
    event = wh.verify(rawBody, svixHeaders);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

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

  res.status(200).json({ received: true });
});

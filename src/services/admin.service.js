import { createClerkClient } from '@clerk/express';
import AppError from '../utils/appError.js';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

/**
 * Creates a new admin user in Clerk.
 * The user will be synced to our DB via the webhook.
 */
export const createManagerUser = async adminData => {
  const { email, password, firstName, lastName } = adminData;

  try {
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      privateMetadata: {
        role: 'MANAGER',
        setupComplete: false
      }
    });

    return user;
  } catch (error) {
    console.error('Clerk Create User Error:', error);
    throw new AppError(
      error.errors?.[0]?.message || 'Failed to create admin user in Clerk',
      400
    );
  }
};

export const markSetupComplete = async clerkId => {
  try {
    const user = await clerkClient.users.getUser(clerkId);
    const privateMetadata = {
      ...(user.privateMetadata || {}),
      setupComplete: true
    };
    const publicMetadata = {
      ...(user.publicMetadata || {}),
      setupComplete: true
    };

    return await clerkClient.users.updateUser(clerkId, {
      privateMetadata,
      publicMetadata
    });
  } catch (error) {
    console.error('Clerk Update User Error:', error);
    throw new AppError(
      error.errors?.[0]?.message || 'Failed to update setup status in Clerk',
      400
    );
  }
};

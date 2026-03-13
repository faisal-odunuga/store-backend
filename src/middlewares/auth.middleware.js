import { createClerkClient, getAuth, requireAuth } from '@clerk/express';
import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { syncClerkUser } from '../services/auth.service.js';

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export const protect = catchAsync(async (req, res, next) => {
  const clerkId = req.auth().userId;

  if (!clerkId) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  let currentUser = await prisma.user.findUnique({
    where: { clerkId }
  });

  if (!currentUser) {
    if (!clerkClient) {
      return next(
        new AppError('User not synced yet. Clerk secret not configured.', 401)
      );
    }

    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(' ');
    const role =
      clerkUser.privateMetadata?.role || clerkUser.publicMetadata?.role;

    currentUser = await syncClerkUser({ clerkId, email, name, role });
  }

  req.clerkId = clerkId;
  req.user = currentUser;
  next();
});

export const protectRoute = [requireAuth(), protect];

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

import prisma from '../config/prismaClient.js';

const allowedRoles = new Set(['ADMIN', 'MANAGER', 'CUSTOMER']);
const roleAliases = new Map([['OWNER', 'ADMIN']]);

/**
 * Finds or creates a user based on Clerk's webhook payload.
 * Called when Clerk fires `user.created` or `user.updated` events.
 */
export const syncClerkUser = async ({ clerkId, email, name, role }) => {
  const resolvedRole = roleAliases.get(role) || role;
  const normalizedRole = allowedRoles.has(resolvedRole) ? resolvedRole : undefined;
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      name,
      email,
      ...(normalizedRole && { role: normalizedRole })
    },
    create: {
      clerkId,
      name,
      email,
      role: normalizedRole || 'CUSTOMER'
    }
  });

  return user;
};

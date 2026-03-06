import { createClerkClient } from '@clerk/express';
import prisma from '../config/prismaClient.js';

const args = process.argv.slice(2);
const getArgValue = (key) => {
  const prefix = `--${key}=`;
  const arg = args.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
};

const toSet = (value) =>
  new Set(
    (value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );

const dryRun = args.includes('--dry-run');
const forceDemoteAll = args.includes('--force-demote-all-admins');

const ownerClerkIds = toSet(
  getArgValue('owner-clerk-ids') || process.env.OWNER_CLERK_IDS,
);
const ownerEmails = toSet(
  (getArgValue('owner-emails') || process.env.OWNER_EMAILS || '').toLowerCase(),
);
const hasOwners = ownerClerkIds.size > 0 || ownerEmails.size > 0;

const clerkSecret = process.env.CLERK_SECRET_KEY;
if (!clerkSecret) {
  console.error('CLERK_SECRET_KEY is required to migrate Clerk users.');
  process.exit(1);
}

const clerkClient = createClerkClient({
  secretKey: clerkSecret,
});

const isOwner = (user) => {
  if (ownerClerkIds.has(user.id)) return true;
  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return email ? ownerEmails.has(email) : false;
};

const migrateClerkUsers = async () => {
  console.log('[roles:migrate] Migrating Clerk users...');
  let offset = 0;
  const limit = 100;
  let updatedCount = 0;

  while (true) {
    const users = await clerkClient.users.getUserList({ limit, offset });
    if (!users.length) break;

    for (const user of users) {
      const privateRole = user.privateMetadata?.role;
      const publicRole = user.publicMetadata?.role;
      const currentRole = privateRole || publicRole;

      let targetRole = currentRole;

      if (currentRole === 'OWNER') {
        targetRole = 'ADMIN';
      }

      if (currentRole === 'ADMIN' && (hasOwners || forceDemoteAll)) {
        if (!isOwner(user) || forceDemoteAll) {
          targetRole = 'MANAGER';
        }
      }

      if (!currentRole && hasOwners && isOwner(user)) {
        targetRole = 'ADMIN';
      }

      if (!targetRole || targetRole === currentRole) {
        continue;
      }

      if (dryRun) {
        console.log(
          `[dry-run] Clerk user ${user.id} (${user.emailAddresses?.[0]?.emailAddress}) ${currentRole || 'NONE'} -> ${targetRole}`
        );
        continue;
      }

      const nextPrivate = { ...(user.privateMetadata || {}), role: targetRole };
      const nextPublic = {
        ...(user.publicMetadata || {}),
        role: targetRole,
      };

      await clerkClient.users.updateUser(user.id, {
        privateMetadata: nextPrivate,
        publicMetadata: nextPublic,
      });
      updatedCount += 1;
    }

    offset += users.length;
  }

  console.log(`[roles:migrate] Clerk users updated: ${updatedCount}`);
};

const migrateDbRoles = async () => {
  console.log('[roles:migrate] Migrating DB roles...');

  if (dryRun) {
    console.log('[dry-run] Skipping DB role updates.');
    return;
  }

  // Convert legacy OWNER to ADMIN if any exist in DB
  await prisma.$executeRaw`UPDATE "users" SET role = 'ADMIN' WHERE role = 'OWNER'`;

  if (hasOwners) {
    const ownerIds = Array.from(ownerClerkIds);
    if (ownerIds.length) {
      await prisma.user.updateMany({
        where: { clerkId: { in: ownerIds } },
        data: { role: 'ADMIN' },
      });
    }

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, clerkId: true, email: true },
    });

    const toDemote = admins.filter((user) => {
      const email = user.email?.toLowerCase();
      const isOwnerId = ownerClerkIds.has(user.clerkId);
      const isOwnerEmail = email ? ownerEmails.has(email) : false;
      return !(isOwnerId || isOwnerEmail);
    });

    for (const user of toDemote) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'MANAGER' },
      });
    }

    console.log(`[roles:migrate] DB users demoted to MANAGER: ${toDemote.length}`);
  } else if (forceDemoteAll) {
    const updated = await prisma.user.updateMany({
      where: { role: 'ADMIN' },
      data: { role: 'MANAGER' },
    });
    console.log(`[roles:migrate] DB users demoted to MANAGER: ${updated.count}`);
  } else {
    console.warn(
      '[roles:migrate] No owner identifiers provided. ADMIN users were not demoted.\n' +
        'Provide OWNER_CLERK_IDS or OWNER_EMAILS to demote regular admins to MANAGER.',
    );
  }
};

const run = async () => {
  console.log('[roles:migrate] Starting role migration...');
  if (!hasOwners && !forceDemoteAll) {
    console.warn(
      '[roles:migrate] Owner identifiers not provided. Only legacy OWNER -> ADMIN will be updated.',
    );
  }

  await migrateClerkUsers();
  await migrateDbRoles();
  await prisma.$disconnect();
  console.log('[roles:migrate] Completed.');
};

run().catch((error) => {
  console.error('[roles:migrate] Failed:', error);
  process.exit(1);
});

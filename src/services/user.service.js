import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

export const getUserProfile = async userId => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const getAllUsers = async (query = {}) => {
  const { role, search, page = 1, limit = 20 } = query;
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      where,
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  return {
    users,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize)
  };
};

export const updateUserProfile = async (userId, updateData) => {
  // Only allow safe fields to be updated
  const { name, phone } = updateData;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, phone }
  });
  return user;
};

// ─── ADDRESS MANAGEMENT ──────────────────────────

export const getAddresses = async userId => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const addAddress = async (userId, data) => {
  const { isDefault, ...addressData } = data;

  // If this is set as default, unset other defaults for this user
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });
  }

  return await prisma.address.create({
    data: {
      ...addressData,
      isDefault: !!isDefault,
      userId
    }
  });
};

export const updateAddress = async (id, userId, data) => {
  const { isDefault, ...addressData } = data;

  // Ensure address belongs to user
  const address = await prisma.address.findFirst({
    where: { id, userId }
  });
  if (!address) throw new AppError('Address not found', 404);

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });
  }

  return await prisma.address.update({
    where: { id },
    data: {
      ...addressData,
      isDefault: isDefault !== undefined ? !!isDefault : address.isDefault
    }
  });
};

export const deleteAddress = async (id, userId) => {
  const address = await prisma.address.findFirst({
    where: { id, userId }
  });
  if (!address) throw new AppError('Address not found', 404);

  await prisma.address.delete({ where: { id } });
};

// ─── WISHLIST MANAGEMENT ─────────────────────────

export const getWishlist = async userId => {
  return await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const addToWishlist = async (userId, productId) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  if (!product) throw new AppError('Product not found', 404);

  // Use upsert or find then create to avoid duplicates
  return await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId, productId }
    },
    update: {}, // No change if already exists
    create: {
      userId,
      productId
    }
  });
};

export const removeFromWishlist = async (userId, productId) => {
  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: { userId, productId }
      }
    });
  } catch (error) {
    // If it doesn't exist, we don't necessarily need to throw, but following strict patterns:
    throw new AppError('Item not found in wishlist', 404);
  }
};

export const updateUserRole = async (userId, role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
};

export const deleteUser = async userId => {
  await prisma.user.delete({ where: { id: userId } });
};

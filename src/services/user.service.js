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

export const updateUserRole = async (userId, role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
};

export const deleteUser = async userId => {
  await prisma.user.delete({ where: { id: userId } });
};

import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.password = undefined;
  return user;
};

export const getAllUsers = async () => {
    const users = await prisma.user.findMany();
    users.forEach(user => user.password = undefined);
    return users;
}

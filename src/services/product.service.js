import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';

export const createProduct = async (productData, imageUrl) => {
  const product = await prisma.product.create({
    data: {
      ...productData,
      imageUrl, // URL is now passed directly from controller (via multer-s3)
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock, 10)
    }
  });

  return product;
};

export const getAllProducts = async query => {
  const { category, search, sort, page = 1, limit = 10 } = query;
  const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

  const where = {};
  if (category) where.category = { equals: category, mode: 'insensitive' };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const orderBy =
    sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: parseInt(limit),
      where,
      orderBy
    }),
    prisma.product.count({ where })
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
};

export const getProductById = async id => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const updateProduct = async (id, updateData) => {
  const product = await prisma.product.update({
    where: { id },
    data: updateData
  });
  return product;
};

export const deleteProduct = async id => {
  await prisma.product.delete({ where: { id } });
};

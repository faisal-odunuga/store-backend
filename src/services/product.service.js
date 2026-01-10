import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';
import cloudinary from '../config/cloudinary.config.js';

export const createProduct = async (productData, file) => {
  let imageUrl = null;

  if (file) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    let dataURI = 'data:' + file.mimetype + ';base64,' + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'products'
    });
    imageUrl = result.secure_url;
  }

  const product = await prisma.product.create({
    data: {
      ...productData,
      imageUrl,
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

export const getProductsByCategory = async category => {
  const products = await prisma.product.findMany({
    where: { category: { equals: category, mode: 'insensitive' } }
  });
  return { products };
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

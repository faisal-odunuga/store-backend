import prisma from '../config/prismaClient.js';
import messages from '../messages/index.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

/* ======================================================
   ✅ GET ALL PRODUCTS (with pagination, search & sorting)
====================================================== */
export const getAllProducts = catchAsync(async (req, res, next) => {
  const { category, search, sort } = req.query;

  // Pagination setup
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  // Dynamic filtering
  const where = {};
  if (category) where.category = { equals: category, mode: 'insensitive' };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Dynamic sorting
  const orderBy =
    sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : { createdAt: 'desc' };

  // Fetch products
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy
    }),
    prisma.product.count({ where })
  ]);

  res.status(200).json({
    status: messages.success,
    page,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
    results: products.length,
    data: { products }
  });
});

/* ======================================================
   ✅ GET SINGLE PRODUCT
====================================================== */
export const getProduct = catchAsync(async (req, res, next) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: req.params.id },
    cacheStrategy: { ttl: 60 }
  });

  if (!product) return next(new AppError('Product not found', 404));

  res.status(200).json({
    status: messages.success,
    data: { product }
  });
});

/* ======================================================
   ✅ CREATE PRODUCT (Zod validated)
====================================================== */
export const createProduct = catchAsync(async (req, res, next) => {
  const product = await prisma.product.create({
    data: req.validatedData
  });

  res.status(201).json({
    status: messages.success,
    data: { product }
  });
});

/* ======================================================
   ✅ UPDATE PRODUCT
====================================================== */
export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.validatedData
  });

  res.status(200).json({
    status: messages.success,
    data: { product }
  });
});

/* ======================================================
   ✅ DELETE PRODUCT
====================================================== */
export const deleteProduct = catchAsync(async (req, res, next) => {
  await prisma.product.delete({
    where: { id: req.params.id }
  });

  res.status(204).json({
    status: messages.success,
    data: null
  });
});

/* ======================================================
   ✅ GET PRODUCTS BY CATEGORY
====================================================== */
export const getProductsByCategory = catchAsync(async (req, res, next) => {
  const category = req.params.category;

  const products = await prisma.product.findMany({
    where: {
      category: {
        equals: category,
        mode: 'insensitive'
      }
    },
    orderBy: { createdAt: 'desc' },
    cacheStrategy: { ttl: 60 }
  });

  if (!products.length)
    return next(new AppError('No products found for this category', 404));

  res.status(200).json({
    status: messages.success,
    results: products.length,
    data: { products }
  });
});

/* ======================================================
   ✅ GET RELATED PRODUCTS
====================================================== */
export const getRelatedProducts = catchAsync(async (req, res, next) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id }
  });

  if (!product) return next(new AppError('Product not found', 404));

  const related = await prisma.product.findMany({
    where: {
      category: { equals: product.category, mode: 'insensitive' },
      NOT: { id: product.id }
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
    cacheStrategy: { ttl: 60 }
  });

  res.status(200).json({
    status: messages.success,
    results: related.length,
    data: { related }
  });
});

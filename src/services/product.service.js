import prisma from '../config/prismaClient.js';
import AppError from '../utils/appError.js';
import cloudinary from '../config/cloudinary.config.js';

const uploadProductImage = async file => {
  if (!file) return null;
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURI = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'products'
  });
  return result.secure_url;
};

const parseImages = images => {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // not JSON, maybe comma-separated
      return images
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const parseSpecs = specs => {
  if (!specs) return null;
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs);
    } catch {
      return [specs]; // fallback single string
    }
  }
  return specs; // allow object/array
};

export const createProduct = async (productData, file) => {
  let images = parseImages(productData.images);
  const specs = parseSpecs(productData.specs);

  if (file) {
    const uploaded = await uploadProductImage(file);
    images = images.length ? images : [uploaded];
  }

  const costPrice = parseFloat(productData.costPrice);
  const sellingPrice = parseFloat(productData.sellingPrice);
  if (!Number.isFinite(costPrice) || !Number.isFinite(sellingPrice)) {
    throw new AppError('Invalid pricing values', 400);
  }

  const discountPrice = productData.discountPrice
    ? parseFloat(productData.discountPrice)
    : null;
  if (discountPrice !== null && discountPrice > sellingPrice) {
    throw new AppError('Discount price cannot exceed selling price', 400);
  }

  const product = await prisma.product.create({
    data: {
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      barcode: productData.barcode,
      costPrice,
      sellingPrice,
      discountPrice,
      stock: parseInt(productData.stock ?? 0, 10),
      lowStockAlert: parseInt(productData.lowStockAlert ?? 5, 10),
      weight: productData.weight ? parseFloat(productData.weight) : null,
      category: productData.category,
      images,
      specs,
      isActive: productData.isActive !== undefined ? productData.isActive : true
    }
  });

  return product;
};

export const getAllProducts = async query => {
  const {
    category,
    search,
    sort,
    page = 1,
    limit = 10,
    isActive,
    minPrice,
    maxPrice,
    inStock
  } = query;
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {};
  if (category) where.category = { equals: category, mode: 'insensitive' };
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.sellingPrice = {};
    if (minPrice !== undefined) where.sellingPrice.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) where.sellingPrice.lte = parseFloat(maxPrice);
  }
  if (inStock !== undefined) {
    const wantsStock = inStock === 'true' || inStock === true;
    if (wantsStock) {
      where.stock = { gt: 0 };
    }
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } }
    ];
  }

  const orderBy =
    sort === 'price_asc'
      ? { sellingPrice: 'asc' }
      : sort === 'price_desc'
      ? { sellingPrice: 'desc' }
      : sort === 'oldest'
      ? { createdAt: 'asc' }
      : { createdAt: 'desc' };

  const [products, total, categoriesResult] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: pageSize,
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        sellingPrice: true,
        discountPrice: true,
        stock: true,
        lowStockAlert: true,
        images: true,
        specs: true,
        isActive: true,
        createdAt: true
      },
      orderBy
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    })
  ]);

  const categories = categoriesResult
    .map(item => item.category)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => a.localeCompare(b));

  return {
    products,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    categories
  };
};

export const getProductsByCategory = async category => {
  const products = await prisma.product.findMany({
    where: {
      category: { equals: category, mode: 'insensitive' },
      isActive: true
    }
  });
  return { products };
};

export const getProductById = async idOrSku => {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSku }, { sku: { equals: idOrSku, mode: 'insensitive' } }]
    },
    select: {
      id: true,
      name: true,
      description: true,
      sku: true,
      barcode: true,
      costPrice: true,
      sellingPrice: true,
      discountPrice: true,
      stock: true,
      lowStockAlert: true,
      weight: true,
      category: true,
      images: true,
      specs: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true } }
        }
      }
    }
  });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const updateProduct = async (id, updateData, file) => {
  const data = { ...updateData };

  if (file) {
    const uploaded = await uploadProductImage(file);
    // append uploaded file to images array
    const existing = parseImages(updateData.images);
    data.images = [...existing, uploaded].filter(Boolean);
  }

  if (updateData.images !== undefined && !file) {
    data.images = parseImages(updateData.images);
  }

  if (updateData.specs !== undefined) {
    data.specs = parseSpecs(updateData.specs);
  }

  if (data.costPrice !== undefined) {
    const parsedCost = parseFloat(data.costPrice);
    if (!Number.isFinite(parsedCost)) {
      throw new AppError('Invalid cost price', 400);
    }
    data.costPrice = parsedCost;
  }

  if (data.sellingPrice !== undefined) {
    const parsedSelling = parseFloat(data.sellingPrice);
    if (!Number.isFinite(parsedSelling)) {
      throw new AppError('Invalid selling price', 400);
    }
    data.sellingPrice = parsedSelling;
  }

  if (data.discountPrice !== undefined) {
    if (data.discountPrice === null || data.discountPrice === '') {
      data.discountPrice = null;
    } else {
      const parsedDiscount = parseFloat(data.discountPrice);
      if (!Number.isFinite(parsedDiscount)) {
        throw new AppError('Invalid discount price', 400);
      }
      data.discountPrice = parsedDiscount;
    }
  }

  if (data.stock !== undefined) {
    const parsedStock = parseInt(data.stock, 10);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      throw new AppError('Invalid stock value', 400);
    }
    data.stock = parsedStock;
  }

  if (data.lowStockAlert !== undefined) {
    const parsedLowStock = parseInt(data.lowStockAlert, 10);
    if (!Number.isFinite(parsedLowStock) || parsedLowStock < 0) {
      throw new AppError('Invalid low stock alert value', 400);
    }
    data.lowStockAlert = parsedLowStock;
  }

  if (data.weight !== undefined) {
    if (data.weight === null || data.weight === '') {
      data.weight = null;
    } else {
      const parsedWeight = parseFloat(data.weight);
      if (!Number.isFinite(parsedWeight) || parsedWeight < 0) {
        throw new AppError('Invalid weight value', 400);
      }
      data.weight = parsedWeight;
    }
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    data.isActive = data.isActive === 'true';
  }

  if (data.discountPrice !== undefined) {
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { sellingPrice: true }
    });
    const effectiveSellingPrice =
      data.sellingPrice !== undefined
        ? data.sellingPrice
        : currentProduct?.sellingPrice;
    if (
      data.discountPrice !== null &&
      effectiveSellingPrice !== undefined &&
      data.discountPrice > effectiveSellingPrice
    ) {
      throw new AppError('Discount price cannot exceed selling price', 400);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data
  });
  return product;
};

export const deleteProduct = async id => {
  await prisma.product.delete({ where: { id } });
};

export const adjustStock = async (productId, quantity, type, note) => {
  const parsedQty = parseInt(quantity, 10);
  if (!Number.isFinite(parsedQty) || parsedQty < 0) {
    throw new AppError('Invalid stock quantity', 400);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  let newStock;
  if (type === 'IN') {
    if (parsedQty === 0) throw new AppError('Quantity must be at least 1', 400);
    newStock = product.stock + parsedQty;
  } else if (type === 'OUT') {
    if (parsedQty === 0) throw new AppError('Quantity must be at least 1', 400);
    if (product.stock < parsedQty)
      throw new AppError('Insufficient stock', 400);
    newStock = product.stock - parsedQty;
  } else if (type === 'ADJUSTMENT') {
    // ADJUSTMENT — quantity is the new absolute value
    newStock = parsedQty;
  } else {
    throw new AppError('Invalid stock adjustment type', 400);
  }

  const [updatedProduct] = await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    }),
    prisma.inventoryLog.create({
      data: { productId, quantity: parsedQty, type, note }
    })
  ]);

  return updatedProduct;
};

export const getLowStockProducts = async () => {
  // Prisma doesn't support column-to-column comparison in where directly — filter in JS
  const allProducts = await prisma.product.findMany({
    where: { isActive: true }
  });
  return allProducts.filter(p => p.stock <= p.lowStockAlert);
};

export const getInventoryLogs = async productId => {
  return await prisma.inventoryLog.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true, images: true } }
    }
  });
};

export const getAllInventoryLogs = async (query = {}) => {
  const { page = 1, limit = 20, type } = query;
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {};
  if (type) where.type = type;

  const [logs, total] = await Promise.all([
    prisma.inventoryLog.findMany({
      skip,
      take: pageSize,
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.inventoryLog.count({ where })
  ]);

  return {
    logs,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize)
  };
};

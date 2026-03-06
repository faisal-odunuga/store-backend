import { z } from 'zod';

const numericField = label =>
  z.preprocess(val => {
    if (typeof val === 'string' && val.trim() !== '') return parseFloat(val);
    if (typeof val === 'number') return val;
    return undefined;
  }, z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` }).positive(`${label} must be greater than 0`));

const intField = label =>
  z.preprocess(
    val => {
      if (typeof val === 'string' && val.trim() !== '')
        return parseInt(val, 10);
      if (typeof val === 'number') return val;
      return 0;
    },
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .int()
      .min(0)
      .default(0)
  );

export const productSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name too long'),

  description: z
    .string()
    .trim()
    .max(500, 'Description too long')
    .optional(),

  sku: z
    .string({ required_error: 'SKU is required' })
    .trim()
    .min(1, 'SKU cannot be empty'),

  barcode: z
    .string()
    .trim()
    .optional(),

  costPrice: numericField('Cost price'),

  sellingPrice: numericField('Selling price'),

  discountPrice: z.preprocess(
    val => {
      if (typeof val === 'string' && val.trim() !== '') return parseFloat(val);
      if (typeof val === 'number') return val;
      return undefined;
    },
    z
      .number()
      .positive()
      .optional()
  ),

  stock: intField('Stock'),

  lowStockAlert: intField('Low stock alert'),

  weight: z.preprocess(
    val => {
      if (typeof val === 'string' && val.trim() !== '') return parseFloat(val);
      if (typeof val === 'number') return val;
      return undefined;
    },
    z
      .number()
      .positive()
      .optional()
  ),

  imageUrl: z
    .string()
    .trim()
    .url('Invalid image URL')
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, 'Category cannot be empty')
    .optional(),

  isActive: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().default(true))
});

export const adjustStockSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], { message: 'Invalid stock type' }),
  note: z.string().optional()
});

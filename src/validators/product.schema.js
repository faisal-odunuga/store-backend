import { z } from 'zod';

const productSchema = z
  .object({
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .nonempty('Product name cannot be empty')
      .min(2, 'Product name must be at least 2 characters long')
      .max(100, 'Product name too long'),

    description: z
      .string()
      .trim()
      .max(500, 'Description too long')
      .optional(),

    price: z.preprocess(
      val => {
        if (typeof val === 'string' && val.trim() !== '')
          return parseFloat(val);
        if (typeof val === 'number') return val;
        return undefined;
      },
      z
        .number({
          required_error: 'Price is required',
          invalid_type_error: 'Price must be a number'
        })
        .positive('Price must be greater than 0')
    ),

    stock: z.preprocess(
      val => {
        if (typeof val === 'string' && val.trim() !== '')
          return parseInt(val, 10);
        if (typeof val === 'number') return val;
        return 0;
      },
      z
        .number({ invalid_type_error: 'Stock must be a number' })
        .int('Stock must be an integer')
        .min(0, 'Stock cannot be negative')
        .default(0)
    ),

    imageUrl: z
      .string()
      .trim()
      .url('Invalid image URL')
      .optional(),

    category: z
      .string()
      .trim()
      .nonempty('Category cannot be empty')
      .optional()
  })
  .strict({ message: 'Unknown field(s) provided' });

export { productSchema };

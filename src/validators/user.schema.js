import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(50, 'Name too long')
      .optional(),

    phone: z
      .string()
      .trim()
      .max(15, 'Phone number too long')
      .optional()
      .or(z.literal(''))
  })
  .strict({ message: 'Unknown field(s) provided' });

export const updateUserRoleSchema = z
  .object({
    role: z.enum(['ADMIN', 'MANAGER', 'CUSTOMER'])
  })
  .strict();

export const addressSchema = z
  .object({
    street: z
      .string()
      .trim()
      .min(1, 'Street is required'),
    city: z
      .string()
      .trim()
      .min(1, 'City is required'),
    state: z
      .string()
      .trim()
      .optional(),
    postalCode: z
      .string()
      .trim()
      .min(1, 'Postal code is required'),
    country: z
      .string()
      .trim()
      .min(1, 'Country is required'),
    isDefault: z.boolean().optional()
  })
  .strict();

export const wishlistSchema = z
  .object({
    productId: z.string().uuid('Invalid product ID')
  })
  .strict();

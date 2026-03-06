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

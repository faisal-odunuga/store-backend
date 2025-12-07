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
      .regex(/^[0-9]{11}$/, 'Phone number must be 11 digits')
      .optional()
      .or(z.literal('')),

    address: z
      .string()
      .trim()
      .max(200, 'Address too long')
      .optional()
  })
  .strict({ message: 'Unknown field(s) provided' });

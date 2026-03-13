import { z } from 'zod';

export const createReviewSchema = z
  .object({
    productId: z.string().uuid({ message: 'Invalid product ID' }),
    rating: z
      .number()
      .int()
      .min(1)
      .max(5, { message: 'Rating must be between 1 and 5' }),
    comment: z
      .string()
      .trim()
      .max(500, { message: 'Comment too long' })
      .optional()
  })
  .strict();

export const updateReviewSchema = createReviewSchema
  .omit({ productId: true })
  .partial();

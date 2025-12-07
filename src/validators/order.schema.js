import { z } from 'zod';

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(
      ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      {
        message: 'Invalid order status'
      }
    )
  })
  .strict();

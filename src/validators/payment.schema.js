import { z } from 'zod';

export const initializePaymentSchema = z
  .object({
    orderId: z.string().uuid({ message: 'Invalid order ID' })
  })
  .strict();

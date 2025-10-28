import { z } from 'zod';

const addToCart = z.object({
  product: z.string().uuid(),
  quantity: z
    .number()
    .int()
    .positive()
    .default(1)
});

const updateQuantity = z.object({
  product: z.string().uuid(),
  quantity: z
    .number()
    .int()
    .positive()
    .default(1)
});

export { addToCart };

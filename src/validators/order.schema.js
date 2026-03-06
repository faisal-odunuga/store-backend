import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z
          .number()
          .int()
          .min(1, 'Quantity must be at least 1')
      })
    )
    .min(1, 'Order must have at least one item'),

  shippingAddress: z
    .string({ required_error: 'Shipping address is required' })
    .trim()
    .min(5, 'Shipping address must be at least 5 characters'),

  paymentMethod: z
    .string()
    .trim()
    .optional(),
  discountAmount: z
    .number()
    .min(0)
    .optional()
});

export const updateOrderStatusSchema = z
  .object({
    status: z
      .enum(
        [
          'PENDING',
          'PROCESSING',
          'SHIPPED',
          'DELIVERED',
          'CANCELLED',
          'REFUNDED'
        ],
        { message: 'Invalid order status' }
      )
      .optional(),
    paymentStatus: z
      .enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED'], {
        message: 'Invalid payment status'
      })
      .optional()
  })
  .strict();

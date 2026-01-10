import { z } from 'zod';

// =====================================================
// Products Validation Schemas
// =====================================================
export const getProductsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  sort: z.enum(['name', 'name_ar', 'created_at', 'price']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  category: z.string().optional(),
});

export const getProductByIdSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});

// =====================================================
// Coupon Validation Schemas
// =====================================================
export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50),
  cartSubtotal: z.number().min(0, 'Cart subtotal must be positive'),
});

// =====================================================
// Order Validation Schemas
// =====================================================
export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100),
  customerEmail: z.string().email('Invalid email format').optional().nullable(),
  couponCode: z.string().max(50).optional().nullable(),
  cartSubtotal: z.number().min(0).optional(),
});

export const trackOrderQuerySchema = z.object({
  orderNumber: z.string()
    .regex(/^IZ-\d{8}-[A-F0-9]{8}$/, 'Invalid order number format. Expected: IZ-YYYYMMDD-XXXXXXXX'),
  token: z.string().uuid('Invalid tracking token format'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled']),
});

export const orderNumberParamSchema = z.object({
  orderNumber: z.string()
    .regex(/^IZ-\d{8}-[A-F0-9]{8}$/, 'Invalid order number format'),
});

// =====================================================
// Type Exports
// =====================================================
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type GetProductByIdParams = z.infer<typeof getProductByIdSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type TrackOrderQuery = z.infer<typeof trackOrderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

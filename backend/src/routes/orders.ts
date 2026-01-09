import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';
import { asyncHandler, validate } from '../middleware/validation.js';
import { adminAuth } from '../middleware/auth.js';
import { orderLimiter, trackingLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import {
  createOrderSchema,
  trackOrderQuerySchema,
  updateOrderStatusSchema,
  orderNumberParamSchema,
  type CreateOrderInput,
  type TrackOrderQuery,
  type UpdateOrderStatusInput,
} from '../schemas/index.js';

const router = Router();

// =====================================================
// Helper: Generate Order Number
// Format: IZ-YYYYMMDD-XXXX (random 4 digits)
// =====================================================
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit random
  
  return `IZ-${year}${month}${day}-${random}`;
}

// =====================================================
// POST /orders
// Create a new order
// =====================================================
router.post(
  '/',
  orderLimiter,
  validate(createOrderSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const { customerName, customerEmail } = req.body as CreateOrderInput;

    const orderNumber = generateOrderNumber();
    const trackingToken = uuidv4();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail || null,
        tracking_token: trackingToken,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('order_number, tracking_token, status')
      .single();

    if (error) {
      console.error('Order creation error:', error);
      
      // Handle unique constraint violation (retry with new order number)
      if (error.code === '23505') {
        res.status(409).json({
          success: false,
          error: 'Order number conflict. Please try again.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create order',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        orderNumber: data.order_number,
        trackingToken: data.tracking_token,
        status: data.status,
      },
    });
  })
);

// =====================================================
// GET /orders/track (Public)
// Track order by order number and token
// =====================================================
router.get(
  '/track',
  trackingLimiter,
  validate(trackOrderQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const { orderNumber, token } = req.query as unknown as TrackOrderQuery;

    const { data, error } = await supabase
      .from('orders')
      .select('order_number, status, updated_at')
      .eq('order_number', orderNumber)
      .eq('tracking_token', token)
      .single();

    if (error || !data) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The order number or tracking token is incorrect.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        orderNumber: data.order_number,
        status: data.status,
        updatedAt: data.updated_at,
      },
    });
  })
);

// =====================================================
// PATCH /orders/admin/:orderNumber/status (Admin)
// Update order status (protected by admin secret)
// =====================================================
router.patch(
  '/admin/:orderNumber/status',
  strictLimiter,
  adminAuth,
  validate(orderNumberParamSchema, 'params'),
  validate(updateOrderStatusSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const { orderNumber } = req.params;
    const { status } = req.body as UpdateOrderStatusInput;

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)
      .select('order_number, status, updated_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      console.error('Order update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        orderNumber: data.order_number,
        status: data.status,
        updatedAt: data.updated_at,
      },
    });
  })
);

export default router;

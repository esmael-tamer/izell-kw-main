import { Router, Request, Response } from 'express';
import { supabase, type Coupon } from '../config/supabase.js';
import { asyncHandler, validate } from '../middleware/validation.js';
import { couponLimiter } from '../middleware/rateLimiter.js';
import { validateCouponSchema, type ValidateCouponInput } from '../schemas/index.js';

const router = Router();

// =====================================================
// POST /coupons/validate
// Validate a coupon code against cart subtotal
// =====================================================
router.post(
  '/validate',
  couponLimiter,
  validate(validateCouponSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const { code, cartSubtotal } = req.body as ValidateCouponInput;

    // Fetch coupon using service role (not exposed publicly)
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      res.json({
        success: true,
        data: {
          valid: false,
          reason: 'Invalid coupon code',
        },
      });
      return;
    }

    const couponData = coupon as Coupon;

    // Check if coupon is active (if column exists)
    if ('is_active' in couponData && couponData.is_active === false) {
      res.json({
        success: true,
        data: {
          valid: false,
          reason: 'This coupon is no longer active',
        },
      });
      return;
    }

    // Check expiration (if column exists)
    if ('expires_at' in couponData && couponData.expires_at) {
      const expiresAt = new Date(couponData.expires_at);
      if (expiresAt < new Date()) {
        res.json({
          success: true,
          data: {
            valid: false,
            reason: 'This coupon has expired',
          },
        });
        return;
      }
    }

    // Check minimum order amount
    if (couponData.min_order_amount && cartSubtotal < couponData.min_order_amount) {
      res.json({
        success: true,
        data: {
          valid: false,
          reason: `Minimum order amount is ${couponData.min_order_amount} KWD`,
          minOrderAmount: couponData.min_order_amount,
        },
      });
      return;
    }

    // Calculate discount
    let discountAmount: number;
    if (couponData.discount_type === 'percentage') {
      discountAmount = (cartSubtotal * couponData.discount_value) / 100;
    } else {
      // Fixed discount
      discountAmount = Math.min(couponData.discount_value, cartSubtotal);
    }

    // Round to 3 decimal places (KWD)
    discountAmount = Math.round(discountAmount * 1000) / 1000;
    const finalSubtotal = Math.round((cartSubtotal - discountAmount) * 1000) / 1000;

    res.json({
      success: true,
      data: {
        valid: true,
        discountType: couponData.discount_type,
        discountValue: couponData.discount_value,
        discountAmount,
        finalSubtotal: Math.max(0, finalSubtotal),
      },
    });
  })
);

export default router;

import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// =====================================================
// General Rate Limiter
// =====================================================
export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =====================================================
// Strict Rate Limiter (for sensitive endpoints)
// =====================================================
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many requests',
    message: 'This endpoint is rate limited. Please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =====================================================
// Order Creation Rate Limiter
// =====================================================
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 orders per minute per IP
  message: {
    success: false,
    error: 'Too many orders',
    message: 'Please wait before placing another order.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =====================================================
// Coupon Validation Rate Limiter
// =====================================================
export const couponLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 validations per minute
  message: {
    success: false,
    error: 'Too many coupon validations',
    message: 'Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =====================================================
// Tracking Rate Limiter
// =====================================================
export const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 tracking requests per minute
  message: {
    success: false,
    error: 'Too many tracking requests',
    message: 'Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

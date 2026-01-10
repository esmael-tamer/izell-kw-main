import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env.js';

// =====================================================
// Timing-Safe String Comparison
// Prevents timing attacks on secret comparison
// =====================================================
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Use a constant-time comparison even for length mismatch
    crypto.timingSafeEqual(Buffer.from('a'), Buffer.from('b'));
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

// =====================================================
// Admin Authentication Middleware
// =====================================================
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const adminSecret = req.headers['x-admin-secret'];

  if (!adminSecret || typeof adminSecret !== 'string') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or missing admin secret',
    });
    return;
  }

  if (!timingSafeEqual(adminSecret, env.adminSecret)) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or missing admin secret',
    });
    return;
  }

  next();
}

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

// =====================================================
// Admin Authentication Middleware
// =====================================================
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const adminSecret = req.headers['x-admin-secret'];
  
  if (!adminSecret || adminSecret !== env.adminSecret) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or missing admin secret',
    });
    return;
  }
  
  next();
}

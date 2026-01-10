import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/validation.js';

// Routes
import storeSettingsRouter from './routes/storeSettings.js';
import productsRouter from './routes/products.js';
import couponsRouter from './routes/coupons.js';
import ordersRouter from './routes/orders.js';

// =====================================================
// Express App Setup
// =====================================================
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// =====================================================
// HTTPS Enforcement (Production Only)
// =====================================================
if (env.isProduction) {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(301, `https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// =====================================================
// Security Middleware
// =====================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.isProduction ? [] : null,
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
}));

// CORS - Only allow frontend origin
app.use(cors({
  origin: env.frontendOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Secret'],
}));

// =====================================================
// General Middleware
// =====================================================
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request logging
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// General rate limiting
app.use(generalLimiter);

// =====================================================
// Health Check
// =====================================================
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// =====================================================
// API Routes
// =====================================================
app.use('/store-settings', storeSettingsRouter);
app.use('/products', productsRouter);
app.use('/coupons', couponsRouter);
app.use('/orders', ordersRouter);

// Convenience alias for tracking
app.get('/track', (req, res) => {
  // Redirect to orders/track with same query params
  res.redirect(307, `/orders/track?${new URLSearchParams(req.query as Record<string, string>).toString()}`);
});

// =====================================================
// Error Handling
// =====================================================
app.use(notFoundHandler);
app.use(errorHandler);

// =====================================================
// Start Server
// =====================================================
app.listen(env.port, () => {
  console.log('================================================');
  console.log(`🚀 IZELL KW Backend API`);
  console.log(`📍 Running on: http://localhost:${env.port}`);
  console.log(`🌍 Environment: ${env.nodeEnv}`);
  console.log(`🔗 Frontend Origin: ${env.frontendOrigin}`);
  console.log('================================================');
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /store-settings');
  console.log('  GET  /products');
  console.log('  GET  /products/:id');
  console.log('  POST /coupons/validate');
  console.log('  POST /orders');
  console.log('  GET  /orders/track');
  console.log('  GET  /track (alias)');
  console.log('  PATCH /orders/admin/:orderNumber/status');
  console.log('');
});

export default app;

import { z } from 'zod';

// =====================================================
// Environment Validation Schema
// =====================================================
const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_ORIGIN: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_SECRET: z.string().min(16),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
});

// =====================================================
// Validate and Export Config
// =====================================================
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  
  return parsed.data;
}

export const config = validateEnv();

export const env = {
  port: parseInt(config.PORT, 10),
  nodeEnv: config.NODE_ENV,
  isProduction: config.NODE_ENV === 'production',
  isDevelopment: config.NODE_ENV === 'development',
  frontendOrigin: config.FRONTEND_ORIGIN,
  supabase: {
    url: config.SUPABASE_URL,
    serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
  },
  adminSecret: config.ADMIN_SECRET,
  rateLimit: {
    windowMs: parseInt(config.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(config.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

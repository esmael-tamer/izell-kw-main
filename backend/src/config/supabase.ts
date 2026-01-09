import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// =====================================================
// Supabase Client (Service Role - Server-side only)
// =====================================================
export const supabase = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Type definitions for database tables
export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  price?: number;
  image?: string;
  category?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  tracking_token: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  is_active?: boolean;
  expires_at?: string | null;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  store_name_ar: string;
  tagline: string | null;
}

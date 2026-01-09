-- ============================================
-- Supabase Coupons Table Setup
-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/ozevppshaukbsomqqjrd/sql
-- ============================================

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 3) NOT NULL,
  min_order DECIMAL(10, 3),
  max_discount DECIMAL(10, 3),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public read coupons" ON coupons;
DROP POLICY IF EXISTS "Allow all coupons" ON coupons;

-- Simple policy: Allow all operations (for development)
CREATE POLICY "Allow all coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);

-- Create function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE coupons 
  SET used_count = used_count + 1 
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample coupons for testing
INSERT INTO coupons (code, type, value, min_order, is_active) VALUES
  ('SAVE10', 'percentage', 10, 5.000, true),
  ('FLAT5', 'fixed', 5.000, 15.000, true),
  ('WELCOME20', 'percentage', 20, 10.000, true)
ON CONFLICT (code) DO NOTHING;

-- Verify table creation
SELECT * FROM coupons;

-- =====================================================
-- IZELL KW - Order Tracking Migration
-- Run this in Supabase SQL Editor
-- =====================================================    
-- 1) Ensure pgcrypto extension exists for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Add tracking columns to orders table (safe - only if not exists)
DO $$ 
BEGIN
    -- Add tracking_token column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'tracking_token'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN tracking_token UUID DEFAULT gen_random_uuid();
    END IF;

    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add created_at column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'created_at'
    ) THEN
        -- Add the column without a default so existing rows remain NULL
        ALTER TABLE public.orders 
        ADD COLUMN created_at TIMESTAMPTZ;

        -- Then set the default so only new rows get the current timestamp
        ALTER TABLE public.orders 
        ALTER COLUMN created_at SET DEFAULT NOW();
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_tracking_token 
-- 3) Create indexes (safe - only if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number 
ON public.orders(order_number);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_token 
ON public.orders(tracking_token);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_updated_at 
ON public.orders(updated_at DESC);

-- 4) Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5) Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6) Add check constraint for valid status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'orders' 
        AND constraint_name = 'orders_status_check'
    ) THEN
        ALTER TABLE public.orders
        ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 7) Backfill existing orders with tracking tokens if null
UPDATE public.orders 
SET tracking_token = gen_random_uuid() 
WHERE tracking_token IS NULL;

-- 8) Backfill status for existing orders if null
UPDATE public.orders 
SET status = 'pending' 
WHERE status IS NULL;

-- =====================================================
-- VERIFICATION QUERY (run after migration)
-- =====================================================
-- SELECT 
--     column_name, 
--     data_type, 
--     column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' 
-- ORDER BY ordinal_position;

-- =============================================
-- REVIEWS TABLE FOR IZELL STORE
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON public.reviews
    FOR SELECT
    USING (status = 'approved');

-- Policy: Anyone can insert reviews (they will be pending by default)
CREATE POLICY "Anyone can create reviews" ON public.reviews
    FOR INSERT
    WITH CHECK (true);

-- Policy: Service role can do everything (for admin)
CREATE POLICY "Service role full access" ON public.reviews
    FOR ALL
    USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.reviews TO anon;
GRANT INSERT ON public.reviews TO anon;
GRANT SELECT ON public.reviews TO authenticated;
GRANT INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON public.reviews;
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Add some sample reviews (optional)
INSERT INTO public.reviews (product_id, customer_name, customer_email, rating, title, comment, verified_purchase, status)
VALUES
    ('a76a63b5-870d-47db-96c6-a18f8bee597b', 'فاطمة أحمد', 'fatima@example.com', 5, 'منتج رائع!', 'جودة ممتازة والتوصيل سريع. أنصح به بشدة', true, 'approved'),
    ('a76a63b5-870d-47db-96c6-a18f8bee597b', 'نورة محمد', 'noura@example.com', 4, 'جيد جداً', 'المنتج جميل والخامة ممتازة', true, 'approved'),
    ('a76a63b5-870d-47db-96c6-a18f8bee597b', 'سارة علي', 'sara@example.com', 5, 'أحببته كثيراً', 'تصميم أنيق وعصري', false, 'approved')
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE! Table created successfully
-- =============================================

-- إنشاء جدول الكوبونات (Create Coupons Table)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع بالكود (Create index for fast code search)
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- تفعيل Row Level Security (Enable RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع (للتحقق من الكوبون) - Public read access to active coupons
CREATE POLICY "Allow public read access to active coupons" ON coupons
    FOR SELECT
    USING (is_active = true);

-- سياسة الكتابة للمستخدمين المصرح لهم (الأدمن) - All operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON coupons
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- دالة لزيادة عدد استخدامات الكوبون (Function to increment coupon usage)
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE coupons
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- إضافة كوبونات تجريبية (Sample coupons)
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, is_active, valid_until) VALUES
    ('SAVE10', 'percentage', 10, 20, 100, true, NOW() + INTERVAL '30 days'),
    ('FLAT5', 'fixed', 5, 30, 50, true, NOW() + INTERVAL '60 days'),
    ('WELCOME20', 'percentage', 20, 50, 200, true, NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

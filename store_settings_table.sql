-- ============================================
-- جدول إعدادات المتجر - Store Settings Table
-- ============================================

-- إنشاء جدول store_settings
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- معلومات المتجر الأساسية
    store_name VARCHAR(100) DEFAULT 'izell',
    store_name_ar VARCHAR(100) DEFAULT 'آيزل',
    tagline VARCHAR(255) DEFAULT 'Your Fashion Destination',
    tagline_ar VARCHAR(255) DEFAULT 'وجهتك للأزياء',
    logo_url TEXT DEFAULT '',
    
    -- معلومات الاتصال
    email VARCHAR(255) DEFAULT 'info@izell.com',
    phone VARCHAR(50) DEFAULT '+965 1234 5678',
    whatsapp VARCHAR(50) DEFAULT '+96563330440',
    address TEXT DEFAULT 'Kuwait City, Kuwait',
    address_ar TEXT DEFAULT 'مدينة الكويت، الكويت',
    
    -- وسائل التواصل الاجتماعي
    instagram VARCHAR(255) DEFAULT '',
    facebook VARCHAR(255) DEFAULT '',
    twitter VARCHAR(255) DEFAULT '',
    tiktok VARCHAR(255) DEFAULT '',
    
    -- إعدادات الشحن
    free_shipping_threshold DECIMAL(10,3) DEFAULT 25.000,
    delivery_fee DECIMAL(10,3) DEFAULT 2.000,
    delivery_days VARCHAR(100) DEFAULT '2-3 business days',
    delivery_days_ar VARCHAR(100) DEFAULT '2-3 أيام عمل',
    
    -- العملة
    currency VARCHAR(10) DEFAULT 'KWD',
    currency_symbol VARCHAR(10) DEFAULT 'د.ك',
    
    -- ساعات العمل
    working_hours VARCHAR(100) DEFAULT 'Sun - Thu: 9AM - 9PM',
    working_hours_ar VARCHAR(100) DEFAULT 'الأحد - الخميس: 9ص - 9م',
    
    -- إعدادات أخرى
    announcement_text TEXT DEFAULT 'Free shipping on orders over 25 KWD!',
    announcement_text_ar TEXT DEFAULT 'شحن مجاني للطلبات فوق 25 د.ك!',
    show_announcement BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_store_settings_updated_at
    BEFORE UPDATE ON store_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_store_settings_updated_at();

-- تفعيل RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة الإعدادات للجميع
CREATE POLICY "Anyone can read store settings"
ON store_settings FOR SELECT
TO public
USING (true);

-- سياسة تعديل الإعدادات للمستخدمين المسجلين فقط
CREATE POLICY "Authenticated users can update store settings"
ON store_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- سياسة إنشاء الإعدادات للمستخدمين المسجلين فقط
CREATE POLICY "Authenticated users can insert store settings"
ON store_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- إدراج صف إعدادات افتراضي
INSERT INTO store_settings (
    store_name,
    store_name_ar,
    tagline,
    tagline_ar,
    email,
    phone,
    whatsapp,
    address,
    address_ar,
    free_shipping_threshold,
    delivery_fee,
    currency,
    currency_symbol,
    show_announcement,
    announcement_text,
    announcement_text_ar
) VALUES (
    'izell',
    'آيزل',
    'Your Fashion Destination',
    'وجهتك للأزياء',
    'info@izell.com',
    '+965 1234 5678',
    '+96512345678',
    'Kuwait City, Kuwait',
    'مدينة الكويت، الكويت',
    25.000,
    2.000,
    'KWD',
    'د.ك',
    true,
    'Free shipping on orders over 25 KWD!',
    'شحن مجاني للطلبات فوق 25 د.ك!'
);

-- ============================================
-- ملاحظة: قم بتنفيذ هذا الكود في Supabase SQL Editor
-- ============================================

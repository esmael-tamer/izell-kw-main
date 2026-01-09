-- ============================================
-- جداول Supabase لمتجر IZELL
-- انسخ هذا الكود في SQL Editor في Supabase
-- ============================================

-- 1. جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10,3) NOT NULL,
  original_price DECIMAL(10,3),
  image TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_sale BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  customer_area TEXT,
  customer_notes TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,3) NOT NULL,
  discount DECIMAL(10,3) DEFAULT 0,
  coupon_code TEXT,
  shipping DECIMAL(10,3) DEFAULT 2.000,
  total DECIMAL(10,3) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'knet',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الكوبونات
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,3) NOT NULL,
  min_order_amount DECIMAL(10,3) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول التصنيفات (Collections)
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  image TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول البانرات
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  subtitle TEXT,
  subtitle_ar TEXT,
  image TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- إضافة بيانات تجريبية
-- ============================================

-- كوبون ترحيبي 10%
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES ('WELCOME10', 'percentage', 10, 5.000, true)
ON CONFLICT (code) DO NOTHING;

-- كوبون خصم ثابت
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES ('SAVE5', 'fixed', 5.000, 20.000, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- تفعيل Row Level Security (RLS)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- ============================================
-- سياسات الوصول (Policies)
-- ============================================

-- المنتجات: الجميع يقرأ
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- المنتجات: المصادق فقط يكتب
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- الطلبات: المصادق فقط
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- الكوبونات: الجميع يقرأ، المصادق يكتب
CREATE POLICY "Coupons are viewable by everyone" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage coupons" ON coupons
  FOR ALL USING (auth.role() = 'authenticated');

-- التصنيفات: الجميع يقرأ
CREATE POLICY "Collections are viewable by everyone" ON collections
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage collections" ON collections
  FOR ALL USING (auth.role() = 'authenticated');

-- البانرات: الجميع يقرأ
CREATE POLICY "Banners are viewable by everyone" ON banners
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage banners" ON banners
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- دوال مساعدة
-- ============================================

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الدالة على الجداول
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لتوليد رقم الطلب تلقائياً
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 4));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- تم الانتهاء! ✅
-- ============================================

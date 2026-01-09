-- ============================================
-- إصلاح جدول الطلبات - Fix Orders Table
-- ============================================

-- حذف الجدول القديم إذا كان موجوداً (احذف هذا السطر إذا كان لديك بيانات مهمة)
-- DROP TABLE IF EXISTS orders;

-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) DEFAULT ('ORD-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
    
    -- بيانات العميل
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT,
    shipping_address TEXT NOT NULL,
    customer_city VARCHAR(100),
    customer_area VARCHAR(100),
    customer_notes TEXT,
    notes TEXT,
    
    -- بيانات الطلب
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,3) NOT NULL DEFAULT 0,
    discount DECIMAL(10,3) DEFAULT 0,
    coupon_code VARCHAR(50),
    shipping DECIMAL(10,3) DEFAULT 0,
    total DECIMAL(10,3) NOT NULL DEFAULT 0,
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('knet', 'visa', 'mastercard', 'applepay', 'cash', 'card')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    
    -- التواريخ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- تفعيل RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

-- سياسات الوصول الجديدة
CREATE POLICY "Anyone can read orders"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
ON orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- جدول المنتجات (إذا لم يكن موجوداً)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    price DECIMAL(10,3) NOT NULL,
    original_price DECIMAL(10,3),
    category VARCHAR(100),
    image TEXT,
    images JSONB DEFAULT '[]',
    sizes JSONB DEFAULT '["S", "M", "L", "XL"]',
    colors JSONB DEFAULT '["Black", "White"]',
    stock INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_sale BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS للمنتجات
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

CREATE POLICY "Anyone can read products"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage products"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- ملاحظة: قم بتنفيذ هذا الكود في Supabase SQL Editor
-- ============================================

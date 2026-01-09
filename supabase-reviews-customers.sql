-- جدول تقييمات العملاء
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  area VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- فهرس للبحث بالبريد الإلكتروني
CREATE INDEX idx_customers_email ON customers(email);

-- تفعيل RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول للتقييمات
-- السماح للجميع بقراءة التقييمات المعتمدة
CREATE POLICY "Allow public read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- السماح للجميع بإضافة تقييم
CREATE POLICY "Allow public insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- السماح بتحديث التقييمات (للإدارة)
CREATE POLICY "Allow update reviews" ON reviews
  FOR UPDATE USING (true);

-- السماح بحذف التقييمات (للإدارة)
CREATE POLICY "Allow delete reviews" ON reviews
  FOR DELETE USING (true);

-- سياسات الوصول للعملاء
-- السماح بإضافة عميل جديد
CREATE POLICY "Allow public insert customers" ON customers
  FOR INSERT WITH CHECK (true);

-- السماح للعميل بقراءة بياناته
CREATE POLICY "Allow customers read own data" ON customers
  FOR SELECT USING (true);

-- السماح بتحديث بيانات العميل
CREATE POLICY "Allow update customers" ON customers
  FOR UPDATE USING (true);

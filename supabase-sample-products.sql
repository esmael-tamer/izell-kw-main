-- ============================================
-- إضافة منتجات تجريبية لمتجر IZELL
-- انسخ هذا في Supabase SQL Editor
-- ============================================

INSERT INTO products (name, name_ar, description, description_ar, price, original_price, image, category, sizes, colors, stock, is_featured, is_new, is_sale)
VALUES 
-- فساتين سهرة
('Elegant Evening Dress', 'فستان سهرة أنيق', 'Beautiful evening dress with elegant design', 'فستان سهرة جميل بتصميم أنيق ومميز', 45.000, 65.000, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 'dresses', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Red', 'Navy'], 15, true, true, true),

('Classic Black Gown', 'فستان أسود كلاسيكي', 'Timeless black gown for special occasions', 'فستان أسود كلاسيكي للمناسبات الخاصة', 55.000, NULL, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', 'dresses', ARRAY['S', 'M', 'L'], ARRAY['Black'], 10, true, false, false),

('Floral Summer Dress', 'فستان صيفي زهري', 'Light and comfortable summer dress', 'فستان صيفي خفيف ومريح', 28.000, 35.000, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 'dresses', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Pink', 'Blue', 'White'], 20, false, true, true),

('Royal Blue Evening Dress', 'فستان سهرة أزرق ملكي', 'Stunning royal blue evening dress', 'فستان سهرة أزرق ملكي مذهل', 75.000, NULL, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400', 'dresses', ARRAY['S', 'M', 'L'], ARRAY['Blue'], 8, true, false, false),

-- فساتين زفاف
('Elegant Bridal Gown', 'فستان زفاف أنيق', 'Beautiful white bridal gown', 'فستان زفاف أبيض جميل', 250.000, 300.000, 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400', 'bridal', ARRAY['S', 'M', 'L'], ARRAY['White', 'Ivory'], 5, true, true, true),

('Princess Wedding Dress', 'فستان زفاف أميرة', 'Dreamy princess style wedding dress', 'فستان زفاف بستايل أميرة حالم', 320.000, NULL, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 'bridal', ARRAY['S', 'M', 'L', 'XL'], ARRAY['White'], 3, true, false, false),

('Modern Minimalist Bridal', 'فستان زفاف عصري', 'Sleek modern bridal dress', 'فستان زفاف عصري أنيق', 180.000, 220.000, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400', 'bridal', ARRAY['S', 'M', 'L'], ARRAY['White', 'Champagne'], 6, false, true, true),

-- ملابس كاجوال
('Casual Maxi Dress', 'فستان ماكسي كاجوال', 'Comfortable casual maxi dress', 'فستان ماكسي كاجوال مريح', 22.000, NULL, 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400', 'casual', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Beige', 'Black', 'Green'], 25, false, true, false),

('Summer Midi Dress', 'فستان ميدي صيفي', 'Perfect for summer outings', 'مثالي للخروج في الصيف', 18.500, 25.000, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', 'casual', ARRAY['S', 'M', 'L'], ARRAY['Yellow', 'Pink', 'White'], 30, false, false, true),

('Linen Casual Dress', 'فستان كتان كاجوال', 'Breathable linen dress for everyday', 'فستان كتان مريح للارتداء اليومي', 32.000, NULL, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400', 'casual', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Beige', 'Brown', 'White'], 18, true, false, false);

-- ============================================
-- تم إضافة 10 منتجات تجريبية! ✅
-- ============================================

import { supabase } from './supabase';
import { Product } from './types';

export interface SupabaseProduct {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  original_price?: number;
  category: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  is_sale: boolean;
  created_at?: string;
}

// تحويل من Supabase إلى النوع المحلي
export function convertToLocalProduct(p: SupabaseProduct): Product {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.name_ar,
    description: p.description || '',
    descriptionAr: p.description_ar || '',
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: p.category,
    image: p.image || '/placeholder.svg',
    images: p.images || [],
    sizes: p.sizes || ['S', 'M', 'L', 'XL'],
    colors: p.colors || ['Black', 'White'],
    inStock: (p.stock || 0) > 0,
    isNew: p.is_new || false,
    onSale: p.is_sale || false,
  };
}

// جلب جميع المنتجات
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return (data || []).map(convertToLocalProduct);
}

// جلب منتج واحد
export async function fetchProductById(id: string): Promise<Product | null> {
  // تحقق إذا كان ID هو UUID صالح
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUUID) {
    // إذا لم يكن UUID، لا تحاول جلبه من Supabase
    return null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data ? convertToLocalProduct(data) : null;
}

// جلب المنتجات المميزة
export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  return (data || []).map(convertToLocalProduct);
}

// جلب المنتجات الجديدة
export async function fetchNewProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .limit(8);

  if (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
  return (data || []).map(convertToLocalProduct);
}

// جلب منتجات التخفيضات
export async function fetchSaleProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_sale', true);

  if (error) {
    console.error('Error fetching sale products:', error);
    return [];
  }
  return (data || []).map(convertToLocalProduct);
}

// جلب منتجات حسب التصنيف
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
  return (data || []).map(convertToLocalProduct);
}

// إضافة منتج جديد
export async function createProduct(product: Omit<SupabaseProduct, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  return data as SupabaseProduct;
}

// تحديث منتج
export async function updateProduct(id: string, updates: Partial<SupabaseProduct>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  return data as SupabaseProduct;
}

// حذف منتج
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
  return true;
}

// رفع صورة
export async function uploadProductImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
}

// حذف صورة
export async function deleteProductImage(imageUrl: string) {
  const path = imageUrl.split('/images/')[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}

// البحث في المنتجات
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,name_en.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }
  return data as SupabaseProduct[];
}

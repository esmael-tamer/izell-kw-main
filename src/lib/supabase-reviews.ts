import { supabase } from './supabase';

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// جلب تقييمات منتج معين (المعتمدة فقط)
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data as Review[];
}

// جلب جميع التقييمات (للإدارة)
export async function fetchAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
  return data as Review[];
}

// إضافة تقييم جديد
export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'status'>): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ ...review, status: 'pending' }])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return null;
  }
  return data as Review;
}

// تحديث حالة التقييم
export async function updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating review status:', error);
    return false;
  }
  return true;
}

// حذف تقييم
export async function deleteReview(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting review:', error);
    return false;
  }
  return true;
}

// حساب متوسط التقييم
export async function getProductRating(productId: string): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: sum / data.length,
    count: data.length,
  };
}

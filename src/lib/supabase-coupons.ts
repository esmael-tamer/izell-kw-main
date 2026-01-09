import { supabase } from './supabase';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  current_uses?: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string | null;
  created_at?: string;
  updated_at?: string;
}

// جلب جميع الكوبونات
export async function fetchCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
  return data as Coupon[];
}

// جلب كوبون بالكود
export async function fetchCouponByCode(code: string) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error) {
    return null;
  }
  return data as Coupon;
}

// التحقق من صلاحية الكوبون
export async function validateCoupon(code: string, orderTotal: number): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  message?: string;
}> {
  const coupon = await fetchCouponByCode(code);

  if (!coupon) {
    return { valid: false, message: 'كود الخصم غير صحيح' };
  }

  // التحقق من انتهاء الصلاحية
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, message: 'انتهت صلاحية كود الخصم' };
  }

  // التحقق من عدد الاستخدامات
  if (coupon.max_uses && (coupon.current_uses || 0) >= coupon.max_uses) {
    return { valid: false, message: 'تم استنفاد كود الخصم' };
  }

  // التحقق من الحد الأدنى للطلب
  if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
    return { valid: false, message: `الحد الأدنى للطلب ${coupon.min_order_amount} د.ك` };
  }

  // حساب الخصم
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (orderTotal * coupon.discount_value) / 100;
  } else {
    discount = coupon.discount_value;
  }

  return { valid: true, coupon, discount };
}

// إنشاء كوبون جديد
export async function createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'current_uses'>) {
  const { data, error } = await supabase
    .from('coupons')
    .insert([{ ...coupon, code: coupon.code.toUpperCase(), current_uses: 0 }])
    .select()
    .single();

  if (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
  return data as Coupon;
}

// تحديث كوبون
export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  const { data, error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
  return data as Coupon;
}

// زيادة عداد الاستخدام
export async function incrementCouponUsage(id: string) {
  const { error } = await supabase.rpc('increment_coupon_usage', { coupon_id: id });

  if (error) {
    // Fallback if RPC doesn't exist
    const coupon = await supabase.from('coupons').select('current_uses').eq('id', id).single();
    if (coupon.data) {
      await supabase
        .from('coupons')
        .update({ current_uses: (coupon.data.current_uses || 0) + 1 })
        .eq('id', id);
    }
  }
}

// حذف كوبون
export async function deleteCoupon(id: string) {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
  return true;
}

// تفعيل/تعطيل كوبون
export async function toggleCouponStatus(id: string, is_active: boolean) {
  return updateCoupon(id, { is_active });
}

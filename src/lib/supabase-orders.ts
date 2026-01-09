import { supabase } from './supabase';

export interface OrderItem {
  product_id: string;
  name?: string;
  product_name?: string;
  image?: string;
  product_image?: string;
  price: number;
  quantity: number;
  size?: string;
  selected_size?: string;
  color?: string;
  selected_color?: string;
}

export interface SupabaseOrder {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address?: string;
  shipping_address: string;
  customer_city?: string;
  customer_area?: string;
  notes?: string;
  customer_notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  coupon_code?: string;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'knet' | 'visa' | 'mastercard' | 'applepay' | 'cash' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at?: string;
}

// جلب جميع الطلبات
export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data as SupabaseOrder[];
}

// جلب طلب واحد
export async function fetchOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data as SupabaseOrder;
}

// جلب طلبات حسب الحالة
export async function fetchOrdersByStatus(status: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders by status:', error);
    return [];
  }
  return data as SupabaseOrder[];
}

// إنشاء طلب جديد
export async function createOrder(order: Omit<SupabaseOrder, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  return data as SupabaseOrder;
}

// تحديث حالة الطلب
export async function updateOrderStatus(id: string, status: SupabaseOrder['status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  return data as SupabaseOrder;
}

// تحديث حالة الدفع
export async function updatePaymentStatus(id: string, payment_status: SupabaseOrder['payment_status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
  return data as SupabaseOrder;
}

// حذف طلب
export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
  return true;
}

// إحصائيات الطلبات
export async function getOrderStats() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*');

  if (error) {
    console.error('Error fetching order stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      todayRevenue: 0,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at?.startsWith(today));

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  };
}

// جلب طلبات العميل بالهاتف
export async function fetchOrdersByPhone(phone: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders by phone:', error);
    return [];
  }
  return data as SupabaseOrder[];
}

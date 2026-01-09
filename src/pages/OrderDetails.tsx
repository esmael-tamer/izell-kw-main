import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, User, MapPin, Phone, CreditCard, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_area: string;
  customer_notes: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  coupon_code: string;
  shipping: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

interface StoreSettings {
  store_name: string;
  store_name_ar: string;
  logo_url: string;
  whatsapp: string;
  phone: string;
}

export default function OrderDetails() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب تفاصيل الطلب
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber)
          .single();

        if (orderError) throw new Error('الطلب غير موجود');
        setOrder(orderData);

        // جلب إعدادات المتجر
        const { data: settingsData } = await supabase
          .from('store_settings')
          .select('store_name, store_name_ar, logo_url, whatsapp, phone')
          .single();

        if (settingsData) {
          setStoreSettings(settingsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchData();
    }
  }, [orderNumber]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      processing: 'جاري التحضير',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      knet: 'KNET',
      visa: 'Visa/Mastercard',
      mastercard: 'Visa/Mastercard',
      applepay: 'Apple Pay',
      cod: 'الدفع عند الاستلام',
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600 font-arabic">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2 font-arabic">الطلب غير موجود</h1>
          <p className="text-slate-600 font-arabic">{error || 'لم نتمكن من العثور على هذا الطلب'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-t-3xl p-6 text-center text-white">
          <img 
            src={storeSettings?.logo_url || 'https://ozevppshaukbsomqqjrd.supabase.co/storage/v1/object/public/store-assets/logo.png.jpeg'} 
            alt={storeSettings?.store_name_ar || 'IZELL'} 
            className="h-20 mx-auto mb-3 object-contain rounded-xl"
          />
          <h1 className="text-2xl font-bold font-arabic">
            {storeSettings?.store_name_ar || 'IZELL KUWAIT'}
          </h1>
          <p className="text-white/80 text-sm mt-1">فاتورة طلب</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white shadow-xl rounded-b-3xl overflow-hidden">
          {/* Order Number & Status */}
          <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-arabic">رقم الطلب</p>
              <p className="text-xl font-bold text-slate-900">#{order.order_number}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Date */}
          <div className="p-4 border-b flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">تاريخ الطلب</p>
              <p className="font-medium text-slate-900">
                {new Date(order.created_at).toLocaleDateString('ar-KW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 border-b space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 font-arabic">
              <User className="w-5 h-5 text-primary" />
              بيانات العميل
            </h3>
            <div className="grid gap-2 text-sm pr-7">
              <p><span className="text-slate-500">الاسم:</span> <span className="font-medium">{order.customer_name}</span></p>
              <p className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">الهاتف:</span> 
                <a href={`tel:${order.customer_phone}`} className="font-medium text-primary">{order.customer_phone}</a>
              </p>
              <p className="flex items-start gap-1">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="text-slate-500">العنوان:</span> 
                <span className="font-medium">{order.customer_address}</span>
              </p>
              {order.customer_notes && (
                <p><span className="text-slate-500">ملاحظات:</span> <span className="font-medium">{order.customer_notes}</span></p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="p-4 border-b">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 font-arabic">
              <Package className="w-5 h-5 text-primary" />
              المنتجات المطلوبة
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 bg-slate-50 rounded-xl p-3">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border shrink-0">
                    {item.product_image ? (
                      <img 
                        src={item.product_image} 
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{item.product_name}</h4>
                    <div className="mt-1 space-y-1 text-xs text-slate-500">
                      <p>الكمية: <span className="font-medium text-slate-700">{item.quantity}</span></p>
                      {item.selected_size && (
                        <p>المقاس: <span className="font-medium text-slate-700">{item.selected_size}</span></p>
                      )}
                      {item.selected_color && (
                        <p>اللون: <span className="font-medium text-slate-700">{item.selected_color}</span></p>
                      )}
                    </div>
                    <p className="mt-2 text-primary font-bold">
                      {(item.price * item.quantity).toFixed(3)} د.ك
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-4 border-b flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-slate-500">طريقة الدفع</p>
              <p className="font-medium text-slate-900">{getPaymentMethodText(order.payment_method)}</p>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="p-4 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-3 font-arabic">ملخص الفاتورة</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">المجموع الفرعي</span>
                <span className="font-medium">{order.subtotal.toFixed(3)} د.ك</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تكلفة الشحن</span>
                <span className="font-medium">{order.shipping.toFixed(3)} د.ك</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم {order.coupon_code && `(${order.coupon_code})`}</span>
                  <span className="font-medium">-{order.discount.toFixed(3)} د.ك</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-slate-900">المجموع الإجمالي</span>
                  <span className="font-bold text-primary">{order.total.toFixed(3)} د.ك</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-center border-t bg-white">
            <p className="text-sm text-slate-500 font-arabic">
              شكراً لتسوقك معنا! 💜
            </p>
            {storeSettings?.whatsapp && (
              <a 
                href={`https://wa.me/${storeSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                تواصل معنا
              </a>
            )}
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Powered by IZELL
        </p>
      </div>
    </div>
  );
}

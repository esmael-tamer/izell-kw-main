import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, User } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { SupabaseOrder } from '@/lib/supabase-orders';

const statusSteps = [
  { key: 'pending', icon: Clock, labelAr: 'في الانتظار', labelEn: 'Pending' },
  { key: 'confirmed', icon: CheckCircle, labelAr: 'تم التأكيد', labelEn: 'Confirmed' },
  { key: 'processing', icon: Package, labelAr: 'قيد التجهيز', labelEn: 'Processing' },
  { key: 'shipped', icon: Truck, labelAr: 'تم الشحن', labelEn: 'Shipped' },
  { key: 'delivered', icon: CheckCircle, labelAr: 'تم التوصيل', labelEn: 'Delivered' },
];

export default function TrackOrder() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<SupabaseOrder | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      // البحث برقم الطلب أو رقم الهاتف
      const cleanQuery = searchQuery.trim().toUpperCase();
      
      // محاولة البحث بـ ID الطلب
      let { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.%${cleanQuery}%,customer_phone.ilike.%${searchQuery.replace(/\D/g, '')}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !data) {
        // محاولة البحث برقم الهاتف فقط
        const phoneClean = searchQuery.replace(/\D/g, '');
        if (phoneClean.length >= 8) {
          const { data: phoneData } = await supabase
            .from('orders')
            .select('*')
            .ilike('customer_phone', `%${phoneClean}%`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (phoneData) {
            data = phoneData;
          }
        }
      }

      if (data) {
        setOrder(data as SupabaseOrder);
      } else {
        setError(isAr ? 'لم يتم العثور على الطلب' : 'Order not found');
      }
    } catch (err) {
      setError(isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'Error, please try again');
    }

    setIsLoading(false);
  };

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isAr ? 'ar-KW' : 'en-KW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Package size={32} className="text-primary" />
            </div>
            <h1 className="font-arabic text-3xl font-bold mb-2">
              {isAr ? 'تتبع طلبك' : 'Track Your Order'}
            </h1>
            <p className="text-muted-foreground font-arabic">
              {isAr ? 'أدخل رقم الطلب أو رقم الهاتف للتتبع' : 'Enter order number or phone to track'}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3 max-w-md mx-auto">
              <Input
                type="text"
                placeholder={isAr ? 'رقم الطلب أو الهاتف...' : 'Order # or Phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-arabic text-lg h-12"
              />
              <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-6">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={20} />
                )}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={32} className="text-red-500" />
              </div>
              <p className="font-arabic text-lg text-red-600">{error}</p>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-6 animate-fade-in">
              {/* Order Header */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {isAr ? 'رقم الطلب' : 'Order Number'}
                    </p>
                    <p className="font-mono text-xl font-bold text-primary">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground font-arabic">
                      {isAr ? 'تاريخ الطلب' : 'Order Date'}
                    </p>
                    <p className="font-arabic text-sm">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-arabic text-lg font-bold mb-6">
                  {isAr ? 'حالة الطلب' : 'Order Status'}
                </h2>

                {order.status === 'cancelled' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle size={32} className="text-red-500" />
                    </div>
                    <p className="font-arabic text-lg font-bold text-red-600">
                      {isAr ? 'تم إلغاء الطلب' : 'Order Cancelled'}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-slate-200 rounded-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (statusSteps.length - 1)) * 100 : 0}%`
                        }}
                      />
                    </div>

                    {/* Status Steps */}
                    <div className="relative flex justify-between">
                      {statusSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center z-10">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? 'bg-primary text-white shadow-lg'
                                  : 'bg-slate-100 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                            >
                              <Icon size={20} />
                            </div>
                            <p className={`font-arabic text-xs mt-2 text-center ${
                              isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                            }`}>
                              {isAr ? step.labelAr : step.labelEn}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-arabic text-lg font-bold mb-4">
                  {isAr ? 'معلومات التوصيل' : 'Delivery Info'}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <User size={18} />
                    <span className="font-arabic">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone size={18} />
                    <span dir="ltr">{order.customer_phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin size={18} className="mt-0.5 shrink-0" />
                    <span className="font-arabic">{order.shipping_address || order.customer_address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-arabic text-lg font-bold mb-4">
                  {isAr ? 'المنتجات' : 'Products'}
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                      {(item.image || item.product_image) && (
                        <img
                          src={item.image || item.product_image}
                          alt={item.name || item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-arabic text-sm font-medium truncate">
                          {item.name || item.product_name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.size || item.selected_size} / {item.color || item.selected_color}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            x{item.quantity}
                          </span>
                          <span className="font-price text-sm font-semibold text-primary">
                            {(item.price * item.quantity).toFixed(3)} {isAr ? 'د.ك' : 'KD'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-arabic text-muted-foreground">
                      {isAr ? 'المجموع الفرعي' : 'Subtotal'}
                    </span>
                    <span className="font-price">{order.subtotal.toFixed(3)} {isAr ? 'د.ك' : 'KD'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-arabic text-muted-foreground">
                      {isAr ? 'التوصيل' : 'Shipping'}
                    </span>
                    <span className="font-price">{order.shipping.toFixed(3)} {isAr ? 'د.ك' : 'KD'}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-arabic">
                        {isAr ? 'الخصم' : 'Discount'} {order.coupon_code && `(${order.coupon_code})`}
                      </span>
                      <span className="font-price">-{order.discount.toFixed(3)} {isAr ? 'د.ك' : 'KD'}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100">
                    <span className="font-arabic">{isAr ? 'الإجمالي' : 'Total'}</span>
                    <span className="font-price text-primary">{order.total.toFixed(3)} {isAr ? 'د.ك' : 'KD'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {isAr ? 'حالة الدفع' : 'Payment Status'}
                    </p>
                    <p className={`font-arabic font-bold ${
                      order.payment_status === 'paid' ? 'text-green-600' :
                      order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {order.payment_status === 'paid' ? (isAr ? 'تم الدفع' : 'Paid') :
                       order.payment_status === 'failed' ? (isAr ? 'فشل الدفع' : 'Failed') :
                       (isAr ? 'في الانتظار' : 'Pending')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground font-arabic">
                      {isAr ? 'طريقة الدفع' : 'Payment Method'}
                    </p>
                    <p className="font-arabic font-medium uppercase">
                      {order.payment_method}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

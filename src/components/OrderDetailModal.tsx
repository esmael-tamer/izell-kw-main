import { useState, useEffect } from 'react';
import { X, Package, MapPin, Phone, User, CreditCard, Calendar, Clock, Truck, Hash, Mail, FileText, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SupabaseOrder, OrderItem } from '@/lib/supabase-orders';

interface OrderDetailModalProps {
  order: SupabaseOrder;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      processing: { ar: 'قيد المعالجة', en: 'Processing' },
      shipped: { ar: 'تم الشحن', en: 'Shipped' },
      delivered: { ar: 'تم التسليم', en: 'Delivered' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' },
    };
    return statusMap[status]?.[isAr ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, { ar: string; en: string }> = {
      knet: { ar: 'كي-نت', en: 'KNET' },
      visa: { ar: 'فيزا', en: 'Visa' },
      mastercard: { ar: 'ماستركارد', en: 'Mastercard' },
      applepay: { ar: 'أبل باي', en: 'Apple Pay' },
      cash: { ar: 'نقداً', en: 'Cash' },
      card: { ar: 'بطاقة', en: 'Card' },
    };
    return methodMap[method]?.[isAr ? 'ar' : 'en'] || method;
  };

  // Helper to get item properties with fallbacks
  const getItemName = (item: OrderItem) => item.name || item.product_name || '';
  const getItemImage = (item: OrderItem) => item.image || item.product_image || '';
  const getItemSize = (item: OrderItem) => item.size || item.selected_size || '';
  const getItemColor = (item: OrderItem) => item.color || item.selected_color || '';

  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = order.shipping || 0;
  const discount = order.discount || 0;
  const address = order.shipping_address || order.customer_address || '';
  const notes = order.notes || order.customer_notes || '';
  const orderNumber = order.order_number || order.id.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Package size={24} />
              </div>
              <div>
              <h2 className="font-arabic text-xl font-bold">
                  {isAr ? 'تفاصيل الطلب' : 'Order Details'}
                </h2>
                <p className="font-display text-white/80 text-sm">#{orderNumber}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
          {/* Status & Date */}
          <div className="flex flex-wrap gap-4">
            <div className={`px-4 py-2 rounded-xl font-arabic font-bold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar size={18} />
              <span className="font-arabic">
                {new Date(order.created_at).toLocaleDateString(isAr ? 'ar-KW' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={18} />
              <span className="font-display">
                {new Date(order.created_at).toLocaleTimeString(isAr ? 'ar-KW' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-arabic font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              {isAr ? 'معلومات العميل' : 'Customer Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-slate-400" />
                <div>
                  <p className="font-arabic text-xs text-slate-500">{isAr ? 'الاسم' : 'Name'}</p>
                  <p className="font-arabic font-bold text-slate-900">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-slate-400" />
                <div>
                  <p className="font-arabic text-xs text-slate-500">{isAr ? 'الهاتف' : 'Phone'}</p>
                  <p className="font-display font-bold text-slate-900 dir-ltr">{order.customer_phone}</p>
                </div>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" />
                  <div>
                    <p className="font-arabic text-xs text-slate-500">{isAr ? 'البريد' : 'Email'}</p>
                    <p className="font-display text-slate-900">{order.customer_email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-slate-400" />
                <div>
                  <p className="font-arabic text-xs text-slate-500">{isAr ? 'العنوان' : 'Address'}</p>
                  <p className="font-arabic text-slate-900">{address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-arabic font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              {isAr ? 'المنتجات' : 'Items'} ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-4 flex items-center gap-4"
                >
                  {getItemImage(item) && (
                    <img 
                      src={getItemImage(item)} 
                      alt={getItemName(item)}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-arabic font-bold text-slate-900 truncate">
                      {getItemName(item)}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {getItemSize(item) && (
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-arabic">
                          {isAr ? 'المقاس:' : 'Size:'} {getItemSize(item)}
                        </span>
                      )}
                      {getItemColor(item) && (
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-arabic">
                          {isAr ? 'اللون:' : 'Color:'} {getItemColor(item)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-sm text-slate-500">x{item.quantity}</p>
                  </div>
                  <div className="text-end">
                    <p className="font-display font-bold text-slate-900">
                      {(item.price * item.quantity).toFixed(3)} {isAr ? 'د.ك' : 'KD'}
                    </p>
                    {item.quantity > 1 && (
                      <p className="font-display text-xs text-slate-500">
                        @ {item.price.toFixed(3)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-arabic font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              {isAr ? 'الدفع' : 'Payment'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="font-arabic text-xs text-slate-500">{isAr ? 'طريقة الدفع' : 'Method'}</p>
                <p className="font-arabic font-bold text-slate-900">
                  {getPaymentMethodText(order.payment_method)}
                </p>
              </div>
              <div>
                <p className="font-arabic text-xs text-slate-500">{isAr ? 'حالة الدفع' : 'Status'}</p>
                <p className={`font-arabic font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                  {order.payment_status === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'قيد الانتظار' : 'Pending')}
                </p>
              </div>
              {order.coupon_code && (
                <div>
                  <p className="font-arabic text-xs text-slate-500">{isAr ? 'كوبون الخصم' : 'Coupon'}</p>
                  <p className="font-display font-bold text-primary">{order.coupon_code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-primary/5 rounded-2xl p-5">
            <h3 className="font-arabic font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              {isAr ? 'ملخص الطلب' : 'Order Summary'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between font-arabic">
                <span className="text-slate-600">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-display font-bold">{subtotal.toFixed(3)} {isAr ? 'د.ك' : 'KD'}</span>
              </div>
              <div className="flex justify-between font-arabic">
                <span className="text-slate-600">{isAr ? 'الشحن' : 'Shipping'}</span>
                <span className="font-display font-bold text-green-600">
                  {shippingCost === 0 ? (isAr ? 'مجاني' : 'Free') : `${shippingCost.toFixed(3)} ${isAr ? 'د.ك' : 'KD'}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-arabic text-green-600">
                  <span>{isAr ? 'الخصم' : 'Discount'}</span>
                  <span className="font-display font-bold">-{discount.toFixed(3)} {isAr ? 'د.ك' : 'KD'}</span>
                </div>
              )}
              <hr className="border-slate-200" />
              <div className="flex justify-between font-arabic text-lg">
                <span className="font-bold">{isAr ? 'المجموع الكلي' : 'Total'}</span>
                <span className="font-display font-bold text-primary">{order.total.toFixed(3)} {isAr ? 'د.ك' : 'KD'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="bg-amber-50 rounded-2xl p-5">
              <h3 className="font-arabic font-bold text-amber-800 mb-2 flex items-center gap-2">
                <FileText size={20} />
                {isAr ? 'ملاحظات' : 'Notes'}
              </h3>
              <p className="font-arabic text-amber-700">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

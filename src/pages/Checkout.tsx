import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Tag, X, Check, ShoppingBag, MapPin, User, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { validateCoupon, incrementCouponUsage } from '@/lib/supabase-coupons';
import { createOrder } from '@/lib/supabase-orders';
import { executePayment, PAYMENT_METHOD_IDS } from '@/lib/payment';
import { supabase } from '@/lib/supabase';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; id: string } | null>(null);
  const [adminWhatsapp, setAdminWhatsapp] = useState('96563330440');

  // جلب رقم الواتساب من إعدادات المتجر
  useEffect(() => {
    const fetchWhatsapp = async () => {
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('whatsapp')
          .single();
        if (data?.whatsapp) {
          // تنظيف الرقم من أي رموز
          const cleanNumber = data.whatsapp.replace(/[^0-9]/g, '');
          setAdminWhatsapp(cleanNumber);
        }
      } catch (error) {
        console.log('Using default WhatsApp number');
      }
    };
    fetchWhatsapp();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '', // عنوان كامل في حقل واحد
    area: '',
    notes: '',
    paymentMethod: 'knet' as 'knet' | 'visa' | 'mastercard' | 'applepay',
  });

  const shipping = 2.000;
  const subtotal = total;
  const discount = appliedCoupon?.discount || 0;
  const finalTotal = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode, subtotal);
      
      if (result.valid && result.coupon && result.discount) {
        setAppliedCoupon({
          code: result.coupon.code,
          discount: result.discount,
          id: result.coupon.id,
        });
        toast({
          title: isAr ? 'تم تطبيق الخصم ✓' : 'Coupon Applied ✓',
          description: isAr ? `خصم ${result.discount.toFixed(3)} د.ك` : `${result.discount.toFixed(3)} KD discount`,
        });
      } else {
        toast({
          title: isAr ? 'كود غير صالح' : 'Invalid Code',
          description: result.message || (isAr ? 'الكود غير صحيح' : 'Invalid coupon code'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'حدث خطأ' : 'Error validating coupon',
        variant: 'destructive',
      });
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
    if (!formData.name.trim() || !formData.phone.trim() || !formData.area.trim() || !formData.address.trim()) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    // التحقق من رقم الهاتف (8 أرقام)
    const phoneClean = formData.phone.replace(/\D/g, '');
    if (phoneClean.length !== 8) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'رقم الهاتف يجب أن يكون 8 أرقام' : 'Phone must be 8 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.area} - ${formData.address}`;

      const order = await createOrder({
        customer_name: formData.name,
        customer_phone: `+965${phoneClean}`,
        customer_address: fullAddress,
        shipping_address: fullAddress,
        customer_area: formData.area,
        customer_notes: formData.notes,
        items: items.map(item => ({
          product_id: item.product.id,
          product_name: isAr ? item.product.nameAr : item.product.name,
          product_image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          selected_size: item.selectedSize,
          selected_color: item.selectedColor,
        })),
        subtotal,
        discount,
        coupon_code: appliedCoupon?.code,
        shipping,
        total: finalTotal,
        status: 'pending',
        payment_method: formData.paymentMethod,
        payment_status: 'pending',
      });

      if (appliedCoupon) {
        await incrementCouponUsage(appliedCoupon.id);
      }

      console.log('✅ Order created successfully:', order);
      
      // إرسال تفاصيل الطلب إلى الواتساب
      const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase();
      
      // رابط صفحة تفاصيل الطلب
      const orderDetailsUrl = `${window.location.origin}/order/${orderNumber}`;
      
      // تنسيق قائمة المنتجات (مختصرة)
      const itemsList = items.map((item, index) => 
        `${index + 1}. ${isAr ? item.product.nameAr : item.product.name} (×${item.quantity}) - ${(item.product.price * item.quantity).toFixed(3)} د.ك`
      ).join('\n');
      
      const paymentMethods: Record<string, string> = {
        'knet': 'KNET',
        'visa': 'Visa/Mastercard',
        'mastercard': 'Visa/Mastercard',
        'applepay': 'Apple Pay',
      };
      
      // رسالة العميل للمتجر
      const whatsappMessage = `السلام عليكم 👋

أود تأكيد طلبي من متجركم:

━━━━━━━━━━━━━━━━━━━━━

🆔 *رقم الطلب:* #${orderNumber}

👤 *الاسم:* ${formData.name}
📞 *الهاتف:* +965${phoneClean}
📍 *المنطقة:* ${formData.area}
🏠 *العنوان:* ${formData.address}
${formData.notes ? `📝 *ملاحظات:* ${formData.notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━

📦 *المنتجات المطلوبة:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━

💰 *المجموع الفرعي:* ${subtotal.toFixed(3)} د.ك
🚚 *التوصيل:* ${shipping.toFixed(3)} د.ك
${discount > 0 ? `🎁 *الخصم:* -${discount.toFixed(3)} د.ك\n` : ''}✨ *الإجمالي:* ${finalTotal.toFixed(3)} د.ك

💳 *طريقة الدفع المفضلة:* ${paymentMethods[formData.paymentMethod]}

━━━━━━━━━━━━━━━━━━━━━

📄 *رابط تفاصيل الطلب:*
${orderDetailsUrl}

━━━━━━━━━━━━━━━━━━━━━

أرجو إرسال رابط الدفع لإتمام الطلب ✅

شكراً لكم 🙏`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodedMessage}`;
      
      // فتح الواتساب في نافذة جديدة
      window.open(whatsappUrl, '_blank');
      
      setOrderId(orderNumber);
      setOrderSuccess(true);
      clearCart();
      
      toast({
        title: isAr ? 'تم إرسال طلبك! ✓' : 'Order Submitted! ✓',
        description: isAr ? 'تم فتح الواتساب - أرسل الرسالة لتأكيد طلبك' : 'WhatsApp opened - Send the message to confirm your order',
      });

    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'Error, please try again',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  // صفحة السلة الفارغة
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag size={40} className="text-primary" />
            </div>
            <h1 className="font-arabic text-2xl font-bold mb-4">
              {isAr ? 'سلة التسوق فارغة' : 'Your cart is empty'}
            </h1>
            <Link to="/shop">
              <Button size="lg" className="mt-4">
                {isAr ? 'تسوق الآن' : 'Shop Now'}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // صفحة نجاح الطلب
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={48} className="text-green-600" />
            </div>
            <h1 className="font-arabic text-3xl font-bold text-green-600 mb-2">
              {isAr ? 'تم إرسال طلبك بنجاح!' : 'Order Submitted!'}
            </h1>
            <p className="text-gray-600 mb-2 text-lg">
              {isAr ? 'رقم الطلب' : 'Order ID'}: <span className="font-bold text-primary">#{orderId}</span>
            </p>
            <p className="text-gray-500 mb-8">
              {isAr ? 'سنتواصل معك قريباً عبر الواتساب لتأكيد الطلب' : 'We will contact you soon via WhatsApp'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/">
                <Button variant="outline" size="lg">{isAr ? 'الرئيسية' : 'Home'}</Button>
              </Link>
              <Link to="/shop">
                <Button size="lg">{isAr ? 'متابعة التسوق' : 'Continue Shopping'}</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-1 py-6 md:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* العنوان */}
            <div className="text-center mb-8">
              <h1 className="font-arabic text-3xl font-bold mb-2">
                {isAr ? 'إتمام الطلب' : 'Checkout'}
              </h1>
              <p className="text-gray-500">
                {isAr ? 'أكمل بياناتك لإتمام الطلب كضيف' : 'Complete your details to checkout as guest'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-5 gap-6">
                {/* قسم البيانات */}
                <div className="lg:col-span-3 space-y-5">
                  {/* معلومات شخصية */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h2 className="font-arabic text-lg font-bold mb-4 flex items-center gap-2">
                      <User className="text-primary" size={20} />
                      {isAr ? 'بياناتك' : 'Your Info'}
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">{isAr ? 'الاسم' : 'Name'}</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={isAr ? 'اسمك الكريم' : 'Your name'}
                          className="mt-1.5 h-12 text-base"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">{isAr ? 'رقم الهاتف' : 'Phone'}</Label>
                        <div className="relative mt-1.5">
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                            placeholder="XXXXXXXX"
                            className="pl-16 h-12 text-base"
                            dir="ltr"
                            required
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r pr-2">
                            +965
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* عنوان التوصيل */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h2 className="font-arabic text-lg font-bold mb-4 flex items-center gap-2">
                      <MapPin className="text-primary" size={20} />
                      {isAr ? 'عنوان التوصيل' : 'Delivery Address'}
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">{isAr ? 'المنطقة' : 'Area'}</Label>
                        <Input
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          placeholder={isAr ? 'مثال: السالمية، حولي، الجهراء' : 'e.g. Salmiya, Hawally'}
                          className="mt-1.5 h-12 text-base"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">{isAr ? 'العنوان التفصيلي' : 'Full Address'}</Label>
                        <Textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder={isAr ? 'قطعة، شارع، منزل/عمارة، شقة...' : 'Block, Street, Building, Apartment...'}
                          className="mt-1.5 text-base resize-none"
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">{isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}</Label>
                        <Input
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder={isAr ? 'أي تعليمات إضافية للتوصيل' : 'Any delivery instructions'}
                          className="mt-1.5 h-12 text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* طريقة الدفع */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h2 className="font-arabic text-lg font-bold mb-4 flex items-center gap-2">
                      <CreditCard className="text-primary" size={20} />
                      {isAr ? 'طريقة الدفع' : 'Payment Method'}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* KNET */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'knet' })}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          formData.paymentMethod === 'knet' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`mx-auto mb-2 w-12 h-8 flex items-center justify-center rounded ${formData.paymentMethod === 'knet' ? 'text-primary' : 'text-gray-500'}`}>
                          <span className="font-bold text-lg">KNET</span>
                        </div>
                        <span className={`font-bold text-sm block ${formData.paymentMethod === 'knet' ? 'text-primary' : 'text-gray-600'}`}>
                          كي نت
                        </span>
                      </button>
                      
                      {/* Visa */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'visa' })}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          formData.paymentMethod === 'visa' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`mx-auto mb-2 w-12 h-8 flex items-center justify-center ${formData.paymentMethod === 'visa' ? 'text-blue-600' : 'text-gray-500'}`}>
                          <svg viewBox="0 0 48 48" className="w-10 h-10">
                            <path fill="currentColor" d="M32 10H16c-3.3 0-6 2.7-6 6v16c0 3.3 2.7 6 6 6h16c3.3 0 6-2.7 6-6V16c0-3.3-2.7-6-6-6z"/>
                            <path fill="white" d="M19.6 28l1.8-8.5h2.2l-1.8 8.5h-2.2zm9.4-8.3c-.4-.2-1.1-.4-2-.4-2.2 0-3.7 1.1-3.7 2.7 0 1.2 1.1 1.8 2 2.2.9.4 1.2.7 1.2 1 0 .6-.7.8-1.4.8-1 0-1.5-.1-2.3-.5l-.3-.2-.3 1.9c.6.3 1.6.5 2.7.5 2.3 0 3.9-1.1 3.9-2.8 0-.9-.6-1.7-1.9-2.3-.8-.4-1.3-.6-1.3-1 0-.3.4-.7 1.3-.7.7 0 1.3.2 1.7.3l.2.1.3-1.6zm5.4-.2h-1.7c-.5 0-.9.2-1.2.7l-3.3 7.8h2.3l.5-1.3h2.8c.1.3.3 1.3.3 1.3h2l-1.7-8.5zm-2.6 5.5l.9-2.4.2-.7.2.6.5 2.5h-1.8zM17.6 19.5l-2.1 5.8-.2-1.1c-.4-1.3-1.6-2.8-3-3.5l2 7.2h2.4l3.5-8.4h-2.6z"/>
                          </svg>
                        </div>
                        <span className={`font-bold text-sm block ${formData.paymentMethod === 'visa' ? 'text-primary' : 'text-gray-600'}`}>
                          Visa
                        </span>
                      </button>
                      
                      {/* Mastercard */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'mastercard' })}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          formData.paymentMethod === 'mastercard' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`mx-auto mb-2 w-12 h-8 flex items-center justify-center`}>
                          <svg viewBox="0 0 48 48" className="w-10 h-10">
                            <circle cx="19" cy="24" r="10" fill="#EB001B"/>
                            <circle cx="29" cy="24" r="10" fill="#F79E1B"/>
                            <path fill="#FF5F00" d="M24 17.5c1.9 1.7 3 4.1 3 6.5s-1.1 4.8-3 6.5c-1.9-1.7-3-4.1-3-6.5s1.1-4.8 3-6.5z"/>
                          </svg>
                        </div>
                        <span className={`font-bold text-sm block ${formData.paymentMethod === 'mastercard' ? 'text-primary' : 'text-gray-600'}`}>
                          Mastercard
                        </span>
                      </button>
                      
                      {/* Apple Pay */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'applepay' })}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          formData.paymentMethod === 'applepay' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`mx-auto mb-2 w-12 h-8 flex items-center justify-center ${formData.paymentMethod === 'applepay' ? 'text-black' : 'text-gray-500'}`}>
                          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                          </svg>
                        </div>
                        <span className={`font-bold text-sm block ${formData.paymentMethod === 'applepay' ? 'text-primary' : 'text-gray-600'}`}>
                          Apple Pay
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ملخص الطلب */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
                    <h3 className="font-arabic text-lg font-bold mb-4 flex items-center gap-2">
                      <ShoppingBag className="text-primary" size={20} />
                      {isAr ? 'ملخص الطلب' : 'Order Summary'}
                      <span className="text-sm font-normal text-gray-500">({items.length})</span>
                    </h3>

                    {/* المنتجات */}
                    <div className="space-y-3 max-h-52 overflow-y-auto mb-4 pr-1">
                      {items.map((item) => (
                        <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-arabic text-sm font-medium line-clamp-1">
                              {isAr ? item.product.nameAr : item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.selectedSize} • {item.selectedColor} • x{item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-primary text-sm whitespace-nowrap">
                            {(item.product.price * item.quantity).toFixed(3)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* كود الخصم */}
                    <div className="border-t pt-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={14} className="text-primary" />
                        <span className="font-arabic text-sm">{isAr ? 'كود خصم' : 'Coupon'}</span>
                      </div>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                          <div>
                            <span className="text-green-700 font-bold text-sm">{appliedCoupon.code}</span>
                            <span className="text-green-600 text-xs mr-2">(-{appliedCoupon.discount.toFixed(3)} د.ك)</span>
                          </div>
                          <button type="button" onClick={removeCoupon} className="text-red-500 hover:text-red-700" aria-label="Remove coupon">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder={isAr ? 'أدخل الكود' : 'Enter code'}
                            className="flex-1 text-sm h-10"
                          />
                          <Button 
                            type="button"
                            onClick={handleApplyCoupon} 
                            disabled={couponLoading} 
                            variant="outline"
                            size="sm"
                            className="h-10"
                          >
                            {couponLoading ? '...' : (isAr ? 'تطبيق' : 'Apply')}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* المجاميع */}
                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span>{subtotal.toFixed(3)} د.ك</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>{isAr ? 'الخصم' : 'Discount'}</span>
                          <span>-{discount.toFixed(3)} د.ك</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isAr ? 'التوصيل' : 'Delivery'}</span>
                        <span>{shipping.toFixed(3)} د.ك</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-3 border-t">
                        <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                        <span className="text-primary">{finalTotal.toFixed(3)} د.ك</span>
                      </div>
                    </div>

                    {/* زر إرسال الطلب */}
                    <Button 
                      type="submit" 
                      className="w-full mt-6 h-12 text-base font-bold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {isAr ? 'جاري الإرسال...' : 'Submitting...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Check size={20} />
                          {isAr ? 'تأكيد الطلب' : 'Confirm Order'}
                        </span>
                      )}
                    </Button>

                    {/* رابط العودة */}
                    <Link 
                      to="/cart" 
                      className="flex items-center justify-center gap-2 mt-4 text-gray-500 hover:text-primary transition-colors text-sm"
                    >
                      <ArrowRight size={16} className={isAr ? '' : 'rotate-180'} />
                      {isAr ? 'العودة للسلة' : 'Back to Cart'}
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

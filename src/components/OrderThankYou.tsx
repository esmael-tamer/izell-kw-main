import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Copy, Check, Package, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// =====================================================
// Types
// =====================================================

interface OrderThankYouProps {
  orderNumber: string;
  trackingToken: string;
  customerName?: string;
  customerEmail?: string;
}

// =====================================================
// Order Thank You Component
// =====================================================

export function OrderThankYou({
  orderNumber,
  trackingToken,
  customerName,
  customerEmail,
}: OrderThankYouProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate tracking URL
  const trackingUrl = `${window.location.origin}/track?orderNumber=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(trackingToken)}`;

  // Copy order number
  const copyOrderNumber = async () => {
    await navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  // Copy tracking link
  const copyTrackingLink = async () => {
    await navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center animate-bounce-once">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-green-400/20 animate-ping" />
          </div>

          {/* Title */}
          <h1 className="font-arabic text-2xl md:text-3xl font-bold text-green-700 mb-2">
            {isAr ? 'تم تأكيد طلبك بنجاح! 🎉' : 'Order Confirmed! 🎉'}
          </h1>
          <p className="text-muted-foreground font-arabic mb-6">
            {isAr 
              ? 'شكراً لك على طلبك. سنقوم بإعلامك عند شحن الطلب.'
              : 'Thank you for your order. We will notify you when it ships.'}
          </p>

          {/* Order Details Card */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-right">
            {/* Order Number */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-arabic text-sm text-muted-foreground">
                {isAr ? 'رقم الطلب' : 'Order Number'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-primary">
                  {orderNumber}
                </span>
                <button
                  onClick={copyOrderNumber}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                  title={isAr ? 'نسخ' : 'Copy'}
                >
                  {copiedOrder ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} className="text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Tracking Token */}
            <div className="mb-4">
              <span className="font-arabic text-sm text-muted-foreground block mb-1">
                {isAr ? 'رمز التتبع' : 'Tracking Token'}
              </span>
              <div className="bg-white rounded-lg p-3 border">
                <code className="text-xs break-all text-slate-600" dir="ltr">
                  {trackingToken}
                </code>
              </div>
              <p className="text-xs text-amber-600 mt-2 font-arabic">
                ⚠️ {isAr 
                  ? 'احتفظ بهذا الرمز لتتبع طلبك' 
                  : 'Keep this token to track your order'}
              </p>
            </div>

            {/* Customer Info */}
            {customerName && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-arabic text-sm">
                    {isAr ? 'اسم العميل:' : 'Customer:'} {customerName}
                  </span>
                </div>
                {customerEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <span className="font-arabic text-sm" dir="ltr">
                      {customerEmail}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tracking Link Section */}
          <div className="bg-primary/5 rounded-2xl p-4 mb-6">
            <p className="font-arabic text-sm font-medium mb-3">
              {isAr ? 'رابط تتبع الطلب:' : 'Order Tracking Link:'}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackingUrl}
                readOnly
                className="flex-1 text-xs bg-white rounded-lg px-3 py-2 border text-slate-600 truncate"
                dir="ltr"
                aria-label={isAr ? 'رابط تتبع الطلب' : 'Order tracking URL'}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyTrackingLink}
                className="shrink-0"
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link to={`/track?orderNumber=${orderNumber}&token=${trackingToken}`} className="block">
              <Button className="w-full h-12 font-arabic gap-2">
                <MapPin size={18} />
                {isAr ? 'تتبّع طلبك' : 'Track Your Order'}
              </Button>
            </Link>
            
            <Link to="/shop" className="block">
              <Button variant="outline" className="w-full h-12 font-arabic gap-2">
                <Package size={18} />
                {isAr ? 'تسوّق المزيد' : 'Continue Shopping'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted-foreground font-arabic">
            {isAr 
              ? 'سيتم إرسال تفاصيل الطلب إلى بريدك الإلكتروني إن وُجد'
              : 'Order details will be sent to your email if provided'}
          </p>
          <p className="text-xs text-muted-foreground font-arabic">
            {isAr 
              ? 'لأي استفسارات، تواصل معنا عبر واتساب'
              : 'For inquiries, contact us via WhatsApp'}
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Thank You Message Templates (for emails/SMS)
// =====================================================

export function generateThankYouMessage(
  orderNumber: string,
  trackingToken: string,
  language: 'ar' | 'en' = 'ar',
  baseUrl: string = window.location.origin
): string {
  const trackingUrl = `${baseUrl}/track?orderNumber=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(trackingToken)}`;

  if (language === 'ar') {
    return `
🎉 شكراً لطلبك من IZELL!

📦 رقم الطلب: ${orderNumber}

🔐 رمز التتبع: ${trackingToken}

🔗 رابط التتبع:
${trackingUrl}

احتفظ بهذه الرسالة لتتبع طلبك.

شكراً لثقتك بنا! 💜
فريق IZELL
    `.trim();
  }

  return `
🎉 Thank you for your order from IZELL!

📦 Order Number: ${orderNumber}

🔐 Tracking Token: ${trackingToken}

🔗 Tracking Link:
${trackingUrl}

Keep this message to track your order.

Thank you for shopping with us! 💜
IZELL Team
  `.trim();
}

// =====================================================
// Export Default
// =====================================================

export default OrderThankYou;

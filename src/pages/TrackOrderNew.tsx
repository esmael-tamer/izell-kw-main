import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, getStatusLabel, getStatusColor, type TrackOrderResult } from '@/lib/api';

// =====================================================
// Status Steps Configuration
// =====================================================
const statusSteps = [
  { key: 'pending', icon: Clock, labelAr: 'قيد التجهيز', labelEn: 'Pending' },
  { key: 'confirmed', icon: CheckCircle, labelAr: 'تم التأكيد', labelEn: 'Confirmed' },
  { key: 'processing', icon: Package, labelAr: 'قيد المعالجة', labelEn: 'Processing' },
  { key: 'shipped', icon: Truck, labelAr: 'تم الشحن', labelEn: 'Shipped' },
  { key: 'delivered', icon: CheckCircle, labelAr: 'تم التسليم', labelEn: 'Delivered' },
];

// =====================================================
// Track Order Page Component
// =====================================================
export default function TrackOrderPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams] = useSearchParams();
  
  // Form state
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingToken, setTrackingToken] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackOrderResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill from URL params
  useEffect(() => {
    const orderNumberParam = searchParams.get('orderNumber');
    const tokenParam = searchParams.get('token');
    
    if (orderNumberParam) {
      setOrderNumber(orderNumberParam);
    }
    if (tokenParam) {
      setTrackingToken(tokenParam);
    }
    
    // Auto-track if both params are present
    if (orderNumberParam && tokenParam) {
      handleTrack(orderNumberParam, tokenParam);
    }
  }, [searchParams]);

  // Handle track submission
  const handleTrack = async (overrideOrderNumber?: string, overrideToken?: string) => {
    const orderNum = overrideOrderNumber || orderNumber.trim();
    const token = overrideToken || trackingToken.trim();
    
    if (!orderNum || !token) {
      setError(isAr ? 'يرجى إدخال رقم الطلب ورمز التتبع' : 'Please enter order number and tracking token');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.trackOrder(orderNum, token);
      
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message || (isAr ? 'لم يتم العثور على الطلب' : 'Order not found'));
      }
    } catch (err) {
      setError(isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'Error occurred, please try again');
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack();
  };

  // Get current status index for progress display
  const getStatusIndex = (status: string) => {
    if (status === 'canceled') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  const currentStatusIndex = result ? getStatusIndex(result.status) : -1;

  // Format date
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

  // Copy tracking link
  const copyTrackingLink = () => {
    const link = `${window.location.origin}/track?orderNumber=${orderNumber}&token=${trackingToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Package size={32} className="text-primary" />
            </div>
            <h1 className="font-arabic text-3xl font-bold mb-2">
              {isAr ? 'تتبّع طلبك' : 'Track Your Order'}
            </h1>
            <p className="text-muted-foreground font-arabic">
              {isAr ? 'أدخل رقم الطلب ورمز التتبع' : 'Enter your order number and tracking token'}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium font-arabic">
                {isAr ? 'رقم الطلب' : 'Order Number'}
              </label>
              <Input
                type="text"
                placeholder={isAr ? 'مثال: IZ-20260107-1234' : 'e.g., IZ-20260107-1234'}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="font-mono text-base h-12"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium font-arabic">
                {isAr ? 'رمز التتبع' : 'Tracking Token'}
              </label>
              <Input
                type="text"
                placeholder={isAr ? 'الرمز المرسل إليك' : 'Token sent to you'}
                value={trackingToken}
                onChange={(e) => setTrackingToken(e.target.value)}
                className="font-mono text-sm h-12"
                dir="ltr"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              disabled={isLoading} 
              className="w-full h-12 font-arabic"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search size={20} className="mr-2" />
                  {isAr ? 'تتبّع الطلب' : 'Track Order'}
                </>
              )}
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="text-center py-8 px-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <p className="font-arabic text-lg text-red-600 font-medium">{error}</p>
              <p className="font-arabic text-sm text-red-500 mt-2">
                {isAr ? 'تأكد من صحة البيانات المدخلة' : 'Please verify your order details'}
              </p>
            </div>
          )}

          {/* Order Result */}
          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Order Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {isAr ? 'رقم الطلب' : 'Order Number'}
                    </p>
                    <p className="font-mono text-xl font-bold text-primary">
                      {result.orderNumber}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-arabic font-medium ${getStatusColor(result.status)}`}>
                    {getStatusLabel(result.status as any, isAr ? 'ar' : 'en')}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {isAr ? 'آخر تحديث' : 'Last Updated'}
                    </p>
                    <p className="font-arabic text-sm font-medium">
                      {formatDate(result.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTrackingLink}
                    className="gap-2"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {isAr ? (copied ? 'تم النسخ' : 'نسخ الرابط') : (copied ? 'Copied!' : 'Copy Link')}
                  </Button>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="font-arabic text-lg font-bold mb-6">
                  {isAr ? 'حالة الطلب' : 'Order Status'}
                </h2>

                {result.status === 'canceled' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle size={32} className="text-red-500" />
                    </div>
                    <p className="font-arabic text-lg font-bold text-red-600">
                      {isAr ? 'تم إلغاء الطلب' : 'Order Canceled'}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-slate-200 rounded-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
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
                            <p className={`font-arabic text-xs mt-2 text-center max-w-[60px] ${
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

              {/* Help Text */}
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground font-arabic">
                  {isAr 
                    ? 'لأي استفسار، تواصل معنا عبر واتساب' 
                    : 'For inquiries, contact us via WhatsApp'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

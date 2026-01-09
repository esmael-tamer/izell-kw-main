import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, ShoppingBag, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getPaymentStatus } from '@/lib/payment';
import { supabase } from '@/lib/supabase';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'pending';

const PaymentCallback = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get('paymentId');
      const orderId = searchParams.get('orderId');
      
      if (!paymentId) {
        setStatus('failed');
        setErrorMessage(isAr ? 'معرف الدفع غير موجود' : 'Payment ID not found');
        return;
      }

      try {
        // التحقق من حالة الدفع
        const paymentStatus = await getPaymentStatus(paymentId);
        
        if (paymentStatus?.Data.TransactionStatus === 'Succss' || 
            paymentStatus?.Data.InvoiceStatus === 'Paid') {
          
          // تحديث حالة الطلب في قاعدة البيانات
          if (orderId) {
            await supabase
              .from('orders')
              .update({ 
                payment_status: 'paid',
                status: 'confirmed',
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
          }
          
          setStatus('success');
          setOrderNumber(paymentStatus.Data.CustomerReference || orderId?.slice(0, 8).toUpperCase() || '');
        } else if (paymentStatus?.Data.InvoiceStatus === 'Pending') {
          setStatus('pending');
        } else {
          setStatus('failed');
          setErrorMessage(isAr ? 'فشل الدفع' : 'Payment failed');
          
          // تحديث حالة الدفع كفاشل
          if (orderId) {
            await supabase
              .from('orders')
              .update({ 
                payment_status: 'failed',
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setErrorMessage(isAr ? 'حدث خطأ في التحقق من الدفع' : 'Error verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams, isAr]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full">
          {status === 'loading' && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <Loader2 className="w-16 h-16 mx-auto text-amber-500 animate-spin mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isAr ? 'جاري التحقق من الدفع...' : 'Verifying payment...'}
              </h1>
              <p className="text-gray-500">
                {isAr ? 'يرجى الانتظار' : 'Please wait'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isAr ? 'تم الدفع بنجاح! 🎉' : 'Payment Successful! 🎉'}
              </h1>
              <p className="text-gray-500 mb-6">
                {isAr ? 'شكراً لك، تم استلام طلبك' : 'Thank you, your order has been received'}
              </p>
              
              {orderNumber && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-500 mb-1">
                    {isAr ? 'رقم الطلب' : 'Order Number'}
                  </p>
                  <p className="text-xl font-bold text-amber-600">#{orderNumber}</p>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to="/shop"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <ShoppingBag size={20} />
                  {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Home size={20} />
                  {isAr ? 'الصفحة الرئيسية' : 'Home'}
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isAr ? 'فشل الدفع' : 'Payment Failed'}
              </h1>
              <p className="text-gray-500 mb-6">
                {errorMessage || (isAr ? 'حدث خطأ أثناء معالجة الدفع' : 'An error occurred while processing payment')}
              </p>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <FileText size={20} />
                  {isAr ? 'المحاولة مرة أخرى' : 'Try Again'}
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Home size={20} />
                  {isAr ? 'الصفحة الرئيسية' : 'Home'}
                </Link>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-12 h-12 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isAr ? 'الدفع قيد المعالجة' : 'Payment Pending'}
              </h1>
              <p className="text-gray-500 mb-6">
                {isAr ? 'سيتم تأكيد طلبك قريباً' : 'Your order will be confirmed soon'}
              </p>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
              >
                <Home size={20} />
                {isAr ? 'الصفحة الرئيسية' : 'Home'}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCallback;

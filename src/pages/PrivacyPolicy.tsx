import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield size={32} className="text-primary" />
            </div>
            <h1 className="font-arabic text-3xl font-bold mb-2">
              {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            <p className="text-muted-foreground font-arabic">
              {isAr ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            {isAr ? (
              <>
                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">مقدمة</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    نحن في izel نلتزم بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام موقعنا الإلكتروني وخدماتنا.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">المعلومات التي نجمعها</h2>
                  <ul className="font-arabic text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>معلومات الاتصال (الاسم، رقم الهاتف، البريد الإلكتروني)</li>
                    <li>عنوان التوصيل</li>
                    <li>معلومات الطلب والمدفوعات</li>
                    <li>سجل التصفح والتفضيلات</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">كيف نستخدم معلوماتك</h2>
                  <ul className="font-arabic text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>معالجة وتنفيذ طلباتك</li>
                    <li>التواصل معك بشأن طلباتك</li>
                    <li>تحسين خدماتنا ومنتجاتنا</li>
                    <li>إرسال العروض والتحديثات (بموافقتك)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">حماية المعلومات</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    نستخدم تقنيات أمان متقدمة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الاستخدام أو الإفشاء. جميع معاملات الدفع مشفرة ومؤمنة.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">مشاركة المعلومات</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                  </p>
                  <ul className="font-arabic text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
                    <li>شركات التوصيل لإيصال طلباتك</li>
                    <li>بوابات الدفع لمعالجة المدفوعات</li>
                    <li>عند الاقتضاء القانوني</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">حقوقك</h2>
                  <ul className="font-arabic text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>الوصول إلى معلوماتك الشخصية</li>
                    <li>تصحيح أو تحديث معلوماتك</li>
                    <li>طلب حذف معلوماتك</li>
                    <li>إلغاء الاشتراك في الرسائل التسويقية</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">ملفات تعريف الارتباط (Cookies)</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">تواصل معنا</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    إذا كانت لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر:
                    <br />
                    البريد الإلكتروني: info@izel.kw
                    <br />
                    الهاتف: +965 9999 9999
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At izel, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">Information We Collect</h2>
                  <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>Contact information (name, phone number, email)</li>
                    <li>Delivery address</li>
                    <li>Order and payment information</li>
                    <li>Browsing history and preferences</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">How We Use Your Information</h2>
                  <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>Process and fulfill your orders</li>
                    <li>Communicate with you about your orders</li>
                    <li>Improve our services and products</li>
                    <li>Send offers and updates (with your consent)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">Information Protection</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use advanced security technologies to protect your personal information from unauthorized access, use, or disclosure. All payment transactions are encrypted and secured.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">Information Sharing</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We do not sell or share your personal information with third parties except in the following cases:
                  </p>
                  <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
                    <li>Delivery companies to deliver your orders</li>
                    <li>Payment gateways to process payments</li>
                    <li>When legally required</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">Your Rights</h2>
                  <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>Access your personal information</li>
                    <li>Correct or update your information</li>
                    <li>Request deletion of your information</li>
                    <li>Unsubscribe from marketing messages</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies to improve your experience on our website. You can control cookie settings through your browser.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about our Privacy Policy, please contact us at:
                    <br />
                    Email: info@izel.kw
                    <br />
                    Phone: +965 9999 9999
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

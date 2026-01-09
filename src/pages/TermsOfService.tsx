import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
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
              <FileText size={32} className="text-primary" />
            </div>
            <h1 className="font-arabic text-3xl font-bold mb-2">
              {isAr ? 'شروط الخدمة' : 'Terms of Service'}
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
                    مرحباً بك في izel. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل إجراء أي عملية شراء.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">الطلبات والدفع</h2>
                  <ul className="font-arabic text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>جميع الأسعار معروضة بالدينار الكويتي وتشمل الضرائب المطبقة</li>
                    <li>نقبل الدفع عبر KNET و Visa و Mastercard و Apple Pay</li>
                    <li>يتم تأكيد الطلب بعد إتمام عملية الدفع بنجاح</li>
                    <li>نحتفظ بحق رفض أو إلغاء أي طلب لأي سبب</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">التوصيل</h2>
                  <ul className="font-arabic text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>مدة التوصيل: من 10 إلى 20 يوم عمل (لا تشمل الجمعة والسبت)</li>
                    <li>رسوم التوصيل: 2.000 د.ك داخل الكويت</li>
                    <li>المنتجات مصنوعة حسب الطلب</li>
                    <li>يتم التواصل معك قبل التوصيل لتأكيد الموعد</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">سياسة الإرجاع والاستبدال</h2>
                  <ul className="font-arabic text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>يمكن إرجاع أو استبدال المنتجات خلال 7 أيام من استلام الطلب</li>
                    <li>يجب أن يكون المنتج في حالته الأصلية مع جميع العلامات</li>
                    <li>المنتجات المخصصة أو المعدلة حسب الطلب غير قابلة للإرجاع</li>
                    <li>يتحمل العميل تكلفة شحن الإرجاع</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">الاستبدال</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    في حالة وجود عيب في المنتج أو خطأ في الطلب، سيتم استبداله مجاناً. يرجى التواصل معنا خلال 48 ساعة من استلام الطلب مع صور توضح المشكلة.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">الضمان</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    نضمن جودة منتجاتنا ضد عيوب التصنيع لمدة 30 يوماً من تاريخ الاستلام. لا يشمل الضمان الأضرار الناتجة عن سوء الاستخدام أو الغسيل غير الصحيح.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">حقوق الملكية الفكرية</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    جميع المحتويات على هذا الموقع، بما في ذلك الصور والتصاميم والشعارات، هي ملك لـ izel ومحمية بموجب قوانين الملكية الفكرية.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">تحديد المسؤولية</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    لن نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية أو تبعية ناتجة عن استخدام منتجاتنا أو خدماتنا.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">التعديلات</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    نحتفظ بحق تعديل هذه الشروط في أي وقت. ستكون التعديلات سارية فور نشرها على الموقع.
                  </p>
                </section>

                <section>
                  <h2 className="font-arabic text-xl font-bold mb-4 text-primary">تواصل معنا</h2>
                  <p className="font-arabic text-muted-foreground leading-relaxed">
                    لأي استفسارات أو شكاوى، يرجى التواصل معنا:
                    <br />
                    البريد الإلكتروني: info@izel.kw
                    <br />
                    الهاتف: +965 9999 9999
                    <br />
                    واتساب: +965 6333 0440
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to izel. By using our website and services, you agree to comply with these terms and conditions. Please read them carefully before making any purchase.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Orders and Payment</h2>
                  <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>All prices are displayed in Kuwaiti Dinar and include applicable taxes</li>
                    <li>We accept payment via KNET, Visa, Mastercard, and Apple Pay</li>
                    <li>Order is confirmed after successful payment completion</li>
                    <li>We reserve the right to refuse or cancel any order for any reason</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Delivery</h2>
                  <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>Delivery time: 10 to 20 business days (excluding Friday and Saturday)</li>
                    <li>Delivery fee: 2.000 KD within Kuwait</li>
                    <li>Products are made to order</li>
                    <li>We will contact you before delivery to confirm the appointment</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Return and Exchange Policy</h2>
                  <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                    <li>Products can be returned or exchanged within 7 days of receiving the order</li>
                    <li>Product must be in original condition with all tags</li>
                    <li>Customized or modified products are non-returnable</li>
                    <li>Customer bears the return shipping cost</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Exchange</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    In case of product defect or order error, it will be exchanged free of charge. Please contact us within 48 hours of receiving the order with photos showing the issue.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Warranty</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We guarantee our products against manufacturing defects for 30 days from the date of receipt. Warranty does not cover damage resulting from misuse or improper washing.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Intellectual Property Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content on this website, including images, designs, and logos, are the property of izel and protected under intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We will not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Modifications</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. Modifications will be effective immediately upon posting on the website.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4 text-primary">Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For any inquiries or complaints, please contact us:
                    <br />
                    Email: info@izel.kw
                    <br />
                    Phone: +965 9999 9999
                    <br />
                    WhatsApp: +965 6333 0440
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

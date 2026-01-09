import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

export function HeroSection() {
  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="izel collection"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-foreground/50 via-foreground/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-lg mr-auto text-right animate-fade-up">
          <span className="font-arabic text-gold-light text-sm tracking-widest mb-4 block">
            مجموعة 2024
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-tight">
            أناقة تليق<br />بالملكات
          </h1>
          <p className="font-arabic text-primary-foreground/90 text-lg mb-8 leading-relaxed">
            اكتشفي مجموعتنا الحصرية من الدراريع الفاخرة المصممة بأيدي أمهر الحرفيين.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded font-arabic font-medium hover:bg-primary/90 transition-all duration-300 hover:gap-4 shadow-elegant"
          >
            <span>تسوقي الآن</span>
            <ArrowLeft size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useTranslation } from 'react-i18next';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

interface Testimonial {
  id: number;
  name: string;
  nameEn: string;
  rating: number;
  comment: string;
  commentEn: string;
  date: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'فاطمة الصباح',
    nameEn: 'Fatima Al-Sabah',
    rating: 5,
    comment: 'تجربة تسوق رائعة! الملابس بجودة عالية جداً والتوصيل سريع. أنصح الجميع بالتسوق من هنا.',
    commentEn: 'Amazing shopping experience! High quality clothes and fast delivery. I recommend everyone to shop here.',
    date: '2025-12-15',
  },
  {
    id: 2,
    name: 'نورة العلي',
    nameEn: 'Noura Al-Ali',
    rating: 5,
    comment: 'أحببت التصاميم العصرية والأنيقة. خدمة العملاء ممتازة ومتعاونين جداً.',
    commentEn: 'I loved the modern and elegant designs. Excellent and very helpful customer service.',
    date: '2025-12-10',
  },
  {
    id: 3,
    name: 'سارة المطيري',
    nameEn: 'Sara Al-Mutairi',
    rating: 5,
    comment: 'الأقمشة فاخرة والمقاسات دقيقة. هذا المتجر المفضل لدي للأزياء النسائية.',
    commentEn: 'Luxurious fabrics and accurate sizes. This is my favorite store for women\'s fashion.',
    date: '2025-12-05',
  },
  {
    id: 4,
    name: 'هند الراشد',
    nameEn: 'Hind Al-Rashid',
    rating: 5,
    comment: 'سعيدة جداً بمشترياتي. التغليف أنيق والمنتجات تطابق الصور تماماً.',
    commentEn: 'Very happy with my purchases. Elegant packaging and products exactly match the photos.',
    date: '2025-11-28',
  },
  {
    id: 5,
    name: 'دانة الخالد',
    nameEn: 'Dana Al-Khaled',
    rating: 5,
    comment: 'أسعار مناسبة وجودة ممتازة. سأعود للتسوق مرة أخرى بالتأكيد.',
    commentEn: 'Reasonable prices and excellent quality. I will definitely shop again.',
    date: '2025-11-20',
  },
  {
    id: 6,
    name: 'لطيفة الهاجري',
    nameEn: 'Latifa Al-Hajri',
    rating: 5,
    comment: 'خيارات متنوعة ومميزة. وجدت كل ما أبحث عنه في مكان واحد.',
    commentEn: 'Diverse and distinctive options. I found everything I was looking for in one place.',
    date: '2025-11-15',
  },
];

export function CustomerTestimonials() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-arabic text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isArabic ? 'آراء عميلاتنا' : 'Customer Reviews'}
          </h2>
          <p className="font-arabic text-muted-foreground max-w-2xl mx-auto">
            {isArabic
              ? 'نفخر بثقة عميلاتنا الكريمات ونسعى دائماً لتقديم أفضل تجربة تسوق'
              : 'We are proud of our valued customers\' trust and always strive to provide the best shopping experience'}
          </p>
        </div>

        {/* Testimonials Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
            direction: isArabic ? 'rtl' : 'ltr',
          }}
          plugins={[plugin.current]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full bg-card border-border/50 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Quote className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex justify-center gap-1 mb-4">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Comment */}
                    <p className="font-arabic text-foreground text-center leading-relaxed mb-6 min-h-[80px]">
                      "{isArabic ? testimonial.comment : testimonial.commentEn}"
                    </p>

                    {/* Customer Info */}
                    <div className="text-center border-t border-border/50 pt-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                        <span className="font-arabic text-primary font-bold text-lg">
                          {(isArabic ? testimonial.name : testimonial.nameEn).charAt(0)}
                        </span>
                      </div>
                      <h4 className="font-arabic font-semibold text-foreground">
                        {isArabic ? testimonial.name : testimonial.nameEn}
                      </h4>
                      <p className="font-arabic text-sm text-muted-foreground">
                        {formatDate(testimonial.date)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-primary">500+</div>
            <p className="font-arabic text-sm text-muted-foreground mt-1">
              {isArabic ? 'عميلة سعيدة' : 'Happy Customers'}
            </p>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-primary">4.9</div>
            <p className="font-arabic text-sm text-muted-foreground mt-1">
              {isArabic ? 'تقييم العملاء' : 'Customer Rating'}
            </p>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-primary">98%</div>
            <p className="font-arabic text-sm text-muted-foreground mt-1">
              {isArabic ? 'نسبة الرضا' : 'Satisfaction Rate'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

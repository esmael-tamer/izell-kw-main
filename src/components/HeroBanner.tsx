import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadBanners } from '@/lib/banners';

export interface Banner {
    id: string;
    type: 'image' | 'video';
    src: string;
    titleAr: string;
    titleEn: string;
    subtitleAr?: string;
    subtitleEn?: string;
    ctaTextAr?: string;
    ctaTextEn?: string;
    ctaLink?: string;
}

interface HeroBannerProps {
    banners?: Banner[];
}

export function HeroBanner({ banners: propBanners }: HeroBannerProps) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [banners, setBanners] = useState<Banner[]>(propBanners || loadBanners());

    // تحديث البانرات عند تغييرها في CMS
    useEffect(() => {
        if (!propBanners) {
            const handleBannersUpdate = () => {
                setBanners(loadBanners());
            };
            window.addEventListener('bannersUpdated', handleBannersUpdate);
            const interval = setInterval(() => {
                setBanners(loadBanners());
            }, 1000);
            return () => {
                window.removeEventListener('bannersUpdated', handleBannersUpdate);
                clearInterval(interval);
            };
        }
    }, [propBanners]);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Auto-advance every 5 seconds

        return () => clearInterval(interval);
    }, [banners.length]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (banners.length === 0) return null;

    const currentBanner = banners[currentIndex];
    const isArabic = i18n.language === 'ar';

    return (
        <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-muted">
            {/* Banner Content */}
            <div className="relative w-full h-full">
                {currentBanner.type === 'video' ? (
                    <video
                        key={currentBanner.id}
                        src={currentBanner.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        key={currentBanner.id}
                        src={currentBanner.src}
                        alt={isArabic ? currentBanner.titleAr : currentBanner.titleEn}
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Text Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 max-w-4xl">
                        <h2 className="font-display text-4xl md:text-7xl lg:text-8xl text-white mb-6 animate-fade-up leading-tight drop-shadow-lg">
                            {isArabic ? currentBanner.titleAr : currentBanner.titleEn}
                        </h2>
                        {(currentBanner.subtitleAr || currentBanner.subtitleEn) && (
                            <p className="font-arabic text-lg md:text-2xl text-white/95 mb-10 animate-fade-up max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
                                {isArabic ? currentBanner.subtitleAr : currentBanner.subtitleEn}
                            </p>
                        )}
                        {currentBanner.ctaLink && (currentBanner.ctaTextAr || currentBanner.ctaTextEn) && (
                            <Button
                                size="lg"
                                className="animate-fade-up bg-primary hover:bg-primary/90 text-primary-foreground font-arabic text-xl px-12 py-8 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
                                style={{ animationDelay: '0.4s' }}
                                onClick={() => navigate(currentBanner.ctaLink!)}
                            >
                                {isArabic ? currentBanner.ctaTextAr : currentBanner.ctaTextEn}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-4 rounded-full transition-all border border-white/20 hidden md:block"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all border border-white/20 hidden md:block"
                        aria-label="Next banner"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {banners.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-primary w-10 shadow-lg'
                                : 'bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

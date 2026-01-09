import { Banner } from '@/components/HeroBanner';

export interface BannersData {
    banners: Banner[];
}

// البانرات الافتراضية
export const defaultBanners: Banner[] = [
    {
        id: '1',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
        titleAr: 'المجموعة الجديدة 2024',
        titleEn: 'New Collection 2024',
        subtitleAr: 'اكتشفي أحدث تصاميم الدراريع الفاخرة',
        subtitleEn: 'Discover the latest luxury dress designs',
        ctaTextAr: 'تسوقي الآن',
        ctaTextEn: 'Shop Now',
        ctaLink: '/shop',
    },
    {
        id: '2',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1920&h=1080&fit=crop',
        titleAr: 'عروض خاصة',
        titleEn: 'Special Offers',
        subtitleAr: 'خصم يصل إلى 30% على مجموعة مختارة',
        subtitleEn: 'Up to 30% off on selected items',
        ctaTextAr: 'اكتشفي العروض',
        ctaTextEn: 'Discover Offers',
        ctaLink: '/shop',
    },
    {
        id: '3',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1920&h=1080&fit=crop',
        titleAr: 'مجموعة العروس',
        titleEn: 'Bridal Collection',
        subtitleAr: 'تصاميم فاخرة ليوم زفافك المميز',
        subtitleEn: 'Luxurious designs for your special day',
        ctaTextAr: 'استكشفي المجموعة',
        ctaTextEn: 'Explore Collection',
        ctaLink: '/shop?category=bridal',
    },
];

// البانرات الأصلية للتوافق
export const banners: Banner[] = defaultBanners;

// حفظ البانرات في localStorage
export const saveBanners = (bannersData: Banner[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('banners', JSON.stringify(bannersData));
        window.dispatchEvent(new Event('bannersUpdated'));
    }
};

// تحميل البانرات من localStorage
export const loadBanners = (): Banner[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('banners');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return defaultBanners;
            }
        }
    }
    return defaultBanners;
};

// إضافة بانر جديد
export const addBanner = (banner: Omit<Banner, 'id'>): Banner => {
    const banners = loadBanners();
    const newBanner: Banner = {
        ...banner,
        id: Date.now().toString(),
    };
    banners.push(newBanner);
    saveBanners(banners);
    return newBanner;
};

// تحديث بانر
export const updateBanner = (id: string, updates: Partial<Banner>) => {
    const banners = loadBanners();
    const index = banners.findIndex(b => b.id === id);
    if (index !== -1) {
        banners[index] = { ...banners[index], ...updates };
        saveBanners(banners);
    }
};

// حذف بانر
export const deleteBanner = (id: string) => {
    const banners = loadBanners();
    const filtered = banners.filter(b => b.id !== id);
    saveBanners(filtered);
};

// إعادة ترتيب البانرات
export const reorderBanners = (bannerId: string, direction: 'up' | 'down') => {
    const banners = loadBanners();
    const index = banners.findIndex(b => b.id === bannerId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
        [banners[index], banners[index - 1]] = [banners[index - 1], banners[index]];
    } else if (direction === 'down' && index < banners.length - 1) {
        [banners[index], banners[index + 1]] = [banners[index + 1], banners[index]];
    }

    saveBanners(banners);
};

// إعادة تعيين البانرات للافتراضي
export const resetBanners = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('banners');
        window.dispatchEvent(new Event('bannersUpdated'));
    }
    return defaultBanners;
};

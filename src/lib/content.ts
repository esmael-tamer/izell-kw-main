// Content Management System - محتوى الموقع القابل للتعديل
import { supabase } from './supabase';

export interface HomeContent {
    announcement: {
        text: string;
        textAr: string;
        enabled: boolean;
    };
    hero: {
        title: string;
        titleAr: string;
        subtitle: string;
        subtitleAr: string;
        buttonText: string;
        buttonTextAr: string;
        backgroundImage: string;
    };
    features: {
        feature1: {
            title: string;
            titleAr: string;
            description: string;
            descriptionAr: string;
            icon: string;
        };
        feature2: {
            title: string;
            titleAr: string;
            description: string;
            descriptionAr: string;
            icon: string;
        };
        feature3: {
            title: string;
            titleAr: string;
            description: string;
            descriptionAr: string;
            icon: string;
        };
    };
    collections: {
        enabled: boolean;
        title: string;
        titleAr: string;
    };
    bestSelling: {
        enabled: boolean;
        title: string;
        titleAr: string;
    };
    // إعدادات جديدة
    siteSettings: {
        siteName: string;
        siteNameAr: string;
        logo: string;
        favicon: string;
        primaryColor: string;
        secondaryColor: string;
    };
    contactInfo: {
        phone: string;
        email: string;
        address: string;
        addressAr: string;
        whatsapp: string;
        workingHours: string;
        workingHoursAr: string;
    };
    socialMedia: {
        instagram: string;
        facebook: string;
        twitter: string;
        tiktok: string;
        snapchat: string;
    };
    footer: {
        aboutText: string;
        aboutTextAr: string;
        copyrightText: string;
        copyrightTextAr: string;
        showPaymentIcons: boolean;
    };
}

// المحتوى الافتراضي
export const defaultHomeContent: HomeContent = {
    announcement: {
        text: "Orders are made to order and typically ship within 10 to 20 business days (excluding Friday and Saturday)",
        textAr: "الطلبات تُنفذ حسب الطلب ويتم شحنها عادةً خلال 10 إلى 20 يوم عمل (باستثناء الجمعة والسبت)",
        enabled: true
    },
    hero: {
        title: "Elegance Redefined",
        titleAr: "أناقة بلا حدود",
        subtitle: "Discover our exclusive collection of luxury women's fashion",
        subtitleAr: "اكتشفي مجموعتنا الحصرية من الأزياء النسائية الفاخرة",
        buttonText: "Shop Now",
        buttonTextAr: "تسوقي الآن",
        backgroundImage: "/hero-bg.jpg"
    },
    features: {
        feature1: {
            title: "Free Shipping",
            titleAr: "شحن مجاني",
            description: "On orders over 500 KWD",
            descriptionAr: "للطلبات فوق 500 د.ك",
            icon: "truck"
        },
        feature2: {
            title: "Premium Quality",
            titleAr: "جودة عالية",
            description: "Luxury and distinctive products",
            descriptionAr: "منتجات فاخرة ومميزة",
            icon: "award"
        },
        feature3: {
            title: "24/7 Support",
            titleAr: "دعم العملاء",
            description: "We're here to help you",
            descriptionAr: "نحن هنا لمساعدتك",
            icon: "headphones"
        }
    },
    collections: {
        enabled: true,
        title: "Our Collections",
        titleAr: "مجموعاتنا"
    },
    bestSelling: {
        enabled: true,
        title: "Best Selling",
        titleAr: "الأكثر مبيعاً"
    },
    siteSettings: {
        siteName: "izel",
        siteNameAr: "إيزل",
        logo: "",
        favicon: "",
        primaryColor: "#C4A574",
        secondaryColor: "#F5F3EF"
    },
    contactInfo: {
        phone: "+965 9999 9999",
        email: "info@izel.kw",
        address: "Kuwait",
        addressAr: "الكويت",
        whatsapp: "+96599999999",
        workingHours: "Sun - Thu: 9AM - 9PM",
        workingHoursAr: "الأحد - الخميس: 9 صباحاً - 9 مساءً"
    },
    socialMedia: {
        instagram: "https://instagram.com/izel.kw",
        facebook: "",
        twitter: "",
        tiktok: "",
        snapchat: ""
    },
    footer: {
        aboutText: "Luxury women's fashion inspired by ancient Kuwaiti heritage with an elegant modern touch.",
        aboutTextAr: "أزياء نسائية فاخرة مستوحاة من التراث الكويتي العريق بلمسة عصرية أنيقة.",
        copyrightText: "All rights reserved. 2024 izel",
        copyrightTextAr: "جميع الحقوق محفوظة. 2024 izel",
        showPaymentIcons: true
    }
};

// متغير للتخزين المؤقت
let cachedContent: HomeContent | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 60000; // 1 minute

// حفظ المحتوى في Supabase و localStorage
export const saveHomeContent = async (content: HomeContent): Promise<boolean> => {
    console.log('🔄 Saving content...', content.contactInfo);
    try {
        // حفظ في Supabase
        const { error, data } = await supabase
            .from('site_content')
            .upsert({ 
                id: 1, 
                content: content,
                updated_at: new Date().toISOString()
            })
            .select();
        
        console.log('📦 Supabase response:', { error, data });
        
        if (error) {
            console.error('❌ Error saving to Supabase:', error);
            // Fallback to localStorage
            localStorage.setItem('homeContent', JSON.stringify(content));
        } else {
            console.log('✅ Saved to Supabase successfully');
            // حفظ في localStorage كـ cache
            localStorage.setItem('homeContent', JSON.stringify(content));
        }
        
        // تحديث الـ cache
        cachedContent = content;
        lastFetch = Date.now();
        
        // إرسال حدث مخصص لتحديث المكونات
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('contentUpdated'));
        }
        
        return !error;
    } catch (e) {
        console.error('❌ Error saving content:', e);
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('homeContent', JSON.stringify(content));
            window.dispatchEvent(new Event('contentUpdated'));
        }
        return false;
    }
};

// تحميل المحتوى من Supabase (مع fallback إلى localStorage)
export const loadHomeContent = (): HomeContent => {
    // أولاً: قراءة من localStorage كـ cache سريع
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('homeContent');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return mergeWithDefaults(parsed);
            } catch (e) {
                return defaultHomeContent;
            }
        }
    }
    return defaultHomeContent;
};

// تحميل المحتوى من Supabase (async)
export const fetchHomeContent = async (): Promise<HomeContent> => {
    // التحقق من الـ cache
    if (cachedContent && (Date.now() - lastFetch) < CACHE_DURATION) {
        return cachedContent;
    }
    
    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('content')
            .eq('id', 1)
            .single();
        
        if (error || !data) {
            console.log('Loading from localStorage (Supabase unavailable)');
            return loadHomeContent();
        }
        
        const content = mergeWithDefaults(data.content as Partial<HomeContent>);
        
        // تحديث الـ cache
        cachedContent = content;
        lastFetch = Date.now();
        
        // تحديث localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('homeContent', JSON.stringify(content));
        }
        
        return content;
    } catch (e) {
        console.error('Error fetching content:', e);
        return loadHomeContent();
    }
};

// دمج المحتوى مع القيم الافتراضية
const mergeWithDefaults = (parsed: Partial<HomeContent>): HomeContent => {
    return {
        ...defaultHomeContent,
        ...parsed,
        announcement: { ...defaultHomeContent.announcement, ...parsed.announcement },
        hero: { ...defaultHomeContent.hero, ...parsed.hero },
        features: { 
            ...defaultHomeContent.features, 
            ...parsed.features,
            feature1: { ...defaultHomeContent.features.feature1, ...parsed.features?.feature1 },
            feature2: { ...defaultHomeContent.features.feature2, ...parsed.features?.feature2 },
            feature3: { ...defaultHomeContent.features.feature3, ...parsed.features?.feature3 },
        },
        collections: { ...defaultHomeContent.collections, ...parsed.collections },
        bestSelling: { ...defaultHomeContent.bestSelling, ...parsed.bestSelling },
        siteSettings: { ...defaultHomeContent.siteSettings, ...parsed.siteSettings },
        contactInfo: { ...defaultHomeContent.contactInfo, ...parsed.contactInfo },
        socialMedia: { ...defaultHomeContent.socialMedia, ...parsed.socialMedia },
        footer: { ...defaultHomeContent.footer, ...parsed.footer }
    };
};

// إعادة تعيين المحتوى للافتراضي
export const resetHomeContent = async (): Promise<HomeContent> => {
    try {
        await supabase
            .from('site_content')
            .upsert({ 
                id: 1, 
                content: defaultHomeContent,
                updated_at: new Date().toISOString()
            });
    } catch (e) {
        console.error('Error resetting content:', e);
    }
    
    if (typeof window !== 'undefined') {
        localStorage.removeItem('homeContent');
        window.dispatchEvent(new Event('contentUpdated'));
    }
    
    cachedContent = null;
    return defaultHomeContent;
};

// تحميل صورة وتخزينها كـ base64
export const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('Failed to read file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

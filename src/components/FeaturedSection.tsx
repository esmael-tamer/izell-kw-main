import { ProductCard } from '@/components/ProductCard';
import { useTranslation } from 'react-i18next';
import { loadProducts } from '@/lib/products';
import { fetchProducts } from '@/lib/supabase-products';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// إعدادات الأقسام المحفوظة
const SECTIONS_STORAGE_KEY = 'izell_home_sections';

export interface SectionSettings {
  bestSelling: {
    enabled: boolean;
    title: string;
    titleAr: string;
  };
  featured: {
    enabled: boolean;
    title: string;
    titleAr: string;
  };
}

const defaultSections: SectionSettings = {
  bestSelling: {
    enabled: true,
    title: 'Best Selling',
    titleAr: 'الأكثر طلباً',
  },
  featured: {
    enabled: true,
    title: 'Featured Products',
    titleAr: 'المنتجات المميزة',
  },
};

export function loadSectionSettings(): SectionSettings {
  try {
    const saved = localStorage.getItem(SECTIONS_STORAGE_KEY);
    if (saved) {
      return { ...defaultSections, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Error loading section settings:', error);
  }
  return defaultSections;
}

export function saveSectionSettings(settings: SectionSettings): void {
  localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('sectionsUpdated'));
}

// قسم المنتجات المميزة
export function FeaturedSection() {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState(loadSectionSettings());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allProducts = await fetchProducts();
        if (allProducts.length > 0) {
          // المنتجات المميزة - المنتجات الجديدة أو التي عليها خصم
          const featured = allProducts.filter(p => p.isNew || p.onSale).slice(0, 4);
          setProducts(featured.length > 0 ? featured : allProducts.slice(0, 4));
        } else {
          const localProducts = loadProducts();
          const featured = localProducts.filter(p => p.isNew || p.onSale).slice(0, 4);
          setProducts(featured.length > 0 ? featured : localProducts.slice(0, 4));
        }
      } catch (error) {
        console.error('Error loading featured products:', error);
        const localProducts = loadProducts();
        setProducts(localProducts.slice(0, 4));
      }
      setLoading(false);
    };

    loadData();

    const handleUpdate = () => {
      setSettings(loadSectionSettings());
    };

    window.addEventListener('sectionsUpdated', handleUpdate);
    return () => {
      window.removeEventListener('sectionsUpdated', handleUpdate);
    };
  }, []);

  if (!settings.featured.enabled) {
    return null;
  }

  const title = i18n.language === 'ar' ? settings.featured.titleAr : settings.featured.title;

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="font-arabic text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
            {title}
          </h2>
          <div className="w-16 h-1 bg-primary"></div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

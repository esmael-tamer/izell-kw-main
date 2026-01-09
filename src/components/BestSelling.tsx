import { ProductCard } from '@/components/ProductCard';
import { useTranslation } from 'react-i18next';
import { loadHomeContent } from '@/lib/content';
import { loadProducts } from '@/lib/products';
import { fetchFeaturedProducts } from '@/lib/supabase-products';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function BestSelling() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState(loadHomeContent());
  const [bestProducts, setBestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // جلب المنتجات المميزة من Supabase
        const featuredProducts = await fetchFeaturedProducts();
        if (featuredProducts.length > 0) {
          setBestProducts(featuredProducts.slice(0, 4));
        } else {
          // إذا لم توجد، استخدم المحلية
          const localProducts = loadProducts();
          setBestProducts(localProducts.filter(p => p.inStock).slice(0, 4));
        }
      } catch (error) {
        console.error('Error loading featured products:', error);
        const localProducts = loadProducts();
        setBestProducts(localProducts.filter(p => p.inStock).slice(0, 4));
      }
      setLoading(false);
    };

    loadData();

    const handleStorageChange = () => {
      setContent(loadHomeContent());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!content.bestSelling.enabled) {
    return null;
  }

  const title = i18n.language === 'ar' ? content.bestSelling.titleAr : content.bestSelling.title;

  return (
    <section className="py-20 bg-background">
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
            {bestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

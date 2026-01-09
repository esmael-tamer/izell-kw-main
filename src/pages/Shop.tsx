import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel, FilterOptions } from '@/components/FilterPanel';
import { SortDropdown, SortOption } from '@/components/SortDropdown';
import { loadProducts } from '@/lib/products';
import { fetchProducts } from '@/lib/supabase-products';
import { Product } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';

const Shop = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب المنتجات من Supabase
    const loadData = async () => {
      setLoading(true);
      try {
        const supabaseProducts = await fetchProducts();
        if (supabaseProducts.length > 0) {
          setAllProducts(supabaseProducts);
        } else {
          // إذا لم توجد منتجات في Supabase، استخدم المحلية
          setAllProducts(loadProducts());
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts(loadProducts());
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 200 },
    showNew: false,
    showSale: false,
    inStockOnly: false,
  });

  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter from URL
    if (currentCategory !== 'all') {
      if (currentCategory === 'new') {
        result = result.filter(p => p.isNew);
      } else if (currentCategory === 'offers') {
        result = result.filter(p => p.onSale || p.originalPrice);
      } else {
        result = result.filter(p => p.category === currentCategory);
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.nameAr.includes(searchQuery) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Advanced category filters
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }

    // Price range filter
    result = result.filter(p =>
      p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );

    // New arrivals filter
    if (filters.showNew) {
      result = result.filter(p => p.isNew);
    }

    // On sale filter
    if (filters.showSale) {
      result = result.filter(p => p.onSale);
    }

    // In stock filter
    if (filters.inStockOnly) {
      result = result.filter(p => p.inStock !== false);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        // Keep original order
        break;
    }

    return result;
  }, [currentCategory, searchQuery, filters, sortBy, allProducts]);

  const categories = [
    { key: 'all', label: i18n.language === 'ar' ? 'جميع المنتجات' : 'All Products' },
    { key: 'new', label: i18n.language === 'ar' ? 'المجموعة الجديدة' : 'New Collection' },
    { key: 'offers', label: i18n.language === 'ar' ? 'العروض' : 'Offers' },
  ];

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 200 },
      showNew: false,
      showSale: false,
      inStockOnly: false,
    });
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 py-12 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-6xl text-foreground mb-6 font-bold">
              {t('shop.title')}
            </h1>
            <p className="font-arabic text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('shop.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="flex justify-center mb-8">
              <SearchBar />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSearchParams(filter.key === 'all' ? {} : { category: filter.key })}
                className={`font-arabic px-8 py-3 rounded-full transition-all duration-300 font-bold border-2 ${currentCategory === filter.key
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-primary/50'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Advanced Filters & Sort */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            {/* Desktop Filter Panel */}
            <div className="hidden lg:block">
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>

            {/* Products Section */}
            <div className="lg:col-span-3">
              {/* Toolbar: Mobile Filter Button + Sort + Results Count */}
              <div className="flex items-center justify-between mb-6 gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 
                    rounded-xl hover:border-slate-300 transition-all"
                >
                  <SlidersHorizontal size={18} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 font-arabic">
                    {t('filters.title', 'Filters')}
                  </span>
                  {(filters.categories.length + (filters.showNew ? 1 : 0) + (filters.showSale ? 1 : 0) + (filters.inStockOnly ? 1 : 0)) > 0 && (
                    <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                      {filters.categories.length + (filters.showNew ? 1 : 0) + (filters.showSale ? 1 : 0) + (filters.inStockOnly ? 1 : 0)}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-4 ml-auto">
                  {/* Results Count */}
                  <p className="font-arabic text-slate-600 text-sm">
                    {filteredProducts.length} {i18n.language === 'ar' ? 'منتج' : 'products'}
                  </p>

                  {/* Sort Dropdown */}
                  <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="font-arabic text-xl text-slate-600 mb-4">
                    {i18n.language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                  </p>
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setSearchParams({});
                    }}
                    className="text-primary font-arabic font-bold hover:underline"
                  >
                    {i18n.language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset filters'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  onClose={() => setShowMobileFilters(false)}
                  isMobile={true}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Shop;

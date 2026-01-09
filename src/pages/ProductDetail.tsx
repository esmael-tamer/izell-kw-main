import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Check, Truck, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { loadProducts } from '@/lib/products';
import { fetchProductById, fetchProducts } from '@/lib/supabase-products';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ImageZoom } from '@/components/ImageZoom';
import { ColorSwatch } from '@/components/ColorSwatch';
import { ProductRating } from '@/components/ProductRating';
import { ProductCard } from '@/components/ProductCard';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';

import { SizeGuideModal } from '@/components/SizeGuideModal';
import { ProductReviews } from '@/components/ProductReviews';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { t, i18n } = useTranslation();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // تحقق إذا كان ID هو UUID أم رقم
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isUUID) {
          // جلب المنتج من Supabase إذا كان UUID
          const supabaseProduct = await fetchProductById(id);
          if (supabaseProduct) {
            setProduct(supabaseProduct);
          }
        } else {
          // ابحث في المنتجات المحلية إذا كان ID رقمي
          const localProducts = loadProducts();
          const localProduct = localProducts.find(p => p.id === id);
          setProduct(localProduct || null);
        }
        
        // جلب المنتجات للمنتجات المشابهة
        const products = await fetchProducts();
        if (products.length > 0) {
          setAllProducts(products);
        } else {
          setAllProducts(loadProducts());
        }
      } catch (error) {
        console.error('Error loading product:', error);
        const localProducts = loadProducts();
        const localProduct = localProducts.find(p => p.id === id);
        setProduct(localProduct || null);
        setAllProducts(localProducts);
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (product?.image) {
      setActiveImage(product.image);
    }
    window.scrollTo(0, 0);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-arabic text-2xl text-foreground mb-4">{t('product.notFound')}</h1>
            <Link to="/shop" className="text-primary hover:underline font-arabic">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: i18n.language === 'ar' ? 'الرجاء اختيار المقاس' : 'Please select a size',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedColor) {
      toast({
        title: i18n.language === 'ar' ? 'الرجاء اختيار اللون' : 'Please select a color',
        variant: 'destructive',
      });
      return;
    }

    addItem(product, selectedSize, selectedColor, quantity);

    toast({
      title: t('cart.form.success'),
      description: `${i18n.language === 'ar' ? product.nameAr : product.name} - ${selectedSize}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 py-8 mb-24 md:mb-0">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link to="/" className="font-arabic text-muted-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <ArrowRight size={14} className={`text-muted-foreground ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
            <Link to="/shop" className="font-arabic text-muted-foreground hover:text-primary transition-colors">
              {t('nav.shop')}
            </Link>
            <ArrowRight size={14} className={`text-muted-foreground ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
            <span className="font-arabic text-foreground">{i18n.language === 'ar' ? product.nameAr : product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Product Images - Swipeable Carousel */}
            <div className="w-full">
              <ProductImageCarousel
                images={product.images && product.images.length > 0 ? product.images : [product.image]}
                activeImage={activeImage || product.image}
                onImageChange={setActiveImage}
                productName={i18n.language === 'ar' ? product.nameAr : product.name}
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="font-arabic text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {i18n.language === 'ar' ? product.nameAr : product.name}
              </h1>

              {/* Rating */}
              {product.rating && (
                <div className="mb-6 flex items-center gap-4">
                  <ProductRating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size="md"
                  />
                  <div className="w-px h-4 bg-border" />
                  <span className="text-sm text-emerald-600 font-arabic font-bold">{t('product.inStock')}</span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <p className="font-price text-4xl font-bold text-primary">
                  {product.price.toFixed(2)} د.ك
                </p>
              </div>

              <p className="font-arabic text-lg text-muted-foreground leading-relaxed mb-8 border-r-2 border-primary/20 pr-4">
                {i18n.language === 'ar' ? product.descriptionAr : product.description}
              </p>

              {/* Delivery Time */}
              <div className="flex items-center gap-4 bg-secondary/30 p-5 rounded-2xl mb-8 border border-border/50">
                <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-primary shadow-sm text-[#8b6e5d]">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="font-arabic font-bold text-foreground">
                    {t('product.deliveryTime')}
                  </p>
                  <p className="font-arabic text-xs text-muted-foreground">توصيل سريع لجميع مناطق الكويت</p>
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-arabic font-bold text-lg text-foreground">{t('product.size')}</h3>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs text-primary font-bold underline hover:text-primary/80 transition-colors"
                  >
                    {t('product.sizeGuide')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[60px] h-12 px-4 rounded-xl border-2 transition-all font-arabic font-bold ${selectedSize === size
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-background text-foreground border-border hover:border-primary/50'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-10">
                <h3 className="font-arabic font-bold text-lg text-foreground mb-4">{t('product.color')}</h3>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      colorName={color}
                      selected={selectedColor === color}
                      onClick={() => {
                        setSelectedColor(color);
                        // تغيير الصورة إذا كان هناك صورة مرتبطة بهذا اللون
                        if (product.colorImages && product.colorImages[color]) {
                          setActiveImage(product.colorImages[color]);
                        }
                      }}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="font-arabic text-sm text-primary mt-3 font-bold">
                    {t('product.selectedColor')}: {selectedColor}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                {/* Quantity */}
                <div className="flex items-center justify-between border-2 border-border rounded-xl px-4 py-3 sm:w-40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:text-primary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-arabic text-xl font-bold w-12 text-center text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:text-primary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-arabic font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag size={22} />
                  <span>{product.inStock ? t('product.addToCart') : t('product.outOfStock')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="container mx-auto px-4">
          <ProductReviews productId={product.id} productName={i18n.language === 'ar' ? product.nameAr : product.name} />
        </div>

        {/* You May Also Like Section */}
        <div className="container mx-auto px-4 py-24 border-t border-border mt-16">
          <div className="flex flex-col items-center mb-12">
            <h2 className="font-arabic text-3xl font-bold text-foreground mb-4">
              {t('product.youMayAlsoLike')}
            </h2>
            <div className="w-20 h-1.5 bg-primary rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {allProducts
              .filter((p) => p.id !== product.id && p.category === product.category)
              .slice(0, 4)
              .map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Sticky Mobile Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex items-center justify-between gap-4 md:hidden z-[45] animate-in slide-in-from-bottom duration-500 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] text-slate-400 font-arabic font-bold uppercase tracking-widest">{t('cart.total')}</span>
          <span className="text-xl font-bold text-primary font-display">{(product.price * quantity).toFixed(2)} د.ك</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-arabic font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
        >
          <ShoppingBag size={18} />
          <span>{product.inStock ? t('product.addToCart') : t('product.outOfStock')}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;

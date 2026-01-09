import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { ProductRating } from '@/components/ProductRating';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const { addItem } = useCart();
    const { t, i18n } = useTranslation();

    const handleAddToCart = (product: any) => {
        // Add with default size and color - user can change in cart
        const defaultSize = product.sizes[0];
        const defaultColor = product.colors[0];

        addItem(product, defaultSize, defaultColor, 1);
        removeFromWishlist(product.id);

        toast({
            title: i18n.language === 'ar' ? 'أضيف إلى السلة' : 'Added to Cart',
            description: i18n.language === 'ar' ? product.nameAr : product.name,
        });
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                <Header />
                <main className="flex-1 flex items-center justify-center py-20 px-4">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center text-red-500 animate-bounce shadow-lg">
                            <Heart size={64} strokeWidth={1.5} />
                        </div>
                        <h1 className="font-arabic text-4xl font-bold text-foreground mb-4">
                            {i18n.language === 'ar' ? 'قائمة المفضلة فارغة' : 'Your Wishlist is Empty'}
                        </h1>
                        <p className="font-arabic text-muted-foreground mb-10 leading-relaxed text-lg">
                            {i18n.language === 'ar'
                                ? 'ابدأ بإضافة المنتجات التي تعجبك إلى قائمة المفضلة'
                                : 'Start adding products you love to your wishlist'}
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary/90 text-white px-12 py-5 rounded-full font-arabic font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            <span>{i18n.language === 'ar' ? 'تسوق الآن' : 'Shop Now'}</span>
                            {i18n.language === 'ar' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />
            <main className="flex-1 py-12 bg-gradient-to-b from-slate-50/50 to-white">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                                    <Heart size={24} className="fill-current" />
                                </div>
                                <h1 className="font-arabic text-4xl font-bold text-foreground">
                                    {i18n.language === 'ar' ? 'قائمة المفضلة' : 'My Wishlist'}
                                </h1>
                            </div>
                            {wishlist.length > 0 && (
                                <button
                                    onClick={clearWishlist}
                                    className="text-sm text-red-500 hover:text-red-600 font-arabic font-bold underline"
                                >
                                    {i18n.language === 'ar' ? 'مسح الكل' : 'Clear All'}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 text-red-600 px-5 py-2 rounded-full text-sm font-bold font-arabic">
                                {wishlist.length} {wishlist.length === 1 ? (i18n.language === 'ar' ? 'منتج' : 'item') : (i18n.language === 'ar' ? 'منتجات' : 'items')}
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                        </div>
                    </div>

                    {/* Wishlist Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-red-500 text-slate-600 hover:text-white transition-all shadow-md"
                                    aria-label="Remove from wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <Link to={`/product/${product.id}`}>
                                    <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                                        <img
                                            src={product.image}
                                            alt={i18n.language === 'ar' ? product.nameAr : product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <Link to={`/product/${product.id}`}>
                                        <h3 className="font-arabic text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {i18n.language === 'ar' ? product.nameAr : product.name}
                                        </h3>
                                    </Link>

                                    {product.rating && (
                                        <div className="flex justify-center mb-2">
                                            <ProductRating rating={product.rating} showCount={false} size="sm" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        {product.onSale && product.originalPrice && (
                                            <p className="font-display text-sm text-muted-foreground line-through">
                                                {product.originalPrice} د.ك
                                            </p>
                                        )}
                                        <p className={`font-display text-xl font-bold ${product.onSale ? 'text-red-500' : 'text-primary'}`}>
                                            {product.price} د.ك
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-3 rounded-xl font-arabic font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
                                    >
                                        <ShoppingBag size={18} />
                                        <span>{i18n.language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Continue Shopping */}
                    <div className="mt-12 text-center">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-arabic text-sm font-bold"
                        >
                            {i18n.language === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                            <span>{i18n.language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}</span>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Wishlist;

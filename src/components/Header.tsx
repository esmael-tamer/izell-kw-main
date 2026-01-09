import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Heart, User, Instagram, Trash2, Plus, Minus, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/contexts/CartContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/contexts/WishlistContext';
import logo from '@/assets/logo.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, total } = useCart();
  const { wishlist } = useWishlist();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isMenuOpen) {
      document.body.style.overflow = 'unset';
    }
  }, [isCartOpen, isMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm'
          : 'bg-background'
          }`}
      >
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left section - Menu (Mobile) + Language Switcher */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 text-foreground hover:bg-secondary rounded-full transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Logo - Center */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center group">
              <span className={`font-display font-medium tracking-tight text-foreground transition-all duration-300 ${scrolled ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>
                izel
              </span>
            </Link>

            {/* Utility Icons - Right side */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="md:hidden">
                <LanguageSwitcher />
              </div>

              {/* Wishlist Icon - Desktop only */}
              <Link
                to="/wishlist"
                className="relative p-2 text-foreground hover:bg-secondary rounded-full transition-all group hidden md:block"
                aria-label="Wishlist"
              >
                <Heart size={24} className={`group-hover:scale-110 transition-transform ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground hover:bg-secondary rounded-full transition-all group"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={24} className="group-hover:scale-110 transition-transform" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer - Rendered via Portal to ensure top-level stacking */}
      {createPortal(
        <div
          className={`fixed inset-0 z-[9999] md:hidden ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className={`absolute top-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full')
              }`}
          >
            <div className="flex flex-col h-full bg-white">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white shrink-0">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="font-display text-2xl font-medium tracking-tight text-foreground italic">
                  izel
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-foreground hover:bg-secondary rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 flex flex-col p-6 gap-2 overflow-y-auto bg-white">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-arabic text-2xl font-bold text-foreground hover:text-primary hover:bg-slate-50 transition-all py-4 px-4 rounded-xl"
                >
                  {t('nav.home')}
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-arabic text-2xl font-bold text-foreground hover:text-primary hover:bg-slate-50 transition-all py-4 px-4 rounded-xl"
                >
                  {i18n.language === 'ar' ? 'جميع المنتجات' : 'All Products'}
                </Link>
                <Link
                  to="/shop?category=new"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-arabic text-2xl font-bold text-foreground hover:text-primary hover:bg-slate-50 transition-all py-4 px-4 rounded-xl"
                >
                  {i18n.language === 'ar' ? 'المجموعة الجديدة' : 'New Collection'}
                </Link>
                <Link
                  to="/shop?category=offers"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-arabic text-2xl font-bold text-foreground hover:text-primary hover:bg-slate-50 transition-all py-4 px-4 rounded-xl"
                >
                  {i18n.language === 'ar' ? 'العروض' : 'Offers'}
                </Link>
                <div className="h-px bg-slate-100 my-4" />
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-arabic text-lg text-muted-foreground hover:text-primary hover:bg-slate-50 transition-all py-3 px-4 rounded-xl flex items-center gap-2"
                >
                  <Heart size={20} className={wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''} />
                  {i18n.language === 'ar' ? 'المفضلة' : 'Wishlist'}
                  {wishlist.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-arabic text-lg text-muted-foreground hover:text-primary hover:bg-slate-50 transition-all py-3 px-4 rounded-xl"
                >
                  {t('about.title')}
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-arabic text-lg text-muted-foreground hover:text-primary hover:bg-slate-50 transition-all py-3 px-4 rounded-xl flex items-center gap-2"
                >
                  <Package size={20} />
                  {i18n.language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
                </Link>
              </nav>

              {/* Footer Section */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <p className="font-arabic text-xs text-center text-muted-foreground font-bold uppercase tracking-widest mb-2">
                  @IZEL.KW
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cart Drawer */}
      {createPortal(
        <div
          className={`fixed inset-0 z-[9999] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsCartOpen(false)}
          />

          {/* Cart Content */}
          <div
            className={`absolute top-0 ${i18n.language === 'ar' ? 'left-0' : 'right-0'} h-full w-[90%] max-w-md bg-white shadow-2xl transition-transform duration-500 ease-out ${isCartOpen ? 'translate-x-0' : (i18n.language === 'ar' ? '-translate-x-full' : 'translate-x-full')
              }`}
          >
            <div className="flex flex-col h-full bg-white">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white shrink-0">
                <h2 className="font-arabic text-xl font-bold text-foreground">
                  {i18n.language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-foreground hover:bg-secondary rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag size={64} className="text-slate-200 mb-4" />
                    <p className="font-arabic text-lg text-muted-foreground">
                      {i18n.language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-primary hover:underline font-arabic"
                    >
                      {i18n.language === 'ar' ? 'تابع التسوق' : 'Continue Shopping'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                        <img
                          src={item.product.images?.[0] || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-arabic text-sm font-medium text-foreground truncate">
                            {i18n.language === 'ar' ? item.product.nameAr : item.product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.selectedSize} / {item.selectedColor}
                          </p>
                          <p className="font-price text-sm font-semibold text-primary mt-1">
                            {item.product.price} {i18n.language === 'ar' ? 'د.ك' : 'KD'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                              className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors mr-auto"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-white shrink-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-lg font-medium">
                      {i18n.language === 'ar' ? 'المجموع' : 'Total'}
                    </span>
                    <span className="font-price text-xl font-bold text-primary">
                      {total.toFixed(2)} {i18n.language === 'ar' ? 'د.ك' : 'KD'}
                    </span>
                  </div>
                  <Link
                    to="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full py-3 bg-primary text-primary-foreground text-center font-arabic font-medium rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    {i18n.language === 'ar' ? 'عرض السلة والدفع' : 'View Cart & Checkout'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Truck, CheckCircle2, Package, Shield } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { t, i18n } = useTranslation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      toast({
        title: t('cart.form.required'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('cart.form.success'),
      description: t('cart.form.successDesc'),
    });

    clearCart();
    setIsCheckingOut(false);
    setFormData({ name: '', phone: '', address: '' });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary animate-bounce shadow-lg">
              <ShoppingBag size={64} strokeWidth={1.5} />
            </div>
            <h1 className="font-arabic text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
              {t('cart.empty')}
            </h1>
            <p className="font-arabic text-muted-foreground mb-10 leading-relaxed text-lg">
              {t('cart.emptyDesc')}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary/90 text-white px-12 py-5 rounded-full font-arabic font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <span>{t('cart.continueShopping')}</span>
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
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg">
                <ShoppingBag size={24} />
              </div>
              <h1 className="font-arabic text-4xl font-bold text-foreground">
                {t('cart.title')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-bold font-arabic">
                {items.length} {items.length === 1 ? (i18n.language === 'ar' ? 'قطعة' : 'item') : (i18n.language === 'ar' ? 'قطع' : 'items')}
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {!isCheckingOut ? (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
                  >
                    <Link
                      to={`/product/${item.product.id}`}
                      className="relative w-full sm:w-36 aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 shrink-0"
                    >
                      <img
                        src={item.product.image}
                        alt={i18n.language === 'ar' ? item.product.nameAr : item.product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link to={`/product/${item.product.id}`} className="hover:text-primary transition-colors">
                            <h3 className="font-arabic text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {i18n.language === 'ar' ? item.product.nameAr : item.product.name}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-arabic border border-slate-200">
                              {t('product.size')}: {item.selectedSize}
                            </span>
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-arabic border border-slate-200">
                              {t('product.color')}: {item.selectedColor}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title={t('cart.remove')}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="font-display text-3xl text-primary font-bold">
                          {(item.product.price * item.quantity).toFixed(2)} د.ك
                        </p>

                        <div className="flex items-center bg-slate-100 rounded-xl p-1.5 w-fit border border-slate-200">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)
                            }
                            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors text-foreground shadow-sm"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="font-display font-bold px-6 text-xl min-w-[60px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)
                            }
                            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors text-foreground shadow-sm"
                            aria-label="Increase quantity"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Checkout Form */
                <div className="bg-white rounded-3xl border-2 border-primary/20 p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg">
                      <Truck size={28} />
                    </div>
                    <h2 className="font-arabic text-3xl font-bold text-foreground">
                      {t('cart.form.title')}
                    </h2>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-arabic text-sm font-bold text-foreground block">
                          {t('cart.form.name')}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl bg-white font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder={t('cart.form.namePlaceholder')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-arabic text-sm font-bold text-foreground block">
                          {t('cart.form.phone')}
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl bg-white font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pl-20 pr-5"
                            placeholder={t('cart.form.phonePlaceholder')}
                            required
                            dir="ltr"
                          />
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm border-r border-slate-200 pr-4">
                            +965
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-arabic text-sm font-bold text-foreground block">
                        {t('cart.form.address')}
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl bg-white font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[140px]"
                        placeholder={t('cart.form.addressPlaceholder')}
                        required
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="flex-1 px-8 py-4 border-2 border-slate-200 rounded-2xl font-arabic font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-lg"
                      >
                        <ArrowRight size={20} className={i18n.language === 'ar' ? '' : 'rotate-180'} />
                        <span>{t('cart.form.back')}</span>
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] bg-gradient-to-r from-primary to-primary/90 text-white px-8 py-5 rounded-2xl font-arabic font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 size={24} />
                        <span>{t('cart.form.confirm')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 sticky top-28 shadow-lg">
                <h2 className="font-arabic text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <Package size={24} className="text-primary" />
                  {t('cart.orderSummary')}
                </h2>

                <div className="space-y-5 mb-8">
                  <div className="flex justify-between items-center font-arabic text-lg">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span className="text-foreground font-display font-bold">{total.toFixed(2)} د.ك</span>
                  </div>
                  <div className="flex justify-between items-center font-arabic text-lg">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span className="text-green-600 font-bold">{t('cart.shippingFree')}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 my-6"></div>
                  <div className="flex justify-between items-end font-arabic bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-2xl">
                    <span className="font-bold text-xl text-foreground">{t('cart.total')}</span>
                    <div className="text-right">
                      <span className="block font-display text-4xl text-primary font-bold">
                        {total.toFixed(2)} د.ك
                      </span>
                    </div>
                  </div>
                </div>

                {!isCheckingOut && (
                  <div className="space-y-4">
                    <Link
                      to="/checkout"
                      className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-5 rounded-2xl font-arabic font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3"
                    >
                      <ShoppingBag size={24} />
                      <span>{t('cart.checkout')}</span>
                    </Link>
                    <Link
                      to="/shop"
                      className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors font-arabic text-sm font-bold"
                    >
                      {i18n.language === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                      <span>{t('cart.continueShopping')}</span>
                    </Link>
                  </div>
                )}

                {/* Enhanced Trust Badges */}
                <div className="mt-10 pt-8 border-t-2 border-slate-100 grid grid-cols-3 gap-4">
                  <div className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-green-600 shadow-sm group-hover:shadow-md transition-all">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-tight leading-tight">Secure Payment</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-blue-600 shadow-sm group-hover:shadow-md transition-all">
                      <Truck size={20} />
                    </div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-tight leading-tight">Fast Delivery</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-purple-600 shadow-sm group-hover:shadow-md transition-all">
                      <Shield size={20} />
                    </div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-tight leading-tight">Quality Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

import { Link } from 'react-router-dom';
import { Product } from '@/lib/types';
import { ProductRating } from '@/components/ProductRating';
import { ProductBadge } from '@/components/ProductBadge';
import { WishlistButton } from '@/components/WishlistButton';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { i18n } = useTranslation();

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block animate-fade-up"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary mb-4 shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Product Badges */}
        <ProductBadge
          isNew={product.isNew}
          onSale={product.onSale}
          discount={product.discount}
          originalPrice={product.originalPrice}
          price={product.price}
        />

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WishlistButton product={product} />
        </div>

        <img
          src={product.image}
          alt={i18n.language === 'ar' ? product.nameAr : product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
            <span className="font-arabic text-sm text-foreground bg-background/90 px-4 py-2 rounded-full shadow-lg">
              نفذت الكمية
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="text-center">
        <h3 className="font-arabic text-foreground font-medium mb-2 group-hover:text-primary transition-colors text-lg">
          {i18n.language === 'ar' ? product.nameAr : product.name}
        </h3>
        {product.rating && (
          <div className="flex justify-center mb-2">
            <ProductRating rating={product.rating} showCount={false} size="sm" />
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="font-price text-sm text-muted-foreground line-through">
              {product.originalPrice} د.ك
            </p>
          )}
          <p className={`font-price text-lg font-bold ${product.originalPrice && product.originalPrice > product.price ? 'text-red-500' : 'text-primary'}`}>
            {product.price} د.ك
          </p>
        </div>
      </div>
    </Link>
  );
}

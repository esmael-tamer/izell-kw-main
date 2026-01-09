import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface WishlistButtonProps {
    product: Product;
    className?: string;
}

export function WishlistButton({ product, className = '' }: WishlistButtonProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { i18n } = useTranslation();
    const inWishlist = isInWishlist(product.id);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation when clicking heart
        e.stopPropagation();

        if (inWishlist) {
            removeFromWishlist(product.id);
            toast({
                title: i18n.language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from Wishlist',
                description: i18n.language === 'ar' ? product.nameAr : product.name,
            });
        } else {
            addToWishlist(product);
            toast({
                title: i18n.language === 'ar' ? 'أضيف إلى المفضلة' : 'Added to Wishlist',
                description: i18n.language === 'ar' ? product.nameAr : product.name,
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md hover:shadow-lg group ${className}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart
                size={20}
                className={`transition-all ${inWishlist
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-slate-600 group-hover:text-red-500 group-hover:scale-110'
                    }`}
            />
        </button>
    );
}

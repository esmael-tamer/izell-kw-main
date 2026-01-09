import { Sparkles, Tag, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductBadgeProps {
    isNew?: boolean;
    onSale?: boolean;
    discount?: number;
    originalPrice?: number;
    price?: number;
}

export function ProductBadge({ isNew, onSale, discount, originalPrice, price }: ProductBadgeProps) {
    const { i18n } = useTranslation();

    // حساب نسبة الخصم تلقائياً إذا كان هناك سعر أصلي
    const calculatedDiscount = originalPrice && price && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : discount;
    
    const hasDiscount = onSale || (originalPrice && price && originalPrice > price);

    if (!isNew && !hasDiscount) return null;

    return (
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 z-10">
            {/* New Badge */}
            {isNew && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                    <Sparkles size={14} className="animate-spin-slow" />
                    <span className="text-xs font-bold font-arabic">
                        {i18n.language === 'ar' ? 'جديد' : 'NEW'}
                    </span>
                </div>
            )}

            {/* Sale/Discount Badge */}
            {hasDiscount && calculatedDiscount && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm ml-auto">
                    <Percent size={14} />
                    <span className="text-xs font-bold font-arabic">
                        {calculatedDiscount}% {i18n.language === 'ar' ? 'خصم' : 'OFF'}
                    </span>
                </div>
            )}
        </div>
    );
}

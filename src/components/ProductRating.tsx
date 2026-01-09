import { Star } from 'lucide-react';

interface ProductRatingProps {
    rating: number;
    reviewCount?: number;
    showCount?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function ProductRating({
    rating,
    reviewCount = 0,
    showCount = true,
    size = 'md'
}: ProductRatingProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses[size]} ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                    />
                ))}
            </div>
            {showCount && reviewCount > 0 && (
                <span className="text-sm text-muted-foreground font-arabic">
                    ({reviewCount} تقييم)
                </span>
            )}
        </div>
    );
}

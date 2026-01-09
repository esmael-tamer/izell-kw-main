export function ProductCardSkeleton() {
    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 bg-slate-200 rounded-lg w-3/4" />

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                    <div className="h-4 bg-slate-200 rounded w-12" />
                </div>

                {/* Price */}
                <div className="h-6 bg-slate-200 rounded-lg w-1/2" />

                {/* Button */}
                <div className="h-10 bg-slate-200 rounded-xl w-full" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
}

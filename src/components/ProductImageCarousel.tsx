import { useState, useRef, TouchEvent, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageZoom } from './ImageZoom';

interface ProductImageCarouselProps {
    images: string[];
    activeImage: string;
    onImageChange: (image: string) => void;
    productName: string;
}

export function ProductImageCarousel({ images, activeImage, onImageChange, productName }: ProductImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // Sync internal index with external activeImage
    useEffect(() => {
        const index = images.indexOf(activeImage);
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [activeImage, images]);

    const goToNext = () => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        onImageChange(images[nextIndex]);
    };

    const goToPrev = () => {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(prevIndex);
        onImageChange(images[prevIndex]);
    };

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            goToNext();
        }
        if (isRightSwipe) {
            goToPrev();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image Slider */}
            <div
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary shadow-sm group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="w-full h-full">
                    <ImageZoom
                        src={images[currentIndex]}
                        alt={`${productName} - View ${currentIndex + 1}`}
                        className="w-full h-full"
                    />
                </div>

                {/* Navigation Arrows (Desktop) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm hidden md:block"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm hidden md:block"
                            aria-label="Next image"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Dots Indicator (Mobile Overlay) */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-primary w-6'
                                        : 'bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnails (Desktop) */}
            {images.length > 1 && (
                <div className="hidden md:grid grid-cols-5 gap-3">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                onImageChange(img);
                            }}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${index === currentIndex
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-transparent hover:border-primary/50 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

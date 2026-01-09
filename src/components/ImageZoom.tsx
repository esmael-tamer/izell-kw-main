import { useState, useRef, MouseEvent, TouchEvent, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Download } from 'lucide-react';

interface ImageZoomProps {
    src: string;
    alt: string;
    className?: string;
    thumbnails?: string[];
    onThumbnailChange?: (index: number) => void;
    currentIndex?: number;
}

export function ImageZoom({ src, alt, className = '', thumbnails = [], onThumbnailChange, currentIndex = 0 }: ImageZoomProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [activeImageIndex, setActiveImageIndex] = useState(currentIndex);
    const imageRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Desktop zoom lens effect
    const [isHovering, setIsHovering] = useState(false);
    const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
    const [showLens, setShowLens] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current || isModalOpen) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setLensPosition({ x, y });
    }, [isModalOpen]);

    const handleClick = () => {
        setIsModalOpen(true);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setActiveImageIndex(currentIndex);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setScale(prev => {
            const newScale = Math.max(prev - 0.5, 1);
            if (newScale <= 1) {
                setPosition({ x: 0, y: 0 });
            }
            return newScale;
        });
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMoveModal = (e: MouseEvent<HTMLDivElement>) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y,
            });
        }
    };

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (isDragging && e.touches.length === 1 && scale > 1) {
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y,
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Handle wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setScale(prev => Math.min(prev + 0.2, 4));
        } else {
            setScale(prev => {
                const newScale = Math.max(prev - 0.2, 1);
                if (newScale <= 1) {
                    setPosition({ x: 0, y: 0 });
                }
                return newScale;
            });
        }
    };

    // Double click to zoom
    const handleDoubleClick = () => {
        if (scale > 1) {
            handleReset();
        } else {
            setScale(2);
        }
    };

    // Navigate between images
    const handlePrevImage = () => {
        if (thumbnails.length > 0) {
            const newIndex = (activeImageIndex - 1 + thumbnails.length) % thumbnails.length;
            setActiveImageIndex(newIndex);
            onThumbnailChange?.(newIndex);
            handleReset();
        }
    };

    const handleNextImage = () => {
        if (thumbnails.length > 0) {
            const newIndex = (activeImageIndex + 1) % thumbnails.length;
            setActiveImageIndex(newIndex);
            onThumbnailChange?.(newIndex);
            handleReset();
        }
    };

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isModalOpen) return;
        switch (e.key) {
            case 'Escape':
                handleClose();
                break;
            case 'ArrowLeft':
                handlePrevImage();
                break;
            case 'ArrowRight':
                handleNextImage();
                break;
            case '+':
            case '=':
                handleZoomIn();
                break;
            case '-':
                handleZoomOut();
                break;
            case '0':
                handleReset();
                break;
        }
    }, [isModalOpen, activeImageIndex, thumbnails.length]);

    // Add keyboard listener
    useState(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    const currentSrc = thumbnails.length > 0 ? thumbnails[activeImageIndex] : src;

    return (
        <>
            {/* Thumbnail Image with Hover Zoom */}
            <div
                ref={imageRef}
                className={`relative overflow-hidden cursor-zoom-in group ${className}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => {
                    setIsHovering(true);
                    setShowLens(true);
                }}
                onMouseLeave={() => {
                    setIsHovering(false);
                    setShowLens(false);
                }}
                onClick={handleClick}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Magnifying Lens Effect (Desktop) */}
                {showLens && (
                    <div
                        className="absolute w-32 h-32 border-2 border-white/50 rounded-full pointer-events-none hidden md:block shadow-lg"
                        style={{
                            left: `calc(${lensPosition.x}% - 64px)`,
                            top: `calc(${lensPosition.y}% - 64px)`,
                            backgroundImage: `url(${src})`,
                            backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
                            backgroundSize: '300%',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                )}

                {/* Zoom Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg backdrop-blur-sm">
                        <Maximize2 size={24} className="text-foreground" />
                    </div>
                </div>

                {/* Mobile hint */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full md:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                    اضغط للتكبير
                </div>
            </div>

            {/* Full Screen Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
                    {/* Header Controls */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            {thumbnails.length > 1 && (
                                <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                                    {activeImageIndex + 1} / {thumbnails.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Arrows */}
                    {thumbnails.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all backdrop-blur-sm"
                                aria-label="Previous image"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all backdrop-blur-sm"
                                aria-label="Next image"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Zoomable Image */}
                    <div
                        ref={containerRef}
                        className="flex-1 flex items-center justify-center overflow-hidden"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMoveModal}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                        style={{
                            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                            touchAction: 'none'
                        }}
                    >
                        <img
                            src={currentSrc}
                            alt={alt}
                            className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
                            style={{
                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                        {/* Thumbnails Strip */}
                        {thumbnails.length > 1 && (
                            <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-2">
                                {thumbnails.map((thumb, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => {
                                            setActiveImageIndex(index);
                                            onThumbnailChange?.(index);
                                            handleReset();
                                        }}
                                        title={`Image ${index + 1}`}
                                        aria-label={`View image ${index + 1} of ${thumbnails.length}`}
                                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                                            activeImageIndex === index
                                                ? 'ring-2 ring-white scale-110'
                                                : 'opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={thumb} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Zoom Controls */}
                        <div className="flex justify-center items-center gap-2">
                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-1">
                                <button
                                    onClick={handleZoomOut}
                                    disabled={scale <= 1}
                                    className="bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
                                    aria-label="Zoom out"
                                >
                                    <ZoomOut size={18} />
                                </button>
                                <div className="flex items-center justify-center text-white font-bold min-w-[60px] text-sm">
                                    {Math.round(scale * 100)}%
                                </div>
                                <button
                                    onClick={handleZoomIn}
                                    disabled={scale >= 4}
                                    className="bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
                                    aria-label="Zoom in"
                                >
                                    <ZoomIn size={18} />
                                </button>
                            </div>
                            <button
                                onClick={handleReset}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all backdrop-blur-sm"
                                aria-label="Reset zoom"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>

                        {/* Instructions */}
                        <p className="text-white/50 text-xs text-center mt-3 font-arabic">
                            انقر مرتين للتكبير • استخدم عجلة الماوس للتكبير • اسحب للتحريك
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

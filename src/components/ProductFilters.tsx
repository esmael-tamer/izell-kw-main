import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterOptions {
    priceRange: [number, number];
    categories: string[];
    colors: string[];
    sortBy: 'newest' | 'price-low' | 'price-high' | 'rating';
}

interface ProductFiltersProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onReset: () => void;
}

export function ProductFilters({ filters, onFilterChange, onReset }: ProductFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { i18n } = useTranslation();

    const categories = [
        { value: 'dresses', label: i18n.language === 'ar' ? 'فساتين' : 'Dresses' },
        { value: 'bridal', label: i18n.language === 'ar' ? 'عرائس' : 'Bridal' },
    ];

    const colors = [
        'Burgundy', 'Black', 'Off White', 'Dark Navy', 'Brown',
        'Olive Green', 'Baby Pink', 'Purple', 'Beige', 'Nude'
    ];

    const sortOptions = [
        { value: 'newest', label: i18n.language === 'ar' ? 'الأحدث' : 'Newest' },
        { value: 'price-low', label: i18n.language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High' },
        { value: 'price-high', label: i18n.language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low' },
        { value: 'rating', label: i18n.language === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated' },
    ];

    const handleCategoryToggle = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter((c) => c !== category)
            : [...filters.categories, category];
        onFilterChange({ ...filters, categories: newCategories });
    };

    const handleColorToggle = (color: string) => {
        const newColors = filters.colors.includes(color)
            ? filters.colors.filter((c) => c !== color)
            : [...filters.colors, color];
        onFilterChange({ ...filters, colors: newColors });
    };

    const handlePriceChange = (index: 0 | 1, value: number) => {
        const newRange: [number, number] = [...filters.priceRange];
        newRange[index] = value;
        onFilterChange({ ...filters, priceRange: newRange });
    };

    return (
        <div className="relative">
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-border hover:border-primary bg-background transition-all font-arabic font-bold"
            >
                <SlidersHorizontal size={20} />
                <span>{i18n.language === 'ar' ? 'فلترة' : 'Filters'}</span>
                {(filters.categories.length > 0 || filters.colors.length > 0) && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                        {filters.categories.length + filters.colors.length}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-border z-50 animate-in fade-in slide-in-from-top-2">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="font-arabic text-xl font-bold text-foreground">
                                {i18n.language === 'ar' ? 'الفلاتر' : 'Filters'}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                                aria-label={i18n.language === 'ar' ? 'إغلاق الفلاتر' : 'Close filters'}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                            {/* Sort By */}
                            <div>
                                <h4 className="font-arabic font-bold text-foreground mb-3">
                                    {i18n.language === 'ar' ? 'ترتيب حسب' : 'Sort By'}
                                </h4>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
                                    className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none font-arabic"
                                    aria-label={i18n.language === 'ar' ? 'ترتيب حسب' : 'Sort by'}
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h4 className="font-arabic font-bold text-foreground mb-3">
                                    {i18n.language === 'ar' ? 'نطاق السعر' : 'Price Range'}
                                </h4>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={filters.priceRange[0]}
                                        onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                                        placeholder="Min"
                                        className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none font-display"
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <input
                                        type="number"
                                        value={filters.priceRange[1]}
                                        onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                                        placeholder="Max"
                                        className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none font-display"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h4 className="font-arabic font-bold text-foreground mb-3">
                                    {i18n.language === 'ar' ? 'الفئات' : 'Categories'}
                                </h4>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <label
                                            key={category.value}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.categories.includes(category.value)}
                                                onChange={() => handleCategoryToggle(category.value)}
                                                className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-primary"
                                            />
                                            <span className="font-arabic">{category.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <h4 className="font-arabic font-bold text-foreground mb-3">
                                    {i18n.language === 'ar' ? 'الألوان' : 'Colors'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleColorToggle(color)}
                                            className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${filters.colors.includes(color)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-secondary text-foreground hover:bg-secondary/70'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border flex gap-3">
                            <button
                                onClick={onReset}
                                className="flex-1 px-6 py-3 rounded-xl border-2 border-border hover:bg-secondary font-arabic font-bold transition-colors"
                            >
                                {i18n.language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-arabic font-bold hover:bg-primary/90 transition-colors"
                            >
                                {i18n.language === 'ar' ? 'تطبيق' : 'Apply'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

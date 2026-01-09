import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { products } from '@/lib/data';

export interface FilterOptions {
    categories: string[];
    priceRange: { min: number; max: number };
    showNew: boolean;
    showSale: boolean;
    inStockOnly: boolean;
}

interface FilterPanelProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onClose?: () => void;
    isMobile?: boolean;
}

export function FilterPanel({ filters, onFilterChange, onClose, isMobile = false }: FilterPanelProps) {
    const { t, i18n } = useTranslation();
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        status: true,
    });

    // Get unique categories from products
    const allCategories = Array.from(new Set(products.map(p => p.category)));

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryToggle = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter(c => c !== category)
            : [...filters.categories, category];
        onFilterChange({ ...filters, categories: newCategories });
    };

    const handlePriceChange = (min: number, max: number) => {
        onFilterChange({ ...filters, priceRange: { min, max } });
    };

    const clearAllFilters = () => {
        onFilterChange({
            categories: [],
            priceRange: { min: 0, max: 200 },
            showNew: false,
            showSale: false,
            inStockOnly: false,
        });
    };

    const activeFiltersCount =
        filters.categories.length +
        (filters.showNew ? 1 : 0) +
        (filters.showSale ? 1 : 0) +
        (filters.inStockOnly ? 1 : 0);

    return (
        <div className={`bg-white ${isMobile ? 'h-full' : 'rounded-2xl border border-slate-200'} overflow-hidden`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <SlidersHorizontal size={20} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-bold text-slate-900">
                                {t('filters.title', 'Filters')}
                            </h3>
                            {activeFiltersCount > 0 && (
                                <p className="text-xs text-slate-500">
                                    {activeFiltersCount} {t('filters.active', 'active')}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                {t('filters.clearAll', 'Clear All')}
                            </button>
                        )}
                        {isMobile && onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                aria-label={t('filters.close', 'Close filters')}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Category Filter */}
                <div className="border-b border-slate-200">
                    <button
                        onClick={() => toggleSection('category')}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <span className="font-semibold text-slate-900 font-arabic">
                            {t('filters.category', 'Category')}
                        </span>
                        {expandedSections.category ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {expandedSections.category && (
                        <div className="px-6 pb-6 space-y-3">
                            {allCategories.map((category) => (
                                <label
                                    key={category}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category)}
                                        onChange={() => handleCategoryToggle(category)}
                                        className="w-5 h-5 rounded border-2 border-slate-300 text-primary 
                                            focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 font-arabic">
                                        {category}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Range Filter */}
                <div className="border-b border-slate-200">
                    <button
                        onClick={() => toggleSection('price')}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <span className="font-semibold text-slate-900 font-arabic">
                            {t('filters.priceRange', 'Price Range')}
                        </span>
                        {expandedSections.price ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {expandedSections.price && (
                        <div className="px-6 pb-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label htmlFor="filter-price-min" className="text-xs text-slate-500 mb-1 block">
                                        {t('filters.min', 'Min')}
                                    </label>
                                    <input
                                        id="filter-price-min"
                                        type="number"
                                        value={filters.priceRange.min}
                                        onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange.max)}
                                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg 
                                            focus:border-primary focus:outline-none"
                                        min="0"
                                        aria-label={t('filters.minPrice', 'Minimum price')}
                                    />
                                </div>
                                <div className="text-slate-400 mt-5">-</div>
                                <div className="flex-1">
                                    <label htmlFor="filter-price-max" className="text-xs text-slate-500 mb-1 block">
                                        {t('filters.max', 'Max')}
                                    </label>
                                    <input
                                        id="filter-price-max"
                                        type="number"
                                        value={filters.priceRange.max}
                                        onChange={(e) => handlePriceChange(filters.priceRange.min, Number(e.target.value))}
                                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg 
                                            focus:border-primary focus:outline-none"
                                        min="0"
                                        aria-label={t('filters.maxPrice', 'Maximum price')}
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 text-center">
                                {filters.priceRange.min} - {filters.priceRange.max} {t('currency', 'KWD')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Filter */}
                <div className="border-b border-slate-200">
                    <button
                        onClick={() => toggleSection('status')}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <span className="font-semibold text-slate-900 font-arabic">
                            {t('filters.status', 'Status')}
                        </span>
                        {expandedSections.status ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {expandedSections.status && (
                        <div className="px-6 pb-6 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.showNew}
                                    onChange={(e) => onFilterChange({ ...filters, showNew: e.target.checked })}
                                    className="w-5 h-5 rounded border-2 border-slate-300 text-primary 
                                        focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 font-arabic">
                                    {t('filters.newArrivals', 'New Arrivals')}
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.showSale}
                                    onChange={(e) => onFilterChange({ ...filters, showSale: e.target.checked })}
                                    className="w-5 h-5 rounded border-2 border-slate-300 text-primary 
                                        focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 font-arabic">
                                    {t('filters.onSale', 'On Sale')}
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.inStockOnly}
                                    onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
                                    className="w-5 h-5 rounded border-2 border-slate-300 text-primary 
                                        focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 font-arabic">
                                    {t('filters.inStock', 'In Stock Only')}
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

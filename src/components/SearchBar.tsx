import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, TrendingUp, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { products } from '@/lib/data';
import { useTranslation } from 'react-i18next';

const SEARCH_HISTORY_KEY = 'izell_search_history';
const MAX_HISTORY_ITEMS = 5;

export function SearchBar() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<typeof products>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    // Load search history from localStorage
    useEffect(() => {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    }, []);

    // Save search to history
    const saveToHistory = (term: string) => {
        if (!term.trim()) return;
        const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, MAX_HISTORY_ITEMS);
        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    };

    // Clear search history
    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    };

    // Get category suggestions
    const categories = useMemo(() => {
        return [...new Set(products.map(p => p.category))];
    }, []);

    useEffect(() => {
        if (query.trim().length > 0) {
            const searchTerm = query.toLowerCase();
            const filtered = products.filter((product) => {
                const nameMatch = product.name.toLowerCase().includes(searchTerm);
                const nameArMatch = product.nameAr.includes(query);
                const categoryMatch = product.category.toLowerCase().includes(searchTerm);
                const descMatch = product.description?.toLowerCase().includes(searchTerm);
                return nameMatch || nameArMatch || categoryMatch || descMatch;
            });
            
            // Sort by relevance
            filtered.sort((a, b) => {
                const aNameMatch = a.name.toLowerCase().startsWith(searchTerm) || a.nameAr.startsWith(query);
                const bNameMatch = b.name.toLowerCase().startsWith(searchTerm) || b.nameAr.startsWith(query);
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                return 0;
            });
            
            setResults(filtered.slice(0, 6));
            setIsOpen(true);
            setSelectedIndex(-1);
        } else {
            setResults([]);
            setIsOpen(query === '' && document.activeElement === inputRef.current);
        }
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;
        
        const totalItems = results.length > 0 ? results.length : (searchHistory.length + popularSearches.length);
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % totalItems);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && results.length > 0) {
                navigate(`/product/${results[selectedIndex].id}`);
                handleClose();
            } else if (query.trim()) {
                saveToHistory(query);
                navigate(`/shop?search=${encodeURIComponent(query)}`);
                handleClose();
            }
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClose = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    // Highlight matching text
    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        try {
            const parts = text.split(new RegExp(`(${query})`, 'gi'));
            return parts.map((part, index) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={index} className="bg-primary/20 text-primary font-semibold rounded px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            );
        } catch {
            return text;
        }
    };

    const popularSearches = [
        { en: 'Velvet', ar: 'مخمل' },
        { en: 'Embroidered', ar: 'مطرز' },
        { en: 'Silk', ar: 'حرير' },
        { en: 'New Arrivals', ar: 'وصل حديثاً' },
    ];

    const handleSearchClick = (term: string) => {
        setQuery(term);
        saveToHistory(term);
        navigate(`/shop?search=${encodeURIComponent(term)}`);
        handleClose();
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={i18n.language === 'ar' ? 'ابحث عن المنتجات...' : 'Search products...'}
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50
                        focus:border-primary focus:bg-white focus:outline-none
                        hover:border-slate-300 transition-all duration-300
                        text-slate-900 placeholder:text-slate-400 font-arabic"
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                    autoComplete="off"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={i18n.language === 'ar' ? 'مسح البحث' : 'Clear search'}
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
                        <p className="text-xs font-arabic font-bold text-muted-foreground flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            {results.length} {i18n.language === 'ar' ? 'نتيجة' : 'results'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                            ↑↓ {i18n.language === 'ar' ? 'للتنقل' : 'to navigate'}
                        </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {results.map((product, index) => (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                onClick={() => {
                                    saveToHistory(query);
                                    handleClose();
                                }}
                                className={`flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${
                                    selectedIndex === index ? 'bg-secondary/50' : ''
                                }`}
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                                    <img
                                        src={product.image}
                                        alt={i18n.language === 'ar' ? product.nameAr : product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-arabic font-bold text-foreground truncate text-sm">
                                        {highlightMatch(i18n.language === 'ar' ? product.nameAr : product.name, query)}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-arabic truncate">
                                        {product.category}
                                    </p>
                                    {product.sizes && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {i18n.language === 'ar' ? 'المقاسات:' : 'Sizes:'} {product.sizes.join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-display font-bold text-primary">
                                        {product.price} د.ك
                                    </p>
                                    {product.onSale && product.originalPrice && (
                                        <p className="text-xs text-muted-foreground line-through">
                                            {product.originalPrice} د.ك
                                        </p>
                                    )}
                                </div>
                                <ArrowRight size={16} className="text-muted-foreground" />
                            </Link>
                        ))}
                    </div>
                    <Link
                        to={`/shop?search=${encodeURIComponent(query)}`}
                        onClick={() => {
                            saveToHistory(query);
                            handleClose();
                        }}
                        className="flex items-center justify-center gap-2 p-4 text-center bg-primary/5 text-primary font-arabic font-bold hover:bg-primary/10 transition-colors"
                    >
                        {i18n.language === 'ar' ? 'عرض جميع النتائج' : 'View All Results'}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            )}

            {/* Empty State - Show History & Popular Searches */}
            {isOpen && !query && (searchHistory.length > 0 || popularSearches.length > 0) && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {/* Search History */}
                    {searchHistory.length > 0 && (
                        <div className="p-4 border-b border-border/50">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 font-arabic">
                                    <Clock size={14} />
                                    {i18n.language === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'}
                                </p>
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-primary hover:underline font-arabic"
                                >
                                    {i18n.language === 'ar' ? 'مسح' : 'Clear'}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {searchHistory.map((term, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearchClick(term)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 text-slate-700 text-sm rounded-full transition-colors font-arabic flex items-center gap-1"
                                    >
                                        <Clock size={12} className="text-slate-400" />
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Popular Searches */}
                    <div className="p-4">
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-3 font-arabic">
                            <TrendingUp size={14} />
                            {i18n.language === 'ar' ? 'عمليات البحث الشائعة' : 'Popular Searches'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {popularSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchClick(i18n.language === 'ar' ? search.ar : search.en)}
                                    className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary text-sm rounded-full transition-colors font-arabic flex items-center gap-1"
                                >
                                    <Sparkles size={12} />
                                    {i18n.language === 'ar' ? search.ar : search.en}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Categories */}
                    <div className="p-4 bg-secondary/30 border-t border-border/50">
                        <p className="text-xs font-semibold text-slate-500 mb-3 font-arabic">
                            {i18n.language === 'ar' ? 'تصفح الفئات' : 'Browse Categories'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {categories.slice(0, 4).map((category, index) => (
                                <Link
                                    key={index}
                                    to={`/shop?category=${encodeURIComponent(category)}`}
                                    onClick={handleClose}
                                    className="px-3 py-1.5 bg-white hover:bg-primary hover:text-white text-slate-700 text-sm rounded-full transition-colors font-arabic border border-border/50"
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No Results - Show Popular Searches */}
            {isOpen && query && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <Search size={24} className="text-slate-400" />
                    </div>
                    <p className="font-arabic text-slate-700 font-semibold mb-2">
                        {i18n.language === 'ar' ? 'لا توجد نتائج لـ' : 'No results for'} "{query}"
                    </p>
                    <p className="font-arabic text-slate-500 text-sm mb-4">
                        {i18n.language === 'ar' ? 'جرب البحث بكلمات مختلفة' : 'Try different keywords'}
                    </p>
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                            <TrendingUp size={14} />
                            {i18n.language === 'ar' ? 'عمليات البحث الشائعة' : 'Popular Searches'}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {popularSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchClick(i18n.language === 'ar' ? search.ar : search.en)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 text-slate-700 text-xs rounded-full transition-colors font-arabic"
                                >
                                    {i18n.language === 'ar' ? search.ar : search.en}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, Check } from 'lucide-react';

export type SortOption =
    | 'featured'
    | 'price-asc'
    | 'price-desc'
    | 'name-asc'
    | 'name-desc'
    | 'newest';

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sortOptions: { value: SortOption; label: string; labelAr: string }[] = [
        { value: 'featured', label: 'Featured', labelAr: 'مميز' },
        { value: 'newest', label: 'Newest First', labelAr: 'الأحدث أولاً' },
        { value: 'price-asc', label: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
        { value: 'price-desc', label: 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
        { value: 'name-asc', label: 'Name: A to Z', labelAr: 'الاسم: أ إلى ي' },
        { value: 'name-desc', label: 'Name: Z to A', labelAr: 'الاسم: ي إلى أ' },
    ];

    const selectedOption = sortOptions.find(opt => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: SortOption) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 
                    rounded-xl hover:border-slate-300 transition-all group"
            >
                <ArrowUpDown size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                <span className="text-sm font-semibold text-slate-700 font-arabic">
                    {i18n.language === 'ar' ? selectedOption?.labelAr : selectedOption?.label}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl 
                    border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-slate-50 border-b border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 px-3 py-1">
                            {t('sort.title', 'Sort By')}
                        </p>
                    </div>
                    <div className="py-2">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`w-full flex items-center justify-between px-4 py-3 
                                    hover:bg-slate-50 transition-colors text-left
                                    ${value === option.value ? 'bg-primary/5' : ''}`}
                            >
                                <span className={`text-sm font-arabic ${value === option.value
                                        ? 'font-semibold text-primary'
                                        : 'text-slate-700'
                                    }`}>
                                    {i18n.language === 'ar' ? option.labelAr : option.label}
                                </span>
                                {value === option.value && (
                                    <Check size={16} className="text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

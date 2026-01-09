import { useState } from 'react';
import { X, Ruler, Check, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSize?: (size: string) => void;
    selectedSize?: string;
}

interface SizeData {
    size: string;
    bust: string;
    waist: string;
    hips: string;
    length: string;
    euSize: string;
    usSize: string;
}

const sizesData: SizeData[] = [
    { size: 'XS', bust: '32"', waist: '24"', hips: '34"', length: '54"', euSize: '34', usSize: '0-2' },
    { size: 'S', bust: '34"', waist: '26"', hips: '36"', length: '55"', euSize: '36', usSize: '4-6' },
    { size: 'M', bust: '36"', waist: '28"', hips: '38"', length: '56"', euSize: '38', usSize: '8-10' },
    { size: 'L', bust: '38"', waist: '30"', hips: '40"', length: '57"', euSize: '40', usSize: '12-14' },
    { size: 'XL', bust: '40"', waist: '32"', hips: '42"', length: '58"', euSize: '42', usSize: '16' },
    { size: 'XXL', bust: '42"', waist: '34"', hips: '44"', length: '59"', euSize: '44', usSize: '18' },
];

export function SizeGuideModal({ isOpen, onClose, onSelectSize, selectedSize }: SizeGuideModalProps) {
    const { i18n } = useTranslation();
    const [hoveredSize, setHoveredSize] = useState<string | null>(null);
    const [measurementUnit, setMeasurementUnit] = useState<'inch' | 'cm'>('inch');
    const [activeTab, setActiveTab] = useState<'chart' | 'measure'>('chart');

    if (!isOpen) return null;

    const convertToCm = (inch: string) => {
        const value = parseFloat(inch.replace('"', ''));
        return `${Math.round(value * 2.54)} cm`;
    };

    const getValue = (value: string) => {
        return measurementUnit === 'cm' ? convertToCm(value) : value;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-primary/5 to-secondary/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Ruler className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-arabic font-bold text-xl text-foreground">
                            {i18n.language === 'ar' ? 'دليل المقاسات' : 'Size Guide'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-foreground"
                        aria-label={i18n.language === 'ar' ? 'إغلاق' : 'Close'}
                        title={i18n.language === 'ar' ? 'إغلاق' : 'Close'}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100" role="tablist" aria-label={i18n.language === 'ar' ? 'تبويبات دليل المقاسات' : 'Size guide tabs'}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('chart')}
                        title={i18n.language === 'ar' ? 'جدول المقاسات' : 'Size Chart'}
                        role="tab"
                        tabIndex={activeTab === 'chart' ? 0 : -1}
                        className={`flex-1 py-3 px-4 font-arabic text-sm font-semibold transition-colors ${
                            activeTab === 'chart'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {i18n.language === 'ar' ? 'جدول المقاسات' : 'Size Chart'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('measure')}
                        title={i18n.language === 'ar' ? 'كيف تقيس' : 'How to Measure'}
                        role="tab"
                        tabIndex={activeTab === 'measure' ? 0 : -1}
                        className={`flex-1 py-3 px-4 font-arabic text-sm font-semibold transition-colors ${
                            activeTab === 'measure'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {i18n.language === 'ar' ? 'كيف تقيس' : 'How to Measure'}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'chart' ? (
                        <div className="p-6">
                            {/* Unit Toggle */}
                            <div className="flex justify-end mb-4">
                                <div className="inline-flex rounded-full bg-slate-100 p-1" role="group" aria-label={i18n.language === 'ar' ? 'وحدة القياس' : 'Measurement unit'}>
                                    <button
                                        type="button"
                                        onClick={() => setMeasurementUnit('inch')}
                                        title={i18n.language === 'ar' ? 'إنش' : 'Inch'}
                                        className={`px-4 py-1.5 rounded-full text-sm font-arabic transition-all ${
                                            measurementUnit === 'inch'
                                                ? 'bg-white shadow text-primary'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {i18n.language === 'ar' ? 'إنش' : 'Inch'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMeasurementUnit('cm')}
                                        title={i18n.language === 'ar' ? 'سنتيمتر' : 'Centimeters'}
                                        className={`px-4 py-1.5 rounded-full text-sm font-arabic transition-all ${
                                            measurementUnit === 'cm'
                                                ? 'bg-white shadow text-primary'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {i18n.language === 'ar' ? 'سم' : 'CM'}
                                    </button>
                                </div>
                            </div>

                            {/* Size Table */}
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="w-full text-center border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="p-3 border-b border-slate-200 font-arabic font-bold text-sm sticky left-0 bg-slate-50 z-10">
                                                {i18n.language === 'ar' ? 'المقاس' : 'Size'}
                                            </th>
                                            <th className="p-3 border-b border-slate-200 font-arabic font-bold text-sm">
                                                {i18n.language === 'ar' ? 'الصدر' : 'Bust'}
                                            </th>
                                            <th className="p-3 border-b border-slate-200 font-arabic font-bold text-sm">
                                                {i18n.language === 'ar' ? 'الخصر' : 'Waist'}
                                            </th>
                                            <th className="p-3 border-b border-slate-200 font-arabic font-bold text-sm">
                                                {i18n.language === 'ar' ? 'الأرداف' : 'Hips'}
                                            </th>
                                            <th className="p-3 border-b border-slate-200 font-arabic font-bold text-sm">
                                                {i18n.language === 'ar' ? 'الطول' : 'Length'}
                                            </th>
                                            <th className="p-3 border-b border-slate-200 font-arabic font-bold text-sm">EU</th>
                                            <th className="p-3 border-b border-slate-200 font-arabic font-bold text-sm">US</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sizesData.map((row, index) => (
                                            <tr
                                                key={row.size}
                                                className={`transition-colors cursor-pointer ${
                                                    selectedSize === row.size
                                                        ? 'bg-primary/10'
                                                        : hoveredSize === row.size
                                                        ? 'bg-slate-50'
                                                        : index % 2 === 0
                                                        ? 'bg-white'
                                                        : 'bg-slate-50/50'
                                                }`}
                                                onMouseEnter={() => setHoveredSize(row.size)}
                                                onMouseLeave={() => setHoveredSize(null)}
                                                onClick={() => onSelectSize?.(row.size)}
                                            >
                                                <td className="p-3 border-b border-slate-100 font-bold sticky left-0 bg-inherit z-10">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {row.size}
                                                        {selectedSize === row.size && (
                                                            <Check size={16} className="text-primary" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 border-b border-slate-100">{getValue(row.bust)}</td>
                                                <td className="p-3 border-b border-slate-100">{getValue(row.waist)}</td>
                                                <td className="p-3 border-b border-slate-100">{getValue(row.hips)}</td>
                                                <td className="p-3 border-b border-slate-100">{getValue(row.length)}</td>
                                                <td className="p-3 border-b border-slate-100 text-muted-foreground">{row.euSize}</td>
                                                <td className="p-3 border-b border-slate-100 text-muted-foreground">{row.usSize}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Quick Size Selector */}
                            {onSelectSize && (
                                <div className="mt-6">
                                    <p className="font-arabic text-sm text-muted-foreground mb-3" id="size-selector-label">
                                        {i18n.language === 'ar' ? 'اختر مقاسك:' : 'Select your size:'}
                                    </p>
                                    <div className="flex flex-wrap gap-2" role="group" aria-labelledby="size-selector-label">
                                        {sizesData.map((row) => (
                                            <button
                                                type="button"
                                                key={row.size}
                                                onClick={() => {
                                                    onSelectSize(row.size);
                                                    onClose();
                                                }}
                                                title={`${i18n.language === 'ar' ? 'مقاس' : 'Size'} ${row.size}`}
                                                className={`px-4 py-2 rounded-xl font-arabic font-semibold transition-all ${
                                                    selectedSize === row.size
                                                        ? 'bg-primary text-white'
                                                        : 'bg-slate-100 hover:bg-slate-200 text-foreground'
                                                }`}
                                            >
                                                {row.size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {/* How to Measure Instructions */}
                            <div className="grid gap-4">
                                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-primary">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-arabic font-bold text-foreground mb-1">
                                            {i18n.language === 'ar' ? 'قياس الصدر' : 'Bust Measurement'}
                                        </h4>
                                        <p className="font-arabic text-sm text-muted-foreground">
                                            {i18n.language === 'ar'
                                                ? 'قيسي حول أكمل جزء من الصدر، مع إبقاء شريط القياس موازياً للأرض.'
                                                : 'Measure around the fullest part of your bust, keeping the tape parallel to the floor.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-primary">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-arabic font-bold text-foreground mb-1">
                                            {i18n.language === 'ar' ? 'قياس الخصر' : 'Waist Measurement'}
                                        </h4>
                                        <p className="font-arabic text-sm text-muted-foreground">
                                            {i18n.language === 'ar'
                                                ? 'قيسي حول أضيق جزء من خصرك الطبيعي، عادةً فوق السرة.'
                                                : 'Measure around your natural waistline, typically above your belly button.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-primary">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-arabic font-bold text-foreground mb-1">
                                            {i18n.language === 'ar' ? 'قياس الأرداف' : 'Hip Measurement'}
                                        </h4>
                                        <p className="font-arabic text-sm text-muted-foreground">
                                            {i18n.language === 'ar'
                                                ? 'قيسي حول أكمل جزء من الأرداف.'
                                                : 'Measure around the fullest part of your hips.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-primary">4</span>
                                    </div>
                                    <div>
                                        <h4 className="font-arabic font-bold text-foreground mb-1">
                                            {i18n.language === 'ar' ? 'قياس الطول' : 'Length Measurement'}
                                        </h4>
                                        <p className="font-arabic text-sm text-muted-foreground">
                                            {i18n.language === 'ar'
                                                ? 'قيسي من أعلى الكتف إلى الطول المرغوب.'
                                                : 'Measure from the top of your shoulder to your desired length.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="p-4 bg-primary/5 rounded-2xl flex gap-3">
                                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-arabic font-bold text-foreground mb-1">
                                        {i18n.language === 'ar' ? 'نصائح مهمة' : 'Important Tips'}
                                    </h4>
                                    <ul className="font-arabic text-sm text-muted-foreground space-y-1">
                                        <li>• {i18n.language === 'ar' ? 'استخدمي شريط قياس مرن' : 'Use a flexible measuring tape'}</li>
                                        <li>• {i18n.language === 'ar' ? 'قيسي وأنتِ واقفة مستقيمة' : 'Measure while standing straight'}</li>
                                        <li>• {i18n.language === 'ar' ? 'لا تشدي الشريط كثيراً' : "Don't pull the tape too tight"}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-muted-foreground font-arabic text-center mb-3">
                        * {i18n.language === 'ar'
                            ? 'إذا كنتِ بين مقاسين، ننصح باختيار المقاس الأكبر للراحة.'
                            : 'If you are between sizes, we recommend choosing the larger size for comfort.'}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        title={i18n.language === 'ar' ? 'إغلاق دليل المقاسات' : 'Close size guide'}
                        className="w-full py-3 bg-primary text-white rounded-xl font-arabic font-bold hover:bg-primary/90 transition-colors"
                    >
                        {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
}

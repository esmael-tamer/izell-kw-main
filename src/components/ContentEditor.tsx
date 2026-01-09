import { useState } from 'react';
import { Save, RotateCcw, Eye, Settings, Phone, Share2, FileText, Image, Grid3x3, Package, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HomeContent, saveHomeContent, resetHomeContent } from '@/lib/content';
import { toast } from '@/hooks/use-toast';
import { ImageUploader } from './ImageUploader';
import { BannerManager } from './BannerManager';
import { CollectionManager } from './CollectionManager';
import { ProductManager } from './ProductManager';

interface ContentEditorProps {
    content: HomeContent;
    onContentChange: (content: HomeContent) => void;
}

type EditorTab = 'general' | 'banners' | 'sections' | 'collections' | 'products' | 'contact' | 'social' | 'footer';

export function ContentEditor({ content, onContentChange }: ContentEditorProps) {
    const { i18n } = useTranslation();
    const [editedContent, setEditedContent] = useState<HomeContent>(content);
    const [activeTab, setActiveTab] = useState<EditorTab>('general');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await saveHomeContent(editedContent);
            onContentChange(editedContent);
            toast({
                title: i18n.language === 'ar' ? 'تم الحفظ' : 'Saved',
                description: success 
                    ? (i18n.language === 'ar' ? 'تم حفظ التغييرات في قاعدة البيانات' : 'Changes saved to database')
                    : (i18n.language === 'ar' ? 'تم حفظ التغييرات محلياً' : 'Changes saved locally')
            });
        } catch (error) {
            toast({
                title: i18n.language === 'ar' ? 'خطأ' : 'Error',
                description: i18n.language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving changes',
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        const defaultContent = await resetHomeContent();
        setEditedContent(defaultContent);
        onContentChange(defaultContent);
        toast({
            title: i18n.language === 'ar' ? 'تمت الاستعادة' : 'Reset',
            description: i18n.language === 'ar' ? 'تمت استعادة المحتوى الافتراضي' : 'Default content restored'
        });
    };

    const updateField = (section: keyof HomeContent, field: string, value: any) => {
        setEditedContent(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [field]: value
            }
        }));
    };

    const updateNestedField = (section: keyof HomeContent, subsection: string, field: string, value: any) => {
        setEditedContent(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [subsection]: {
                    ...((prev[section] as any)[subsection]),
                    [field]: value
                }
            }
        }));
    };

    const tabs = [
        { id: 'general' as EditorTab, icon: Settings, label: i18n.language === 'ar' ? 'الإعدادات العامة' : 'General Settings' },
        { id: 'banners' as EditorTab, icon: Image, label: i18n.language === 'ar' ? 'البانرات' : 'Banners' },
        { id: 'sections' as EditorTab, icon: FileText, label: i18n.language === 'ar' ? 'أقسام الصفحة' : 'Page Sections' },
        { id: 'collections' as EditorTab, icon: Grid3x3, label: i18n.language === 'ar' ? 'المجموعات' : 'Collections' },
        { id: 'products' as EditorTab, icon: Package, label: i18n.language === 'ar' ? 'المنتجات' : 'Products' },
        { id: 'contact' as EditorTab, icon: Phone, label: i18n.language === 'ar' ? 'معلومات التواصل' : 'Contact Info' },
        { id: 'social' as EditorTab, icon: Share2, label: i18n.language === 'ar' ? 'وسائل التواصل' : 'Social Media' },
        { id: 'footer' as EditorTab, icon: FileText, label: i18n.language === 'ar' ? 'Footer' : 'Footer' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-arabic text-2xl font-bold text-slate-900">
                        {i18n.language === 'ar' ? 'إدارة محتوى الموقع' : 'Website Content Management'}
                    </h3>
                    <p className="font-arabic text-sm text-slate-500 mt-1">
                        {i18n.language === 'ar' ? 'تحكم في جميع محتويات وإعدادات الموقع' : 'Control all website content and settings'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-arabic font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
                    >
                        <RotateCcw size={18} />
                        <span>{i18n.language === 'ar' ? 'استعادة' : 'Reset'}</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-arabic font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSaving ? (i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (i18n.language === 'ar' ? 'حفظ' : 'Save')}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 flex gap-2 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-arabic font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* General Settings Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        {/* Site Settings */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                                {i18n.language === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={editedContent.siteSettings.siteName}
                                        onChange={(e) => updateField('siteSettings', 'siteName', e.target.value)}
                                        aria-label="Site Name English"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={editedContent.siteSettings.siteNameAr}
                                        onChange={(e) => updateField('siteSettings', 'siteNameAr', e.target.value)}
                                        dir="rtl"
                                        aria-label="Site Name Arabic"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={editedContent.siteSettings.primaryColor}
                                            onChange={(e) => updateField('siteSettings', 'primaryColor', e.target.value)}
                                            aria-label="Primary Color Picker"
                                            className="w-20 h-12 rounded-xl border-2 border-slate-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={editedContent.siteSettings.primaryColor}
                                            onChange={(e) => updateField('siteSettings', 'primaryColor', e.target.value)}
                                            aria-label="Primary Color Hex Value"
                                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={editedContent.siteSettings.secondaryColor}
                                            onChange={(e) => updateField('siteSettings', 'secondaryColor', e.target.value)}
                                            aria-label="Secondary Color Picker"
                                            className="w-20 h-12 rounded-xl border-2 border-slate-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={editedContent.siteSettings.secondaryColor}
                                            onChange={(e) => updateField('siteSettings', 'secondaryColor', e.target.value)}
                                            aria-label="Secondary Color Hex Value"
                                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ImageUploader
                                    currentImage={editedContent.siteSettings.logo}
                                    onImageChange={(imageData) => updateField('siteSettings', 'logo', imageData)}
                                    label={i18n.language === 'ar' ? 'شعار الموقع (Logo)' : 'Site Logo'}
                                    aspectRatio="aspect-[3/1]"
                                />
                                <ImageUploader
                                    currentImage={editedContent.siteSettings.favicon}
                                    onImageChange={(imageData) => updateField('siteSettings', 'favicon', imageData)}
                                    label={i18n.language === 'ar' ? 'أيقونة الموقع (Favicon)' : 'Site Favicon'}
                                    aspectRatio="aspect-square"
                                    maxSizeMB={1}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Banners Tab */}
                {activeTab === 'banners' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <BannerManager />
                    </div>
                )}

                {/* Page Sections Tab */}
                {activeTab === 'sections' && (
                    <div className="space-y-6">
                        {/* Announcement */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-arabic text-lg font-bold text-slate-900">
                                    {i18n.language === 'ar' ? 'شريط الإعلانات' : 'Announcement Bar'}
                                </h4>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editedContent.announcement.enabled}
                                        onChange={(e) => updateField('announcement', 'enabled', e.target.checked)}
                                        aria-label="Enable Announcement Bar"
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="font-arabic text-sm font-medium text-slate-700">
                                        {i18n.language === 'ar' ? 'تفعيل' : 'Enable'}
                                    </span>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'النص (إنجليزي)' : 'Text (English)'}
                                    </label>
                                    <textarea
                                        value={editedContent.announcement.text}
                                        onChange={(e) => updateField('announcement', 'text', e.target.value)}
                                        rows={3}
                                        aria-label="Announcement Text English"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'النص (عربي)' : 'Text (Arabic)'}
                                    </label>
                                    <textarea
                                        value={editedContent.announcement.textAr}
                                        onChange={(e) => updateField('announcement', 'textAr', e.target.value)}
                                        rows={3}
                                        dir="rtl"
                                        aria-label="Announcement Text Arabic"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                                {i18n.language === 'ar' ? 'قسم المميزات' : 'Features Section'}
                            </h4>
                            <div className="space-y-8">
                                {(['feature1', 'feature2', 'feature3'] as const).map((featureKey, idx) => (
                                    <div key={featureKey} className="p-6 bg-slate-50 rounded-2xl">
                                        <h5 className="font-arabic text-md font-bold text-slate-800 mb-4">
                                            {i18n.language === 'ar' ? `الميزة ${idx + 1}` : `Feature ${idx + 1}`}
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-arabic text-xs font-bold text-slate-600 mb-2">
                                                    {i18n.language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editedContent.features[featureKey].title}
                                                    onChange={(e) => updateNestedField('features', featureKey, 'title', e.target.value)}
                                                    aria-label={`Feature ${idx + 1} Title English`}
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-arabic text-xs font-bold text-slate-600 mb-2">
                                                    {i18n.language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editedContent.features[featureKey].titleAr}
                                                    onChange={(e) => updateNestedField('features', featureKey, 'titleAr', e.target.value)}
                                                    dir="rtl"
                                                    aria-label={`Feature ${idx + 1} Title Arabic`}
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-arabic text-xs font-bold text-slate-600 mb-2">
                                                    {i18n.language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editedContent.features[featureKey].description}
                                                    onChange={(e) => updateNestedField('features', featureKey, 'description', e.target.value)}
                                                    aria-label={`Feature ${idx + 1} Description English`}
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-arabic text-xs font-bold text-slate-600 mb-2">
                                                    {i18n.language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editedContent.features[featureKey].descriptionAr}
                                                    onChange={(e) => updateNestedField('features', featureKey, 'descriptionAr', e.target.value)}
                                                    dir="rtl"
                                                    aria-label={`Feature ${idx + 1} Description Arabic`}
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sections Toggle */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                                {i18n.language === 'ar' ? 'تفعيل الأقسام' : 'Enable Sections'}
                            </h4>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                    <span className="font-arabic font-bold text-slate-900">
                                        {i18n.language === 'ar' ? 'قسم المجموعات' : 'Collections Section'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={editedContent.collections.enabled}
                                        onChange={(e) => updateField('collections', 'enabled', e.target.checked)}
                                        aria-label="Enable Collections Section"
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                    <span className="font-arabic font-bold text-slate-900">
                                        {i18n.language === 'ar' ? 'قسم الأكثر مبيعاً' : 'Best Selling Section'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={editedContent.bestSelling.enabled}
                                        onChange={(e) => updateField('bestSelling', 'enabled', e.target.checked)}
                                        aria-label="Enable Best Selling Section"
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Collections Tab */}
                {activeTab === 'collections' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <CollectionManager />
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <ProductManager />
                    </div>
                )}

                {/* Contact Info Tab */}
                {activeTab === 'contact' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                            {i18n.language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                </label>
                                <input
                                    type="tel"
                                    value={editedContent.contactInfo.phone}
                                    onChange={(e) => updateField('contactInfo', 'phone', e.target.value)}
                                    dir="ltr"
                                    aria-label="Phone Number"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'واتساب' : 'WhatsApp'}
                                </label>
                                <input
                                    type="tel"
                                    value={editedContent.contactInfo.whatsapp}
                                    onChange={(e) => updateField('contactInfo', 'whatsapp', e.target.value)}
                                    dir="ltr"
                                    aria-label="WhatsApp Number"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                </label>
                                <input
                                    type="email"
                                    value={editedContent.contactInfo.email}
                                    onChange={(e) => updateField('contactInfo', 'email', e.target.value)}
                                    dir="ltr"
                                    aria-label="Email Address"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}
                                </label>
                                <input
                                    type="text"
                                    value={editedContent.contactInfo.address}
                                    onChange={(e) => updateField('contactInfo', 'address', e.target.value)}
                                    aria-label="Address English"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}
                                </label>
                                <input
                                    type="text"
                                    value={editedContent.contactInfo.addressAr}
                                    onChange={(e) => updateField('contactInfo', 'addressAr', e.target.value)}
                                    dir="rtl"
                                    aria-label="Address Arabic"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'ساعات العمل (إنجليزي)' : 'Working Hours (English)'}
                                </label>
                                <input
                                    type="text"
                                    value={editedContent.contactInfo.workingHours}
                                    onChange={(e) => updateField('contactInfo', 'workingHours', e.target.value)}
                                    aria-label="Working Hours English"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    {i18n.language === 'ar' ? 'ساعات العمل (عربي)' : 'Working Hours (Arabic)'}
                                </label>
                                <input
                                    type="text"
                                    value={editedContent.contactInfo.workingHoursAr}
                                    onChange={(e) => updateField('contactInfo', 'workingHoursAr', e.target.value)}
                                    dir="rtl"
                                    aria-label="Working Hours Arabic"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Social Media Tab */}
                {activeTab === 'social' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                            {i18n.language === 'ar' ? 'روابط وسائل التواصل الاجتماعي' : 'Social Media Links'}
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    Instagram
                                </label>
                                <input
                                    type="url"
                                    value={editedContent.socialMedia.instagram}
                                    onChange={(e) => updateField('socialMedia', 'instagram', e.target.value)}
                                    placeholder="https://instagram.com/..."
                                    dir="ltr"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    Facebook
                                </label>
                                <input
                                    type="url"
                                    value={editedContent.socialMedia.facebook}
                                    onChange={(e) => updateField('socialMedia', 'facebook', e.target.value)}
                                    placeholder="https://facebook.com/..."
                                    dir="ltr"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    Twitter / X
                                </label>
                                <input
                                    type="url"
                                    value={editedContent.socialMedia.twitter}
                                    onChange={(e) => updateField('socialMedia', 'twitter', e.target.value)}
                                    placeholder="https://twitter.com/..."
                                    dir="ltr"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    TikTok
                                </label>
                                <input
                                    type="url"
                                    value={editedContent.socialMedia.tiktok}
                                    onChange={(e) => updateField('socialMedia', 'tiktok', e.target.value)}
                                    placeholder="https://tiktok.com/@..."
                                    dir="ltr"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                    Snapchat
                                </label>
                                <input
                                    type="url"
                                    value={editedContent.socialMedia.snapchat}
                                    onChange={(e) => updateField('socialMedia', 'snapchat', e.target.value)}
                                    placeholder="https://snapchat.com/..."
                                    dir="ltr"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-display focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Tab */}
                {activeTab === 'footer' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="font-arabic text-lg font-bold text-slate-900 mb-6">
                            {i18n.language === 'ar' ? 'إعدادات الفوتر' : 'Footer Settings'}
                        </h4>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'نص عن الموقع (إنجليزي)' : 'About Text (English)'}
                                    </label>
                                    <textarea
                                        value={editedContent.footer.aboutText}
                                        onChange={(e) => updateField('footer', 'aboutText', e.target.value)}
                                        rows={4}
                                        aria-label="About Text English"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'نص عن الموقع (عربي)' : 'About Text (Arabic)'}
                                    </label>
                                    <textarea
                                        value={editedContent.footer.aboutTextAr}
                                        onChange={(e) => updateField('footer', 'aboutTextAr', e.target.value)}
                                        rows={4}
                                        dir="rtl"
                                        aria-label="About Text Arabic"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'نص الحقوق (إنجليزي)' : 'Copyright Text (English)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={editedContent.footer.copyrightText}
                                        onChange={(e) => updateField('footer', 'copyrightText', e.target.value)}
                                        aria-label="Copyright Text English"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-arabic text-sm font-bold text-slate-700 mb-2">
                                        {i18n.language === 'ar' ? 'نص الحقوق (عربي)' : 'Copyright Text (Arabic)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={editedContent.footer.copyrightTextAr}
                                        onChange={(e) => updateField('footer', 'copyrightTextAr', e.target.value)}
                                        dir="rtl"
                                        aria-label="Copyright Text Arabic"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="font-arabic font-bold text-slate-900">
                                    {i18n.language === 'ar' ? 'عرض أيقونات الدفع' : 'Show Payment Icons'}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={editedContent.footer.showPaymentIcons}
                                    onChange={(e) => updateField('footer', 'showPaymentIcons', e.target.checked)}
                                    aria-label="Show Payment Icons"
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Button */}
            <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl border-2 border-dashed border-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-arabic font-bold text-slate-900 mb-1">
                            {i18n.language === 'ar' ? 'معاينة التغييرات' : 'Preview Changes'}
                        </h5>
                        <p className="font-arabic text-sm text-slate-500">
                            {i18n.language === 'ar' ? 'احفظ التغييرات ثم افتح الصفحة الرئيسية لمشاهدة النتيجة' : 'Save changes then open the home page to see the result'}
                        </p>
                    </div>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-primary rounded-xl font-arabic font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <Eye size={18} />
                        <span>{i18n.language === 'ar' ? 'معاينة' : 'Preview'}</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Save, LayoutGrid, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { 
  SectionSettings, 
  loadSectionSettings, 
  saveSectionSettings 
} from '@/components/FeaturedSection';
import { loadHomeContent, saveHomeContent, HomeContent } from '@/lib/content';

export function SectionNamesManager() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [settings, setSettings] = useState<SectionSettings>(loadSectionSettings());
  const [homeContent, setHomeContent] = useState<HomeContent>(loadHomeContent());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(loadSectionSettings());
    setHomeContent(loadHomeContent());
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveSectionSettings(settings);
      saveHomeContent(homeContent);
      toast({
        title: isAr ? 'تم الحفظ' : 'Saved',
        description: isAr ? 'تم حفظ إعدادات الأقسام بنجاح' : 'Section settings saved successfully',
      });
    } catch (error) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل في حفظ الإعدادات' : 'Failed to save settings',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{isAr ? 'إدارة أسماء الأقسام' : 'Section Names Manager'}</h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? 'تخصيص عناوين أقسام الصفحة الرئيسية' : 'Customize home page section titles'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
        </button>
      </div>

      {/* قسم الأكثر طلباً */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            {isAr ? '1. قسم الأكثر طلباً' : '1. Best Selling Section'}
          </h3>
          <button
            onClick={() => setHomeContent({
              ...homeContent,
              bestSelling: {
                ...homeContent.bestSelling,
                enabled: !homeContent.bestSelling.enabled
              }
            })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              homeContent.bestSelling.enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {homeContent.bestSelling.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
            <span className="font-medium text-sm">
              {homeContent.bestSelling.enabled 
                ? (isAr ? 'مفعّل' : 'Enabled') 
                : (isAr ? 'معطّل' : 'Disabled')}
            </span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isAr ? 'العنوان (إنجليزي)' : 'Title (English)'}
            </label>
            <input
              type="text"
              value={homeContent.bestSelling.title}
              onChange={(e) => setHomeContent({
                ...homeContent,
                bestSelling: { ...homeContent.bestSelling, title: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Best Selling"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isAr ? 'العنوان (عربي)' : 'Title (Arabic)'}
            </label>
            <input
              type="text"
              value={homeContent.bestSelling.titleAr}
              onChange={(e) => setHomeContent({
                ...homeContent,
                bestSelling: { ...homeContent.bestSelling, titleAr: e.target.value }
              })}
              dir="rtl"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="الأكثر طلباً"
            />
          </div>
        </div>
      </div>

      {/* قسم المنتجات المميزة */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            {isAr ? '2. قسم المنتجات المميزة' : '2. Featured Products Section'}
          </h3>
          <button
            onClick={() => setSettings({
              ...settings,
              featured: {
                ...settings.featured,
                enabled: !settings.featured.enabled
              }
            })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              settings.featured.enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {settings.featured.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
            <span className="font-medium text-sm">
              {settings.featured.enabled 
                ? (isAr ? 'مفعّل' : 'Enabled') 
                : (isAr ? 'معطّل' : 'Disabled')}
            </span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isAr ? 'العنوان (إنجليزي)' : 'Title (English)'}
            </label>
            <input
              type="text"
              value={settings.featured.title}
              onChange={(e) => setSettings({
                ...settings,
                featured: { ...settings.featured, title: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Featured Products"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isAr ? 'العنوان (عربي)' : 'Title (Arabic)'}
            </label>
            <input
              type="text"
              value={settings.featured.titleAr}
              onChange={(e) => setSettings({
                ...settings,
                featured: { ...settings.featured, titleAr: e.target.value }
              })}
              dir="rtl"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="المنتجات المميزة"
            />
          </div>
        </div>
      </div>

      {/* معاينة */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Eye size={18} />
          {isAr ? 'معاينة' : 'Preview'}
        </h4>
        <div className="space-y-4">
          {homeContent.bestSelling.enabled && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">{isAr ? 'قسم 1:' : 'Section 1:'}</p>
              <p className="font-bold text-lg">
                {isAr ? homeContent.bestSelling.titleAr : homeContent.bestSelling.title}
              </p>
            </div>
          )}
          {settings.featured.enabled && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">{isAr ? 'قسم 2:' : 'Section 2:'}</p>
              <p className="font-bold text-lg">
                {isAr ? settings.featured.titleAr : settings.featured.title}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

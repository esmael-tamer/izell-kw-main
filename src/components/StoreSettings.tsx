import { useState, useEffect } from 'react';
import { 
  Settings, Save, Loader2, Store, Phone, Mail, MapPin, 
  Globe, Facebook, Instagram, MessageCircle, Clock, Image,
  CreditCard, Truck, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface StoreSettings {
  // Basic Info
  store_name: string;
  store_name_ar: string;
  tagline: string;
  tagline_ar: string;
  logo_url: string;
  
  // Contact
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  address_ar: string;
  
  // Social Media
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  
  // Shipping
  free_shipping_threshold: number;
  delivery_fee: number;
  delivery_days: string;
  delivery_days_ar: string;
  
  // Currency
  currency: string;
  currency_symbol: string;
  
  // Working Hours
  working_hours: string;
  working_hours_ar: string;
  
  // Other
  announcement_text: string;
  announcement_text_ar: string;
  show_announcement: boolean;
}

const defaultSettings: StoreSettings = {
  store_name: 'izell',
  store_name_ar: 'آيزل',
  tagline: 'Your Fashion Destination',
  tagline_ar: 'وجهتك للأزياء',
  logo_url: '',
  email: 'info@izell.com',
  phone: '+965 1234 5678',
  whatsapp: '+96512345678',
  address: 'Kuwait City, Kuwait',
  address_ar: 'مدينة الكويت، الكويت',
  instagram: 'https://instagram.com/izell',
  facebook: 'https://facebook.com/izell',
  twitter: '',
  tiktok: '',
  free_shipping_threshold: 25,
  delivery_fee: 2,
  delivery_days: '2-3 business days',
  delivery_days_ar: '2-3 أيام عمل',
  currency: 'KWD',
  currency_symbol: 'د.ك',
  working_hours: 'Sun - Thu: 9AM - 9PM',
  working_hours_ar: 'الأحد - الخميس: 9ص - 9م',
  announcement_text: 'Free shipping on orders over 25 KWD!',
  announcement_text_ar: 'شحن مجاني للطلبات فوق 25 د.ك!',
  show_announcement: true,
};

export function StoreSettings() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'social' | 'shipping' | 'other'>('basic');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for first time
        throw error;
      }

      if (data) {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      // Use default settings if table doesn't exist or is empty
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .single();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('store_settings')
          .update(settings)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('store_settings')
          .insert([settings]);

        if (error) throw error;
      }

      toast({
        title: isAr ? 'تم الحفظ' : 'Saved',
        description: isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل حفظ الإعدادات. تأكد من إنشاء جدول store_settings في قاعدة البيانات' : 'Failed to save settings. Make sure store_settings table exists in database',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'basic', label: isAr ? 'معلومات أساسية' : 'Basic Info', icon: Store },
    { id: 'contact', label: isAr ? 'معلومات الاتصال' : 'Contact', icon: Phone },
    { id: 'social', label: isAr ? 'وسائل التواصل' : 'Social Media', icon: Globe },
    { id: 'shipping', label: isAr ? 'الشحن والتوصيل' : 'Shipping', icon: Truck },
    { id: 'other', label: isAr ? 'إعدادات أخرى' : 'Other', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          {isAr ? 'إعدادات المتجر' : 'Store Settings'}
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
          {isAr ? 'حفظ التغييرات' : 'Save Changes'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">{isAr ? 'ملاحظة' : 'Note'}</p>
          <p>{isAr ? 'تأكد من إنشاء جدول store_settings في قاعدة البيانات قبل الحفظ' : 'Make sure to create store_settings table in database before saving'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              {isAr ? 'معلومات المتجر الأساسية' : 'Basic Store Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="store_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}
                </label>
                <input
                  id="store_name"
                  type="text"
                  value={settings.store_name}
                  onChange={(e) => updateSetting('store_name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="store_name_ar" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}
                </label>
                <input
                  id="store_name_ar"
                  type="text"
                  value={settings.store_name_ar}
                  onChange={(e) => updateSetting('store_name_ar', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="rtl"
                />
              </div>
              <div>
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'الشعار (إنجليزي)' : 'Tagline (English)'}
                </label>
                <input
                  id="tagline"
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => updateSetting('tagline', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="tagline_ar" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'الشعار (عربي)' : 'Tagline (Arabic)'}
                </label>
                <input
                  id="tagline_ar"
                  type="text"
                  value={settings.tagline_ar}
                  onChange={(e) => updateSetting('tagline_ar', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isAr ? 'شعار المتجر' : 'Store Logo'}
              </label>
              <div className="flex items-center gap-4">
                {settings.logo_url && (
                  <img 
                    src={settings.logo_url} 
                    alt="Logo" 
                    className="w-20 h-20 object-contain border rounded-lg"
                  />
                )}
                <input
                  type="text"
                  value={settings.logo_url}
                  onChange={(e) => updateSetting('logo_url', e.target.value)}
                  placeholder={isAr ? 'رابط صورة الشعار' : 'Logo image URL'}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              {isAr ? 'معلومات الاتصال' : 'Contact Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail size={14} className="inline mr-1" />
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone size={14} className="inline mr-1" />
                  {isAr ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSetting('phone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  <MessageCircle size={14} className="inline mr-1" />
                  {isAr ? 'واتساب' : 'WhatsApp'}
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={settings.whatsapp}
                  onChange={(e) => updateSetting('whatsapp', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="working_hours" className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock size={14} className="inline mr-1" />
                  {isAr ? 'ساعات العمل (إنجليزي)' : 'Working Hours (English)'}
                </label>
                <input
                  id="working_hours"
                  type="text"
                  value={settings.working_hours}
                  onChange={(e) => updateSetting('working_hours', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin size={14} className="inline mr-1" />
                  {isAr ? 'العنوان (إنجليزي)' : 'Address (English)'}
                </label>
                <input
                  id="address"
                  type="text"
                  value={settings.address}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address_ar" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin size={14} className="inline mr-1" />
                  {isAr ? 'العنوان (عربي)' : 'Address (Arabic)'}
                </label>
                <input
                  id="address_ar"
                  type="text"
                  value={settings.address_ar}
                  onChange={(e) => updateSetting('address_ar', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              {isAr ? 'وسائل التواصل الاجتماعي' : 'Social Media Links'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  <Instagram size={14} className="inline mr-1" />
                  Instagram
                </label>
                <input
                  id="instagram"
                  type="url"
                  value={settings.instagram}
                  onChange={(e) => updateSetting('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                  <Facebook size={14} className="inline mr-1" />
                  Facebook
                </label>
                <input
                  id="facebook"
                  type="url"
                  value={settings.facebook}
                  onChange={(e) => updateSetting('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter / X
                </label>
                <input
                  id="twitter"
                  type="url"
                  value={settings.twitter}
                  onChange={(e) => updateSetting('twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                  TikTok
                </label>
                <input
                  id="tiktok"
                  type="url"
                  value={settings.tiktok}
                  onChange={(e) => updateSetting('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              {isAr ? 'إعدادات الشحن والتوصيل' : 'Shipping Settings'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="free_shipping" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'حد الشحن المجاني' : 'Free Shipping Threshold'} (KWD)
                </label>
                <input
                  id="free_shipping"
                  type="number"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => updateSetting('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  step="0.5"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="delivery_fee" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'رسوم التوصيل' : 'Delivery Fee'} (KWD)
                </label>
                <input
                  id="delivery_fee"
                  type="number"
                  value={settings.delivery_fee}
                  onChange={(e) => updateSetting('delivery_fee', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  step="0.5"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="delivery_days" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'مدة التوصيل (إنجليزي)' : 'Delivery Time (English)'}
                </label>
                <input
                  id="delivery_days"
                  type="text"
                  value={settings.delivery_days}
                  onChange={(e) => updateSetting('delivery_days', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="delivery_days_ar" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'مدة التوصيل (عربي)' : 'Delivery Time (Arabic)'}
                </label>
                <input
                  id="delivery_days_ar"
                  type="text"
                  value={settings.delivery_days_ar}
                  onChange={(e) => updateSetting('delivery_days_ar', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="rtl"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard size={14} className="inline mr-1" />
                  {isAr ? 'العملة' : 'Currency Code'}
                </label>
                <input
                  id="currency"
                  type="text"
                  value={settings.currency}
                  onChange={(e) => updateSetting('currency', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="currency_symbol" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'رمز العملة' : 'Currency Symbol'}
                </label>
                <input
                  id="currency_symbol"
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => updateSetting('currency_symbol', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'other' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              {isAr ? 'إعدادات أخرى' : 'Other Settings'}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="show_announcement"
                  type="checkbox"
                  checked={settings.show_announcement}
                  onChange={(e) => updateSetting('show_announcement', e.target.checked)}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="show_announcement" className="text-sm font-medium text-gray-700 cursor-pointer">
                  {isAr ? 'إظهار شريط الإعلان' : 'Show Announcement Bar'}
                </label>
              </div>
              
              <div>
                <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'نص الإعلان (إنجليزي)' : 'Announcement Text (English)'}
                </label>
                <input
                  id="announcement"
                  type="text"
                  value={settings.announcement_text}
                  onChange={(e) => updateSetting('announcement_text', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="announcement_ar" className="block text-sm font-medium text-gray-700 mb-1">
                  {isAr ? 'نص الإعلان (عربي)' : 'Announcement Text (Arabic)'}
                </label>
                <input
                  id="announcement_ar"
                  type="text"
                  value={settings.announcement_text_ar}
                  onChange={(e) => updateSetting('announcement_text_ar', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

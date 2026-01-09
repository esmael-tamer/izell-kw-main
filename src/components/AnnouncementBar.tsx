import { Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadHomeContent } from '@/lib/content';
import { useEffect, useState } from 'react';

export function AnnouncementBar() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState(loadHomeContent());

  // تحديث المحتوى عند تغييره في localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setContent(loadHomeContent());
    };

    window.addEventListener('storage', handleStorageChange);
    // تحديث دوري للتحقق من التغييرات
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!content.announcement.enabled) {
    return null;
  }

  const text = i18n.language === 'ar' ? content.announcement.textAr : content.announcement.text;

  return (
    <div className="bg-black text-white py-2 overflow-hidden">
      <div className="animate-scroll-rtl">
        <p className="font-arabic text-sm flex items-center justify-center gap-2 whitespace-nowrap">
          <Truck size={16} />
          <span>{text}</span>
          <span className="mx-8">•</span>
          <Truck size={16} />
          <span>{text}</span>
          <span className="mx-8">•</span>
          <Truck size={16} />
          <span>{text}</span>
        </p>
      </div>
    </div>
  );
}

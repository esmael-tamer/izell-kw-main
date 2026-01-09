import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PaymentIcons } from './PaymentIcons';
import { useState, useEffect } from 'react';
import { loadHomeContent, fetchHomeContent, HomeContent } from '@/lib/content';

export function Footer() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [content, setContent] = useState<HomeContent | null>(null);

  useEffect(() => {
    // Load from localStorage first (fast)
    const localContent = loadHomeContent();
    console.log('📱 Footer loaded from localStorage:', localContent.contactInfo);
    setContent(localContent);
    
    // Then fetch from Supabase (background)
    fetchHomeContent().then(data => {
      console.log('☁️ Footer loaded from Supabase:', data.contactInfo);
      setContent(data);
    });
    
    // Listen for content updates
    const handleContentUpdate = () => {
      const updated = loadHomeContent();
      console.log('🔄 Footer content updated:', updated.contactInfo);
      setContent(updated);
    };
    
    window.addEventListener('contentUpdated', handleContentUpdate);
    window.addEventListener('storage', handleContentUpdate);
    
    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate);
      window.removeEventListener('storage', handleContentUpdate);
    };
  }, []);

  // Default values
  const phone = content?.contactInfo?.phone || '+965 6333 0440';
  const email = content?.contactInfo?.email || 'info@izel.kw';
  const address = isAr 
    ? (content?.contactInfo?.addressAr || 'الكويت') 
    : (content?.contactInfo?.address || 'Kuwait');
  const instagram = content?.socialMedia?.instagram || 'https://instagram.com';
  const facebook = content?.socialMedia?.facebook || '';
  const tiktok = content?.socialMedia?.tiktok || '';
  const snapchat = content?.socialMedia?.snapchat || '';

  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & About */}
          <div className="lg:col-span-1 text-center md:text-start">
            <h3 className="font-display text-4xl text-foreground mb-6 font-medium tracking-tight italic">izel</h3>
            <p className="font-arabic text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-start">
            <h4 className="font-arabic font-bold text-foreground mb-6 uppercase tracking-wider text-xs">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/shop" className="font-arabic text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('nav.shop')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="font-arabic text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('about.title')}
                </Link>
              </li>
              <li>
                <Link to="/shop?category=new" className="font-arabic text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('nav.new')}
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="font-arabic text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.trackOrder', 'تتبع الطلب')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="font-arabic text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.privacyPolicy', 'سياسة الخصوصية')}
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="font-arabic text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.termsOfService', 'شروط الخدمة')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="text-center md:text-start">
            <h4 className="font-arabic font-bold text-foreground mb-6 uppercase tracking-wider text-xs">
              {t('footer.contact')}
            </h4>
            <div className="space-y-4">
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                  <Phone size={14} />
                </div>
                <span className="font-display">{phone}</span>
              </a>
              <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground text-sm">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                  <MapPin size={14} />
                </div>
                <span className="font-arabic">{address}</span>
              </div>
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                  <Mail size={14} />
                </div>
                <span className="font-display">{email}</span>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center md:text-start">
            <h4 className="font-arabic font-bold text-foreground mb-6 uppercase tracking-wider text-xs">
              {t('footer.followUs')}
            </h4>
            <div className="flex justify-center md:justify-start gap-4">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
                  aria-label="TikTok"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              )}
              {snapchat && (
                <a
                  href={snapchat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
                  aria-label="Snapchat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-16 pt-8">
          {/* Media Trend Credit */}
          <div className="flex items-center justify-center mb-4">
            <a 
              href="https://mediatrendkw.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full transition-all shadow-lg"
            >
              <span className="font-arabic text-sm text-slate-300">بدعم من</span>
              <img 
                src="https://soapy-bubbles.com/media-trend.png" 
                alt="Media Trend" 
                className="h-5 w-auto"
              />
            </a>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-arabic text-xs text-muted-foreground">
              {t('footer.allRightsReserved')}
            </p>
            <PaymentIcons />
          </div>
        </div>
      </div>
    </footer>
  );
}

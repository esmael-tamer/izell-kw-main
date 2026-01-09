import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all border border-border/50 hover:border-border group"
            aria-label={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <Globe size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="font-bold text-sm text-foreground">
                {i18n.language === 'ar' ? 'EN' : 'ع'}
            </span>
        </button>
    );
}

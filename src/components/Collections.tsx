import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadHomeContent } from '@/lib/content';
import { loadCollections } from '@/lib/collections';
import { useEffect, useState } from 'react';

export function Collections() {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState(loadHomeContent());
  const [collections, setCollections] = useState(loadCollections());

  useEffect(() => {
    const handleContentUpdate = () => {
      setContent(loadHomeContent());
    };
    const handleCollectionsUpdate = () => {
      setCollections(loadCollections());
    };

    window.addEventListener('contentUpdated', handleContentUpdate);
    window.addEventListener('collectionsUpdated', handleCollectionsUpdate);

    const interval = setInterval(() => {
      setContent(loadHomeContent());
      setCollections(loadCollections());
    }, 1000);

    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate);
      window.removeEventListener('collectionsUpdated', handleCollectionsUpdate);
      clearInterval(interval);
    };
  }, []);

  if (!content.collections.enabled) {
    return null;
  }

  const title = i18n.language === 'ar' ? content.collections.titleAr : content.collections.title;
  const enabledCollections = collections.filter(c => c.enabled);

  if (enabledCollections.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="font-arabic text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
            {title}
          </h2>
          <div className="w-16 h-1 bg-primary"></div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {enabledCollections.map((collection) => (
            <Link
              key={collection.id}
              to={collection.link}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary mb-4 shadow-sm group-hover:shadow-lg transition-all duration-500">
                <img
                  src={collection.image}
                  alt={i18n.language === 'ar' ? collection.nameAr : collection.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500"></div>
              </div>
              <div className="text-center group">
                <p className="font-arabic text-lg font-semibold text-foreground tracking-wide group-hover:text-primary transition-colors duration-300">
                  {i18n.language === 'ar' ? collection.nameAr : collection.nameEn}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {t('home.exploreCollection')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

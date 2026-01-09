import { Truck, Shield, Sparkles, Award, Headphones, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadHomeContent } from '@/lib/content';
import { useEffect, useState } from 'react';

const iconMap = {
  truck: Truck,
  shield: Shield,
  sparkles: Sparkles,
  award: Award,
  headphones: Headphones,
  package: Package,
};

export function FeaturesBanner() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState(loadHomeContent());

  useEffect(() => {
    const handleStorageChange = () => {
      setContent(loadHomeContent());
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const features = [
    {
      icon: iconMap[content.features.feature1.icon as keyof typeof iconMap] || Truck,
      title: i18n.language === 'ar' ? content.features.feature1.titleAr : content.features.feature1.title,
      description: i18n.language === 'ar' ? content.features.feature1.descriptionAr : content.features.feature1.description,
    },
    {
      icon: iconMap[content.features.feature2.icon as keyof typeof iconMap] || Shield,
      title: i18n.language === 'ar' ? content.features.feature2.titleAr : content.features.feature2.title,
      description: i18n.language === 'ar' ? content.features.feature2.descriptionAr : content.features.feature2.description,
    },
    {
      icon: iconMap[content.features.feature3.icon as keyof typeof iconMap] || Sparkles,
      title: i18n.language === 'ar' ? content.features.feature3.titleAr : content.features.feature3.title,
      description: i18n.language === 'ar' ? content.features.feature3.descriptionAr : content.features.feature3.description,
    },
  ];

  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-arabic font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="font-arabic text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

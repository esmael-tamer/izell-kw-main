import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useTranslation } from 'react-i18next';

export default function About() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="font-arabic text-4xl md:text-5xl font-bold text-foreground mb-4">
                            {t('about.title')}
                        </h1>
                        <div className="w-24 h-1 bg-primary mx-auto"></div>
                    </div>

                    {/* Story Section */}
                    <div className="mb-16">
                        <h2 className="font-arabic text-2xl md:text-3xl font-semibold text-foreground mb-6">
                            {t('about.ourStory')}
                        </h2>
                        <p className="font-arabic text-lg text-muted-foreground leading-relaxed mb-4">
                            {t('about.storyText1')}
                        </p>
                        <p className="font-arabic text-lg text-muted-foreground leading-relaxed">
                            {t('about.storyText2')}
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="mb-16">
                        <h2 className="font-arabic text-2xl md:text-3xl font-semibold text-foreground mb-6">
                            {t('about.ourMission')}
                        </h2>
                        <p className="font-arabic text-lg text-muted-foreground leading-relaxed">
                            {t('about.missionText')}
                        </p>
                    </div>

                    {/* Values Section */}
                    <div className="mb-16">
                        <h2 className="font-arabic text-2xl md:text-3xl font-semibold text-foreground mb-8">
                            {t('about.ourValues')}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">✨</span>
                                </div>
                                <h3 className="font-arabic text-xl font-semibold text-foreground mb-2">
                                    {t('about.value1Title')}
                                </h3>
                                <p className="font-arabic text-muted-foreground">
                                    {t('about.value1Text')}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🎨</span>
                                </div>
                                <h3 className="font-arabic text-xl font-semibold text-foreground mb-2">
                                    {t('about.value2Title')}
                                </h3>
                                <p className="font-arabic text-muted-foreground">
                                    {t('about.value2Text')}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">💎</span>
                                </div>
                                <h3 className="font-arabic text-xl font-semibold text-foreground mb-2">
                                    {t('about.value3Title')}
                                </h3>
                                <p className="font-arabic text-muted-foreground">
                                    {t('about.value3Text')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="bg-primary/5 rounded-lg p-8 text-center">
                        <h2 className="font-arabic text-2xl font-semibold text-foreground mb-4">
                            {t('about.contactTitle')}
                        </h2>
                        <p className="font-arabic text-muted-foreground mb-6">
                            {t('about.contactText')}
                        </p>
                        <a
                            href="https://wa.me/96599999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-arabic font-medium hover:bg-primary/90 transition-colors"
                        >
                            {t('about.contactButton')}
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
            <WhatsAppButton />
        </div>
    );
}

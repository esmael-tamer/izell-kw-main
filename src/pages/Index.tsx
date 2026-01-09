import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { BestSelling } from '@/components/BestSelling';
import { FeaturedSection } from '@/components/FeaturedSection';
import { CustomerTestimonials } from '@/components/CustomerTestimonials';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        <HeroBanner />
        <BestSelling />
        <FeaturedSection />
        <CustomerTestimonials />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

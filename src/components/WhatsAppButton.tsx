import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadHomeContent, fetchHomeContent } from '@/lib/content';

export function WhatsAppButton() {
    const [phoneNumber, setPhoneNumber] = useState('96563330440');
    
    useEffect(() => {
        // Load from localStorage first
        const content = loadHomeContent();
        if (content.contactInfo?.whatsapp) {
            setPhoneNumber(content.contactInfo.whatsapp.replace(/[^0-9]/g, ''));
        }
        
        // Then fetch from Supabase
        fetchHomeContent().then(data => {
            if (data.contactInfo?.whatsapp) {
                setPhoneNumber(data.contactInfo.whatsapp.replace(/[^0-9]/g, ''));
            }
        });
        
        // Listen for updates
        const handleUpdate = () => {
            const updated = loadHomeContent();
            if (updated.contactInfo?.whatsapp) {
                setPhoneNumber(updated.contactInfo.whatsapp.replace(/[^0-9]/g, ''));
            }
        };
        
        window.addEventListener('contentUpdated', handleUpdate);
        return () => window.removeEventListener('contentUpdated', handleUpdate);
    }, []);
    
    const message = 'مرحباً، أود الاستفسار عن المنتجات';

    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-24 md:bottom-8 left-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 animate-fade-in ring-4 ring-white"
            aria-label="Contact us on WhatsApp"
        >
            <MessageCircle size={28} />
        </button>
    );
}

// Collections Management System - نظام إدارة المجموعات

export interface Collection {
    id: string;
    nameAr: string;
    nameEn: string;
    image: string;
    link: string;
    order: number;
    enabled: boolean;
}

// المجموعات الافتراضية
export const defaultCollections: Collection[] = [
    {
        id: '1',
        nameAr: 'مناسبات',
        nameEn: 'OCCASIONS',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop',
        link: '/shop?category=dresses',
        order: 1,
        enabled: true
    },
    {
        id: '2',
        nameAr: 'تخفيضات',
        nameEn: 'SALE',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop',
        link: '/shop',
        order: 2,
        enabled: true
    },
    {
        id: '3',
        nameAr: 'المجموعة الجديدة',
        nameEn: 'NEW COLLECTION',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop',
        link: '/shop?category=new',
        order: 3,
        enabled: true
    },
    {
        id: '4',
        nameAr: 'العروس',
        nameEn: 'BRIDAL',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop',
        link: '/shop?category=bridal',
        order: 4,
        enabled: true
    },
];

// حفظ المجموعات في localStorage
export const saveCollections = (collections: Collection[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('collections', JSON.stringify(collections));
        window.dispatchEvent(new Event('collectionsUpdated'));
    }
};

// تحميل المجموعات من localStorage
export const loadCollections = (): Collection[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('collections');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return defaultCollections;
            }
        }
    }
    return defaultCollections;
};

// إضافة مجموعة جديدة
export const addCollection = (collection: Omit<Collection, 'id' | 'order'>): Collection => {
    const collections = loadCollections();
    const newCollection: Collection = {
        ...collection,
        id: Date.now().toString(),
        order: collections.length + 1
    };
    collections.push(newCollection);
    saveCollections(collections);
    return newCollection;
};

// تحديث مجموعة
export const updateCollection = (id: string, updates: Partial<Collection>) => {
    const collections = loadCollections();
    const index = collections.findIndex(c => c.id === id);
    if (index !== -1) {
        collections[index] = { ...collections[index], ...updates };
        saveCollections(collections);
    }
};

// حذف مجموعة
export const deleteCollection = (id: string) => {
    const collections = loadCollections();
    const filtered = collections.filter(c => c.id !== id);
    // إعادة ترتيب
    filtered.forEach((c, idx) => {
        c.order = idx + 1;
    });
    saveCollections(filtered);
};

// إعادة ترتيب المجموعات
export const reorderCollections = (collectionId: string, direction: 'up' | 'down') => {
    const collections = loadCollections();
    const index = collections.findIndex(c => c.id === collectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
        [collections[index], collections[index - 1]] = [collections[index - 1], collections[index]];
    } else if (direction === 'down' && index < collections.length - 1) {
        [collections[index], collections[index + 1]] = [collections[index + 1], collections[index]];
    }

    // تحديث الترتيب
    collections.forEach((c, idx) => {
        c.order = idx + 1;
    });

    saveCollections(collections);
};

// إعادة تعيين المجموعات للافتراضي
export const resetCollections = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('collections');
        window.dispatchEvent(new Event('collectionsUpdated'));
    }
    return defaultCollections;
};

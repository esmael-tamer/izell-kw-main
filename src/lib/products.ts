// Products Management System - نظام إدارة المنتجات
import { Product } from './types';
import { products as defaultProducts } from './data';

// حفظ المنتجات في localStorage
export const saveProducts = (products: Product[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('products', JSON.stringify(products));
        window.dispatchEvent(new Event('productsUpdated'));
    }
};

// تحميل المنتجات من localStorage
export const loadProducts = (): Product[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('products');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return defaultProducts;
            }
        }
    }
    return defaultProducts;
};

// إضافة منتج جديد
export const addProduct = (product: Omit<Product, 'id'>): Product => {
    const products = loadProducts();
    const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
};

// تحديث منتج
export const updateProduct = (id: string, updates: Partial<Product>) => {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        saveProducts(products);
    }
};

// حذف منتج
export const deleteProduct = (id: string) => {
    const products = loadProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
};

// إعادة تعيين المنتجات للافتراضي
export const resetProducts = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('products');
        window.dispatchEvent(new Event('productsUpdated'));
    }
    return defaultProducts;
};

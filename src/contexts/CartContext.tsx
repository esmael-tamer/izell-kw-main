import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '@/lib/types';

const CART_STORAGE_KEY = 'izell_cart_items';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// تحميل السلة من localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return [];
};

// حفظ السلة في localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // حفظ السلة عند كل تغيير
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = (product: Product, selectedSize: string, selectedColor: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { product, quantity, selectedSize, selectedColor }];
    });
    // فتح السلة تلقائياً عند إضافة منتج
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

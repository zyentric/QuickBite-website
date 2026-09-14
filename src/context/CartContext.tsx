import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, MenuItem } from '../types';

export const getItemKey = (item?: { id?: string; _id?: string } | null): string => {
  if (!item) return '';
  return String(item.id || item._id || '').trim();
};

export const areItemsEqual = (
  a?: { id?: string; _id?: string } | null,
  b?: { id?: string; _id?: string } | null
): boolean => {
  const keyA = getItemKey(a);
  const keyB = getItemKey(b);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
};

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  getItemQuantity: (item?: { id?: string; _id?: string } | null) => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'quickbite_cart_items';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      // Clean and normalize stored items
      return parsed
        .filter(i => !!getItemKey(i))
        .map(i => {
          const key = getItemKey(i);
          return {
            ...i,
            id: key,
            _id: key,
            quantity: Math.max(1, Number(i.quantity) || 1),
          };
        });
    } catch {
      return [];
    }
  });

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      /* noop */
    }
  }, [cartItems]);

  const addToCart = useCallback((item: MenuItem) => {
    const key = getItemKey(item);
    if (!key) return;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => getItemKey(i) === key);
      if (existingIndex > -1) {
        return prev.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      const normalizedItem: CartItem = {
        ...item,
        id: key,
        _id: key,
        quantity: 1,
      };
      return [...prev, normalizedItem];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const targetKey = String(id || '').trim();
    if (!targetKey) return;
    setCartItems(prev => prev.filter(i => getItemKey(i) !== targetKey));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    const targetKey = String(id || '').trim();
    if (!targetKey) return;

    if (qty <= 0) {
      setCartItems(prev => prev.filter(i => getItemKey(i) !== targetKey));
      return;
    }

    setCartItems(prev =>
      prev.map(i =>
        getItemKey(i) === targetKey ? { ...i, quantity: qty } : i
      )
    );
  }, []);

  const getItemQuantity = useCallback(
    (item?: { id?: string; _id?: string } | null): number => {
      const key = getItemKey(item);
      if (!key) return 0;
      const found = cartItems.find(i => getItemKey(i) === key);
      return found ? found.quantity : 0;
    },
    [cartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  }, []);

  const totalItems = cartItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};

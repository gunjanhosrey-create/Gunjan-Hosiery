import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  name: string;
  variant_title?: string;
  sku?: string;
  price: number;
  image?: string;
}

interface CartCtx {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (product_id: string, variant_id?: string) => void;
  updateQty: (product_id: string, variant_id: string | undefined, qty: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartCtx | undefined>(undefined);
const KEY = 'ecom_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(KEY) || '[]'));
    } catch { setCart([]); }
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setCart(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const addToCart: CartCtx['addToCart'] = (item, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex(i => i.product_id === item.product_id && i.variant_id === item.variant_id);
      let next: CartItem[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      } else {
        next = [...prev, { ...item, quantity: qty }];
      }
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart: CartCtx['removeFromCart'] = (pid, vid) => {
    persist(cart.filter(i => !(i.product_id === pid && i.variant_id === vid)));
  };

  const updateQty: CartCtx['updateQty'] = (pid, vid, qty) => {
    if (qty <= 0) return removeFromCart(pid, vid);
    persist(cart.map(i => (i.product_id === pid && i.variant_id === vid ? { ...i, quantity: qty } : i)));
  };

  const clearCart = () => persist([]);

  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

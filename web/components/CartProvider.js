'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);
const KEY = 'tgf_cart_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(KEY) || '[]'));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item, { silent = false } = {}) => {
    setItems((list) => {
      const key = item.productId + JSON.stringify(item.options || {});
      const found = list.find((x) => x.key === key);
      if (found) return list.map((x) => (x.key === key ? { ...x, qty: x.qty + item.qty } : x));
      return [...list, { ...item, key }];
    });
    if (silent) return;
    setToast(item.name);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo(
    () => ({
      items,
      ready,
      add,
      setQty: (key, qty) => setItems((l) => l.map((x) => (x.key === key ? { ...x, qty: Math.max(1, qty) } : x))),
      remove: (key) => setItems((l) => l.filter((x) => x.key !== key)),
      clear: () => setItems([]),
      count: items.reduce((s, x) => s + x.qty, 0),
      subtotal: items.reduce((s, x) => s + x.price * x.qty, 0),
    }),
    [items, ready, add]
  );

  return (
    <CartCtx.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-rise rounded-2xl bg-ink px-5 py-4 text-sm text-white shadow-2xl sm:bottom-8">
          <span className="text-gold">Added to cart · </span>
          {toast}
        </div>
      )}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);

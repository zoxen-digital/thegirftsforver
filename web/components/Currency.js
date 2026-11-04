'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'tgf_currency';
const CurrencyCtx = createContext({ code: 'PKR', setCode: () => {}, format: (n) => String(n), codes: ['PKR'] });

/** Display-only conversion: orders are always placed and stored in PKR. */
export function CurrencyProvider({ rates, children }) {
  const [code, setCode] = useState('PKR');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && rates[saved]) setCode(saved);
    } catch {}
  }, [rates]);

  const value = useMemo(
    () => ({
      code,
      codes: Object.keys(rates),
      setCode: (c) => {
        setCode(c);
        try { localStorage.setItem(KEY, c); } catch {}
      },
      format: (n) => {
        const v = Number(n || 0) * (rates[code] || 1);
        return code === 'PKR'
          ? 'PKR ' + Math.round(v).toLocaleString('en-PK')
          : `${code} ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    }),
    [code, rates]
  );

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export const useCurrency = () => useContext(CurrencyCtx);

export function Price({ value }) {
  return <>{useCurrency().format(value)}</>;
}

export function CurrencySelect({ className = '' }) {
  const { code, codes, setCode } = useCurrency();
  return (
    <select aria-label="Currency" value={code} onChange={(e) => setCode(e.target.value)} className={`rounded-full border border-ink/15 bg-white px-3 py-2 text-sm font-medium ${className}`}>
      {codes.map((c) => <option key={c}>{c}</option>)}
    </select>
  );
}

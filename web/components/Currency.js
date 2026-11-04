'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IconChevronDown, IconGlobe } from './Icons';

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
    <label className={`relative flex items-center gap-2 rounded-lg bg-wine py-2.5 pl-3 pr-2.5 text-sm font-bold text-white transition hover:bg-wine-dark ${className}`}>
      <IconGlobe width={20} height={20} />
      {code}
      <IconChevronDown width={16} height={16} />
      <select aria-label="Currency" value={code} onChange={(e) => setCode(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        {codes.map((c) => <option key={c} className="text-ink">{c}</option>)}
      </select>
    </label>
  );
}

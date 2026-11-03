'use client';

import { useEffect, useState } from 'react';

const cache = {};

export function useOptions(type) {
  const [items, setItems] = useState(cache[type] || []);
  useEffect(() => {
    if (!type) return;
    let alive = true;
    fetch(`/api/admin/options?type=${type}`)
      .then((r) => r.json())
      .then((d) => {
        cache[type] = d.items || [];
        if (alive) setItems(cache[type]);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [type]);
  return items;
}

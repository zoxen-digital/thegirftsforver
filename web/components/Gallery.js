'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Gallery({ images, alt, discount }) {
  const [i, setI] = useState(0);
  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-blush">
        <Image key={images[i]} src={images[i]} alt={alt} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="animate-rise object-cover" />
        {discount > 0 && <span className="absolute left-4 top-4 rounded-full bg-wine px-3 py-1.5 text-xs font-bold text-white">Save {discount}%</span>}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
          {images.map((src, k) => (
            <button
              key={src + k}
              onClick={() => setI(k)}
              aria-label={`Image ${k + 1}`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${k === i ? 'border-wine' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

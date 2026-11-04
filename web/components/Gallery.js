'use client';

import Image from 'next/image';
import { useState } from 'react';

const direct = (src) => src.startsWith('/api/uploads/');

export default function Gallery({ images, alt }) {
  const [i, setI] = useState(0);
  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-blush">
        <Image key={images[i]} src={images[i]} alt={alt} fill priority unoptimized={direct(images[i])} sizes="(max-width:1024px) 100vw, 50vw" className="animate-rise object-cover" />
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
              <Image src={src} alt="" fill unoptimized={direct(src)} sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

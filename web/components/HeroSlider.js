'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { img } from '@/lib/utils';
import { IconArrowLeft, IconArrowRight } from './Icons';

export default function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const n = slides.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6500);
    return () => clearInterval(t);
  }, [n]);

  if (!n) return null;
  const s = slides[i];

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative h-[260px] sm:h-[420px] lg:h-[clamp(520px,44vw,820px)]">
        {slides.map((sl, k) => (
          <div key={sl._id || k} className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={img(sl.image)} alt={sl.imageName || sl.title || 'Gift'} fill priority={k === 0} sizes="100vw" className="object-cover object-right" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-wine/75 via-wine/25 via-40% to-transparent to-70%" />

        <div className="absolute bottom-6 left-5 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-20">
          <Link href={s.link || '/categories'} className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-wine shadow-lg transition hover:bg-blush">
            Shop now <IconArrowRight width={18} height={18} />
          </Link>
        </div>

        {n > 1 && (
          <div className="absolute bottom-6 right-5 flex items-center gap-2 sm:bottom-12 sm:right-10">
            <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur hover:bg-white">
              <IconArrowLeft width={18} height={18} />
            </button>
            <button onClick={() => setI((i + 1) % n)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full bg-wine text-white hover:bg-wine-dark">
              <IconArrowRight width={18} height={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

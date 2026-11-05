'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { img } from '@/lib/utils';
import { IconArrowLeft, IconArrowRight } from './Icons';

const strip = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

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
        <div className="absolute inset-0 bg-gradient-to-r from-wine/90 via-wine/60 via-35% to-transparent to-70%" />

        <div key={i} className="absolute inset-y-0 left-0 flex max-w-[75%] flex-col justify-center px-5 sm:max-w-xl sm:px-12 lg:px-20">
          {s.eyebrow && <p className="animate-rise text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 sm:text-xs">{s.eyebrow}</p>}
          {s.title && <h1 className="mt-2 animate-rise font-display text-2xl font-semibold leading-tight text-white sm:mt-3 sm:text-4xl lg:text-5xl">{s.title}</h1>}
          {s.content && <p className="mt-2 line-clamp-2 animate-rise text-xs text-white/85 sm:mt-4 sm:line-clamp-none sm:text-base">{strip(s.content)}</p>}
          <div className="mt-4 sm:mt-7">
          <Link href={s.link || '/categories'} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold sm:px-7 sm:py-3.5 text-wine shadow-lg transition hover:bg-blush">
            Shop now <IconArrowRight width={18} height={18} />
          </Link>
          </div>
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

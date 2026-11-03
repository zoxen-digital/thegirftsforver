'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { img } from '@/lib/utils';
import { IconArrowLeft, IconArrowRight, IconClock, IconShield, IconStar } from './Icons';

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
          <div className="relative h-[640px] sm:h-[600px] lg:h-[clamp(600px,44vw,820px)]">
            {slides.map((sl, k) => (
              <div key={sl._id || k} className={`absolute inset-x-0 bottom-0 top-[55%] transition-opacity duration-1000 sm:top-0 ${k === i ? 'opacity-100' : 'opacity-0'}`}>
                <Image
                  src={img(sl.image)}
                  alt={sl.imageName || sl.title || 'Gift'}
                  fill
                  priority={k === 0}
                  sizes="100vw"
                  className={`object-cover object-right ${k === i ? 'animate-kenburns' : ''}`}
                />
              </div>
            ))}
            <div className="absolute inset-0 hidden bg-gradient-to-r sm:block from-white/90 via-white/40 via-30% to-transparent to-55%" />

            <div key={i} className="relative flex h-full max-w-2xl flex-col justify-start px-6 pt-8 sm:justify-center sm:pt-0 sm:px-12 lg:px-20">
              {s.eyebrow && <p className="eyebrow animate-rise text-wine!">{s.eyebrow}</p>}
              <h1 className="mt-4 animate-rise font-display text-[40px] font-semibold leading-[1.05] text-ink [animation-delay:.1s] sm:text-6xl lg:max-w-md lg:text-[52px]">
                {s.title}
              </h1>
              {s.content && (
                <p className="mt-5 max-w-lg animate-rise lg:max-w-sm text-base text-ink/75 [animation-delay:.2s] sm:text-lg">{strip(s.content)}</p>
              )}
              <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:.3s]">
                <Link href={s.link || '/categories'} className="inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3.5 text-sm font-bold text-white transition hover:bg-wine-dark">
                  {s.buttonText || 'Shop now'} <IconArrowRight width={18} height={18} />
                </Link>
                <Link href="/categories" className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur transition hover:bg-ink/5">
                  Browse occasions
                </Link>
              </div>
              <div className="mt-10 hidden animate-rise flex-wrap gap-6 text-sm text-ink/70 [animation-delay:.4s] sm:flex">
                <span className="flex items-center gap-2"><IconStar /> 4.9 from 2,000+ reviews</span>
                <span className="flex items-center gap-2"><IconClock width={18} height={18} className="text-wine" /> Same-day delivery</span>
                <span className="flex items-center gap-2"><IconShield width={18} height={18} className="text-wine" /> Freshness guaranteed</span>
              </div>
            </div>

            {n > 1 && (
              <div className="absolute bottom-6 right-6 flex items-center gap-3 sm:bottom-10 sm:right-10">
                <div className="mr-2 hidden gap-1.5 sm:flex">
                  {slides.map((_, k) => (
                    <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-8 bg-wine' : 'w-3 bg-ink/25'}`} />
                  ))}
                </div>
                <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous slide" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/70 text-ink backdrop-blur hover:bg-white">
                  <IconArrowLeft width={18} height={18} />
                </button>
                <button onClick={() => setI((i + 1) % n)} aria-label="Next slide" className="flex h-11 w-11 items-center justify-center rounded-full bg-wine text-white hover:bg-wine-dark">
                  <IconArrowRight width={18} height={18} />
                </button>
              </div>
            )}
          </div>
    </section>
  );
}

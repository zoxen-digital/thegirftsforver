import Image from 'next/image';
import Link from 'next/link';
import { img, salePrice } from '@/lib/utils';
import { Price } from './Currency';
import { IconTruck } from './Icons';

export default function ProductCard({ p, priority = false }) {
  const sale = salePrice(p.price);
  return (
    <Link href={`/product/${p.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-blush">
        <Image
          src={img(p.coverImage)}
          alt={p.name}
          fill
          priority={priority}
          unoptimized={p.coverImage?.startsWith('/api/uploads/')}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        {p.freeDelivery && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10.5px] font-semibold text-ink backdrop-blur">
            <IconTruck width={13} height={13} /> Free
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-white/95 py-2.5 text-center text-xs font-semibold text-wine opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
          View gift
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-[14.5px] font-medium leading-snug text-ink transition group-hover:text-wine">{p.name}</h3>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[15px] font-bold text-wine"><Price value={sale} /></span>
      </div>
    </Link>
  );
}

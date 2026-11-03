import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ light = false }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="TheGiftsForever home">
      <Image src={light ? '/logo-white.png' : '/logo.png'} alt="TheGiftsForever" width={1000} height={351} priority={!light} className="h-12 w-auto sm:h-14" />
    </Link>
  );
}

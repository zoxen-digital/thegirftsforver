import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-5xl font-semibold">This gift got lost in the mail</h1>
      <p className="mt-4 text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className="btn-wine mt-8">Back to home</Link>
    </div>
  );
}

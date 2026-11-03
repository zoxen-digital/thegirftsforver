export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="TheGiftsForever" className="h-12 w-auto" />
    </div>
  );
}

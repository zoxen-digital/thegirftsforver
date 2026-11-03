import { IconStar } from './Icons';

export default function Reviews({ reviews, title = 'Loved by gifters everywhere', eyebrow = 'Customer stories' }) {
  if (!reviews?.length) return null;
  return (
    <section className="container-x mt-24">
      <div className="mb-10 text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title mt-3">{title}</h2>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {reviews.slice(0, 6).map((r) => (
          <figure key={r._id} className="w-[82%] shrink-0 snap-start rounded-3xl border border-ink/5 bg-white p-7 shadow-sm sm:w-auto">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => <IconStar key={n} filled={n <= (r.rating || 5)} />)}
            </div>
            <blockquote className="mt-4 text-[15px] leading-relaxed text-ink/80">“{r.review}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush font-display font-semibold text-wine">
                {r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <span>
                <span className="block text-sm font-semibold">{r.name}</span>
                <span className="text-xs text-muted">{r.kind === 'google' ? 'Google review' : 'Verified buyer'}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

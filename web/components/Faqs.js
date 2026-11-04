import { IconChevronDown } from './Icons';

export default function Faqs({ items }) {
  const list = (items || []).filter((f) => f.q && f.a);
  if (!list.length) return null;
  return (
    <section className="container-x mt-16 max-w-3xl">
      <h2 className="section-title mb-6 text-center text-2xl sm:text-3xl">Frequently asked questions</h2>
      <div className="space-y-3">
        {list.map((f) => (
          <details key={f.q} className="group rounded-2xl bg-white p-5 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {f.q}
              <IconChevronDown width={18} height={18} className="shrink-0 text-wine transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

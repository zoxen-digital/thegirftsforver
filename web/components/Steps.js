const STEPS = ['Cart', 'Checkout', 'Order'];

export default function Steps({ current }) {
  return (
    <ol className="mx-auto flex max-w-3xl items-start">
      {STEPS.map((s, i) => {
        const done = i + 1 <= current;
        return (
          <li key={s} className={`flex items-start ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center gap-2">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${done ? 'bg-wine text-white' : 'bg-ink/10 text-muted'}`}>{i + 1}</span>
              <span className={`text-sm font-semibold ${done ? 'text-ink' : 'text-muted'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`mx-3 mt-[18px] h-1 flex-1 rounded ${i + 1 < current ? 'bg-wine' : 'bg-ink/10'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

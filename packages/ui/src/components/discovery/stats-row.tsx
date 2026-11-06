export function StatsRow({ statistics = [] }: { statistics?: { value: string; label: string }[] }) {
  return (
    <dl className="mx-auto mt-8 grid w-full max-w-4xl grid-cols-2 gap-y-6 border-t border-ink/10 pt-6 text-center sm:grid-cols-4 sm:divide-x sm:divide-ink/10">
      {statistics.map(({ value, label }) => (
        <Stat key={label} value={value} label={label} />
      ))}
    </dl>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col px-3">
      <dt className="order-2 mt-1.5 text-xs text-muted">{label}</dt>
      <dd className="order-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

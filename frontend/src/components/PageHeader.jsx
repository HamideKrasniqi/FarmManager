/** Shared page title block for authenticated screens. */
export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-ink-500">{subtitle}</p>}
    </div>
  );
}

/** KPI / metric tile */
export function StatCard({ label, value }) {
  return (
    <div className="fm-panel px-5 py-5 transition hover:-translate-y-0.5">
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold text-brand-950">
        {value ?? '—'}
      </div>
    </div>
  );
}

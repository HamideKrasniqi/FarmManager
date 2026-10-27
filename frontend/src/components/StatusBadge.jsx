import { useTranslation } from 'react-i18next';

/** Shared status pill for tasks / farms / health. */
const STYLES = {
  PENDING: 'bg-amber-100 text-amber-900',
  IN_PROGRESS: 'bg-sky-100 text-sky-900',
  COMPLETED: 'bg-violet-100 text-violet-900',
  APPROVED: 'bg-emerald-100 text-emerald-900',
  REJECTED: 'bg-rose-100 text-rose-900',
  ACTIVE: 'bg-emerald-100 text-emerald-900',
  SUSPENDED: 'bg-rose-100 text-rose-900',
  HEALTHY: 'bg-emerald-100 text-emerald-900',
  SICK: 'bg-rose-100 text-rose-900',
  QUARANTINE: 'bg-amber-100 text-amber-900',
  DECEASED: 'bg-stone-200 text-stone-700',
  INCOME: 'bg-emerald-100 text-emerald-900',
  EXPENSE: 'bg-rose-100 text-rose-900',
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const cls = STYLES[status] || 'bg-stone-100 text-stone-700';
  const label = t(`status.${status}`, {
    defaultValue: String(status).replaceAll('_', ' '),
  });
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}

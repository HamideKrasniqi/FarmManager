import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { financesApi } from '../api/services';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  type: 'EXPENSE',
  amount: '',
  description: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
};

export default function FinancesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([financesApi.list(), financesApi.summary()])
      .then(([listRes, sumRes]) => {
        setItems(listRes.data.results || listRes.data);
        setSummary(sumRes.data);
      })
      .catch(() => setError(t('finances.failedLoad')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await financesApi.create(form);
      setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
      load();
    } catch {
      setError(t('finances.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-950">{t('finances.title')}</h1>
        <p className="mt-1 text-ink-500">{t('finances.ledgerSubtitle')}</p>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [t('finances.totalIncome'), summary.income],
            [t('finances.totalExpense'), summary.expense],
            [t('finances.netBalance'), summary.balance],
          ].map(([label, value]) => (
            <div key={label} className="fm-panel px-4 py-5">
              <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
              <div className="mt-1 font-display text-2xl font-semibold text-brand-950">
                ${Number(value).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="fm-panel grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="sm:col-span-2 lg:col-span-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t('finances.newTransaction')}
        </h2>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('finances.type')}</span>
          <select className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.type} onChange={set('type')}>
            <option value="INCOME">{t('status.INCOME')}</option>
            <option value="EXPENSE">{t('status.EXPENSE')}</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('finances.amount')}</span>
          <input required type="number" step="0.01" min="0" className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.amount} onChange={set('amount')} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('finances.date')}</span>
          <input required type="date" className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.date} onChange={set('date')} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-ink-700">{t('finances.description')}</span>
          <input required className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.description} onChange={set('description')} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('finances.category')}</span>
          <input className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.category} onChange={set('category')} />
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={saving} className="fm-btn fm-btn-primary disabled:opacity-60">
            {saving ? t('common.saving') : t('finances.addTransaction')}
          </button>
        </div>
        {error && <p className="sm:col-span-2 lg:col-span-3 text-sm text-rose-700">{error}</p>}
      </form>

      {loading ? (
        <p className="text-ink-500">{t('common.loading')}</p>
      ) : (
        <div className="fm-table-wrap">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-brand-900/10 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">{t('finances.date')}</th>
                <th className="px-4 py-3">{t('finances.type')}</th>
                <th className="px-4 py-3">{t('finances.description')}</th>
                <th className="px-4 py-3">{t('finances.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-brand-900/5">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.type} />
                  </td>
                  <td className="px-4 py-3">{row.description}</td>
                  <td className="px-4 py-3 font-medium">${Number(row.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

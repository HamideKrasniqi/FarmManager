import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { employeesApi, salariesApi } from '../api/services';

export default function SalaryPage() {
  const { t } = useTranslation();
  const { isOwner, isWorker } = useAuth();
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee: '',
    amount: '',
    currency: 'EUR',
    effective_from: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const load = () => {
    setLoading(true);
    const req = isWorker ? salariesApi.mine() : salariesApi.list();
    const empReq = isOwner
      ? employeesApi.list().catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] });

    Promise.all([req, empReq])
      .then(([salRes, empRes]) => {
        setItems(salRes.data.results || salRes.data);
        const list = empRes.data.results || empRes.data || [];
        setEmployees(Array.isArray(list) ? list : []);
      })
      .catch(() => setError(t('salary.loadFailed')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [isOwner, isWorker]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await salariesApi.create({ ...form, employee: Number(form.employee) });
      setForm({
        employee: '',
        amount: '',
        currency: 'EUR',
        effective_from: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      load();
    } catch (err) {
      setError(
        err.response?.data?.employee?.[0] ||
          err.response?.data?.amount?.[0] ||
          t('salary.saveFailedFull')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-950">
          {isWorker ? t('salary.titleWorker') : t('salary.titleOwner')}
        </h1>
        <p className="mt-1 text-ink-500">
          {isWorker ? t('salary.workerSubtitleFull') : t('salary.ownerSubtitleFull')}
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      )}

      {isOwner && (
        <form onSubmit={onSubmit} className="fm-panel grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <h2 className="sm:col-span-2 lg:col-span-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
            {t('salary.setSalaryTitle')}
          </h2>
          <label className="text-sm">
            <span className="mb-1 block text-ink-700">{t('salary.employee')}</span>
            <select required className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.employee} onChange={set('employee')}>
              <option value="">{t('salary.selectEmployee')}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.username} ({t(`roles.${e.role}`, { defaultValue: e.role })})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-ink-700">{t('finances.amount')}</span>
            <input required type="number" step="0.01" min="0" className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.amount} onChange={set('amount')} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-ink-700">{t('salary.currency')}</span>
            <select className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.currency} onChange={set('currency')}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="ALL">ALL</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-ink-700">{t('salary.effectiveFrom')}</span>
            <input required type="date" className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.effective_from} onChange={set('effective_from')} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-ink-700">{t('salary.notes')}</span>
            <input className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.notes} onChange={set('notes')} />
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="fm-btn fm-btn-primary w-full disabled:opacity-60">
              {saving ? t('common.saving') : t('salary.saveSalary')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-ink-500">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="text-ink-500">{t('salary.noRecords')}</p>
      ) : (
        <div className="fm-table-wrap">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-brand-900/10 text-xs uppercase text-ink-500">
              <tr>
                {!isWorker && <th className="px-4 py-3">{t('salary.employee')}</th>}
                <th className="px-4 py-3">{t('finances.amount')}</th>
                <th className="px-4 py-3">{t('salary.from')}</th>
                <th className="px-4 py-3">{t('salary.notes')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-brand-900/5">
                  {!isWorker && <td className="px-4 py-3 font-medium">{s.employee_name}</td>}
                  <td className="px-4 py-3 font-semibold">
                    {Number(s.amount).toFixed(2)} {s.currency}
                  </td>
                  <td className="px-4 py-3">{s.effective_from}</td>
                  <td className="px-4 py-3 text-ink-500">{s.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

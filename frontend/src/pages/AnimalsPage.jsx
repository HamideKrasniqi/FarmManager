import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { animalsApi } from '../api/services';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  tag_number: '',
  species: '',
  breed: '',
  birth_date: '',
  health_status: 'HEALTHY',
  notes: '',
};

export default function AnimalsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    animalsApi
      .list()
      .then(({ data }) => setItems(data.results || data))
      .catch(() => setError(t('animals.failedLoad')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        birth_date: form.birth_date || null,
      };
      await animalsApi.create(payload);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(
        err.response?.data?.tag_number?.[0] ||
          t('animals.createFailed')
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm(t('animals.deleteConfirm'))) return;
    await animalsApi.remove(id);
    load();
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-950">{t('animals.title')}</h1>
        <p className="mt-1 text-ink-500">{t('animals.subtitle')}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="fm-panel grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <h2 className="sm:col-span-2 lg:col-span-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t('animals.addAnimal')}
        </h2>
        {[
          [t('animals.tagNumber'), 'tag_number'],
          [t('animals.species'), 'species'],
          [t('animals.breed'), 'breed'],
        ].map(([label, key]) => (
          <label key={key} className="text-sm">
            <span className="mb-1 block text-ink-700">{label}</span>
            <input
              required={key !== 'breed'}
              className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
              value={form[key]}
              onChange={set(key)}
            />
          </label>
        ))}
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('animals.birthDate')}</span>
          <input
            type="date"
            className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
            value={form.birth_date}
            onChange={set('birth_date')}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('animals.healthStatus')}</span>
          <select
            className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
            value={form.health_status}
            onChange={set('health_status')}
          >
            {['HEALTHY', 'SICK', 'QUARANTINE', 'DECEASED'].map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            disabled={saving}
            className="fm-btn fm-btn-primary w-full disabled:opacity-60"
          >
            {saving ? t('common.loading') : t('animals.addAnimal')}
          </button>
        </div>
        {error && (
          <p className="sm:col-span-2 lg:col-span-3 text-sm text-rose-700">{error}</p>
        )}
      </form>

      {loading ? (
        <p className="text-ink-500">{t('common.loading')}</p>
      ) : (
        <div className="fm-table-wrap">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-brand-900/10 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">{t('animals.tag')}</th>
                <th className="px-4 py-3">{t('animals.species')}</th>
                <th className="px-4 py-3">{t('animals.breed')}</th>
                <th className="px-4 py-3">{t('animals.healthStatus')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-brand-900/5">
                  <td className="px-4 py-3 font-medium">{a.tag_number}</td>
                  <td className="px-4 py-3">{a.species}</td>
                  <td className="px-4 py-3">{a.breed || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.health_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      className="text-xs font-medium text-rose-700 hover:underline"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

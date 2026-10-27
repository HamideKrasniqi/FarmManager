import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cropsApi } from '../api/services';

const emptyForm = {
  field_name: '',
  crop_type: '',
  area_hectares: '',
  planting_date: '',
  expected_harvest: '',
  status: 'GROWING',
};

export default function CropsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    cropsApi
      .list()
      .then(({ data }) => setItems(data.results || data))
      .catch(() => setError(t('crops.failedLoad')))
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
      await cropsApi.create({
        ...form,
        area_hectares: form.area_hectares,
        planting_date: form.planting_date || null,
        expected_harvest: form.expected_harvest || null,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.field_name?.[0] || t('crops.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm(t('crops.deleteConfirm'))) return;
    await cropsApi.remove(id);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-950">{t('crops.title')}</h1>
        <p className="mt-1 text-ink-500">{t('crops.subtitleFields')}</p>
      </div>

      <form onSubmit={onSubmit} className="fm-panel grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="sm:col-span-2 lg:col-span-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t('crops.addField')}
        </h2>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('crops.fieldName')}</span>
          <input required className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.field_name} onChange={set('field_name')} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('crops.cropType')}</span>
          <input required className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.crop_type} onChange={set('crop_type')} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('crops.areaHa')}</span>
          <input required type="number" step="0.01" min="0" className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.area_hectares} onChange={set('area_hectares')} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('crops.plantingDate')}</span>
          <input type="date" className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.planting_date} onChange={set('planting_date')} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('crops.expectedHarvest')}</span>
          <input type="date" className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.expected_harvest} onChange={set('expected_harvest')} />
        </label>
        <div className="flex items-end">
          <button type="submit" disabled={saving} className="fm-btn fm-btn-primary w-full disabled:opacity-60">
            {saving ? t('common.saving') : t('crops.addCrop')}
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
                <th className="px-4 py-3">{t('crops.field')}</th>
                <th className="px-4 py-3">{t('crops.crop')}</th>
                <th className="px-4 py-3">{t('crops.areaHa')}</th>
                <th className="px-4 py-3">{t('crops.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-brand-900/5">
                  <td className="px-4 py-3 font-medium">{c.field_name}</td>
                  <td className="px-4 py-3">{c.crop_type}</td>
                  <td className="px-4 py-3">{c.area_hectares}</td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(c.id)} className="text-xs font-medium text-rose-700 hover:underline">
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

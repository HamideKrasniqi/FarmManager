import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { employeesApi } from '../api/services';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'WORKER',
};

export default function EmployeesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    employeesApi
      .list()
      .then(({ data }) => setItems(data.results || data))
      .catch(() => setError(t('employees.failedLoad')))
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
      await employeesApi.create(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.username?.[0] ||
          data?.email?.[0] ||
          data?.password?.[0] ||
          t('employees.createFailed')
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm(t('employees.removeConfirm'))) return;
    await employeesApi.remove(id);
    load();
  };

  const fields = [
    [t('employees.username'), 'username'],
    [t('employees.email'), 'email', 'email'],
    [t('employees.password'), 'password', 'password'],
    [t('employees.firstName'), 'first_name'],
    [t('employees.lastName'), 'last_name'],
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-950">{t('employees.title')}</h1>
        <p className="mt-1 text-ink-500">{t('employees.subtitleFull')}</p>
      </div>

      <form onSubmit={onSubmit} className="fm-panel grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
          {t('employees.addEmployee')}
        </h2>
        {fields.map(([label, key, type = 'text']) => (
          <label key={key} className="text-sm">
            <span className="mb-1 block text-ink-700">{label}</span>
            <input
              type={type}
              required={['username', 'email', 'password'].includes(key)}
              className="w-full rounded border border-soil-800/20 bg-white px-3 py-2"
              value={form[key]}
              onChange={set(key)}
            />
          </label>
        ))}
        <label className="text-sm">
          <span className="mb-1 block text-ink-700">{t('employees.role')}</span>
          <select className="w-full rounded border border-soil-800/20 bg-white px-3 py-2" value={form.role} onChange={set('role')}>
            <option value="WORKER">{t('roles.WORKER')}</option>
            <option value="MANAGER">{t('roles.MANAGER')}</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" disabled={saving} className="fm-btn fm-btn-primary w-full disabled:opacity-60">
            {saving ? t('common.saving') : t('employees.addEmployee')}
          </button>
        </div>
        {error && <p className="sm:col-span-2 text-sm text-rose-700">{error}</p>}
      </form>

      {loading ? (
        <p className="text-ink-500">{t('common.loading')}</p>
      ) : (
        <div className="fm-table-wrap">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-brand-900/10 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">{t('salary.user')}</th>
                <th className="px-4 py-3">{t('employees.email')}</th>
                <th className="px-4 py-3">{t('employees.role')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-brand-900/5">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{t(`roles.${u.role}`, { defaultValue: u.role })}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(u.id)} className="text-xs font-medium text-rose-700 hover:underline">
                      {t('common.remove')}
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

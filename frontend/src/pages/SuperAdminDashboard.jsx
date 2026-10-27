import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dashboardApi, farmsApi } from '../api/services';
import StatusBadge from '../components/StatusBadge';

const PLAN_COLORS = {
  FREE: 'bg-stone-100 text-stone-700',
  BASIC: 'bg-sky-100 text-sky-800',
  PRO: 'bg-violet-100 text-violet-800',
  ENTERPRISE: 'bg-amber-100 text-amber-900',
};

function PlanBadge({ plan }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
        PLAN_COLORS[plan] || 'bg-mist-100 text-ink-700'
      }`}
    >
      {t(`plans.${plan}.name`, { defaultValue: plan })}
    </span>
  );
}

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .platform()
      .then(({ data }) => setMetrics(data))
      .catch(() => setError(t('admin.metricsFailed')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink-500">{t('common.loading')}</p>;
  if (error) return <p className="text-rose-700">{error}</p>;

  const plans = metrics.pricing?.plans || {};
  const catalog = metrics.pricing?.catalog || [];
  const maxPlanCount = Math.max(...Object.values(plans), 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-950">
            {t('admin.platformDashboard')}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {t('dashboard.platformSubtitleFull')}
          </p>
        </div>
        <Link to="/admin/farms" className="fm-btn fm-btn-dark text-xs">
          {t('nav.farmsPricing')}
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [t('admin.activeFarms'), metrics.farms?.active ?? 0, 'text-leaf-600'],
          [t('admin.suspendedFarms'), metrics.farms?.suspended ?? 0, 'text-rose-600'],
          [t('admin.totalUsers'), metrics.users ?? 0, 'text-sky-700'],
          [
            t('admin.mrr'),
            `${Number(metrics.pricing?.mrr || 0).toFixed(0)} EUR`,
            'text-brand-950',
          ],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              {label}
            </div>
            <div className={`mt-2 font-display text-3xl font-bold ${color}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Recent farms */}
        <section className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-brand-950">
              {t('admin.recentFarms')}
            </h2>
            <Link
              to="/admin/farms"
              className="text-sm font-semibold text-sky-700 hover:underline"
            >
              {t('dashboard.viewAll')}
            </Link>
          </div>
          {!metrics.recent_farms?.length ? (
            <p className="py-8 text-center text-sm text-ink-500">{t('dashboard.noFarmsYet')}</p>
          ) : (
            <ul className="divide-y divide-brand-900/5">
              {metrics.recent_farms.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium text-brand-950">{f.name}</div>
                    <div className="mt-0.5 text-xs text-ink-500">
                      {new Date(f.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlanBadge plan={f.plan} />
                    <span className="text-sm font-semibold text-brand-950">
                      {Number(f.monthly_price).toFixed(0)} {f.currency}
                    </span>
                    <StatusBadge status={f.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Plan distribution */}
        <section className="space-y-5 xl:col-span-2">
          <div className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-brand-950">
              {t('admin.planDistribution')}
            </h2>
            <div className="space-y-3">
              {Object.entries(plans).map(([plan, count]) => (
                <div key={plan}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-ink-700">
                      {t(`plans.${plan}.name`, { defaultValue: plan })}
                    </span>
                    <span className="text-ink-500">{t('dashboard.farmsCount', { count })}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist-100">
                    <div
                      className="h-full rounded-full bg-leaf-500"
                      style={{
                        width: `${Math.round((count / maxPlanCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-brand-950">
              {t('admin.planCatalog')}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {catalog.map((c) => (
                <div
                  key={c.plan}
                  className="rounded-xl bg-mist-50 px-3 py-3 text-center"
                >
                  <PlanBadge plan={c.plan} />
                  <div className="mt-2 font-display text-lg font-bold text-brand-950">
                    €{c.default_price}
                  </div>
                  <div className="text-[10px] text-ink-500">{t('dashboard.perMonthShort')}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Usage + finance */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          [t('dashboard.animals'), metrics.animals],
          [t('dashboard.crops'), metrics.crops],
          [t('nav.tasks'), metrics.tasks?.total],
          [
            t('dashboard.farmLedgerVolume'),
            `€${Number(metrics.finances?.total_income || 0).toFixed(0)}`,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              {label}
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-brand-950">
              {value ?? 0}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-brand-950">
          {t('dashboard.taskActivity')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [t('status.PENDING'), metrics.tasks?.pending, 'bg-amber-400'],
            [t('status.IN_PROGRESS'), metrics.tasks?.in_progress, 'bg-sky-500'],
            [t('status.COMPLETED'), metrics.tasks?.completed, 'bg-violet-500'],
            [t('status.APPROVED'), metrics.tasks?.approved, 'bg-leaf-500'],
            [t('status.REJECTED'), metrics.tasks?.rejected, 'bg-rose-400'],
          ].map(([label, value, color]) => {
            const total = Math.max(metrics.tasks?.total || 1, 1);
            const pct = Math.round(((value || 0) / total) * 100);
            return (
              <div key={label} className="rounded-xl bg-mist-50 p-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink-700">{label}</span>
                  <span className="text-ink-500">{value || 0}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const PLAN_OPTIONS = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];
const PLAN_DEFAULTS = { FREE: 0, BASIC: 29, PRO: 79, ENTERPRISE: 199 };

export function FarmsAdminPage() {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [priceForm, setPriceForm] = useState({
    plan: 'BASIC',
    monthly_price: 29,
    currency: 'EUR',
  });

  const load = () => {
    setLoading(true);
    farmsApi
      .list()
      .then(({ data }) => setFarms(data.results || data))
      .catch(() => setError(t('dashboard.failedLoadFarms')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (farm) => {
    setBusyId(farm.id);
    setError('');
    try {
      if (farm.status === 'ACTIVE') await farmsApi.suspend(farm.id);
      else await farmsApi.activate(farm.id);
      load();
    } catch {
      setError(t('dashboard.statusUpdateFailed'));
    } finally {
      setBusyId(null);
    }
  };

  const openPricing = (farm) => {
    setEditingId(farm.id);
    setPriceForm({
      plan: farm.plan || 'BASIC',
      monthly_price: Number(farm.monthly_price ?? 29),
      currency: farm.currency || 'EUR',
    });
  };

  const savePricing = async (farmId) => {
    setBusyId(farmId);
    setError('');
    try {
      await farmsApi.setPricing(farmId, {
        plan: priceForm.plan,
        monthly_price: priceForm.monthly_price,
        currency: priceForm.currency,
        use_plan_default: false,
      });
      setEditingId(null);
      load();
    } catch {
      setError(t('admin.pricingFailed'));
    } finally {
      setBusyId(null);
    }
  };

  const applyDefaultPrice = (plan) => {
    setPriceForm((f) => ({
      ...f,
      plan,
      monthly_price: PLAN_DEFAULTS[plan] ?? f.monthly_price,
    }));
  };

  const mrr = farms
    .filter((f) => f.status === 'ACTIVE')
    .reduce((sum, f) => sum + Number(f.monthly_price || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-950">
            {t('admin.farmsTitle')}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {t('admin.farmsSubtitle')}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-900/5 bg-white px-4 py-3 shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            {t('dashboard.activeMrr')}
          </div>
          <div className="font-display text-xl font-bold text-leaf-600">
            €{mrr.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Catalog */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_OPTIONS.map((plan) => (
          <div
            key={plan}
            className="rounded-2xl border border-brand-900/5 bg-white p-4 shadow-sm"
          >
            <PlanBadge plan={plan} />
            <div className="mt-2 font-display text-2xl font-bold text-brand-950">
              €{PLAN_DEFAULTS[plan]}
            </div>
            <div className="text-xs text-ink-500">{t('dashboard.defaultPerMonth')}</div>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-ink-500">{t('common.loading')}</p>
      ) : (
        <div className="space-y-4">
          {farms.map((farm) => (
            <article
              key={farm.id}
              className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-brand-950">
                    {farm.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={farm.status} />
                    <PlanBadge plan={farm.plan} />
                    <span className="text-sm font-semibold text-brand-950">
                      {Number(farm.monthly_price).toFixed(2)} {farm.currency}
                      {t('dashboard.perMo')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    {t('dashboard.usersAnimalsTasks', {
                      users: farm.user_count ?? 0,
                      animals: farm.animal_count ?? 0,
                      tasks: farm.task_count ?? 0,
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openPricing(farm)}
                    className="fm-btn fm-btn-ghost !py-1.5 text-xs"
                  >
                    {t('admin.editPricing')}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === farm.id}
                    onClick={() => toggle(farm)}
                    className="fm-btn fm-btn-dark !py-1.5 text-xs disabled:opacity-50"
                  >
                    {farm.status === 'ACTIVE' ? t('admin.suspend') : t('admin.activate')}
                  </button>
                </div>
              </div>

              {editingId === farm.id && (
                <div className="mt-4 grid gap-3 rounded-xl bg-mist-50 p-4 sm:grid-cols-4">
                  <label className="text-sm sm:col-span-1">
                    <span className="mb-1 block text-xs font-semibold text-ink-500">
                      {t('admin.plan')}
                    </span>
                    <select
                      className="fm-input"
                      value={priceForm.plan}
                      onChange={(e) => applyDefaultPrice(e.target.value)}
                    >
                      {PLAN_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm sm:col-span-1">
                    <span className="mb-1 block text-xs font-semibold text-ink-500">
                      {t('dashboard.monthlyPrice')}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="fm-input"
                      value={priceForm.monthly_price}
                      onChange={(e) =>
                        setPriceForm((f) => ({
                          ...f,
                          monthly_price: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="text-sm sm:col-span-1">
                    <span className="mb-1 block text-xs font-semibold text-ink-500">
                      {t('salary.currency')}
                    </span>
                    <select
                      className="fm-input"
                      value={priceForm.currency}
                      onChange={(e) =>
                        setPriceForm((f) => ({
                          ...f,
                          currency: e.target.value,
                        }))
                      }
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="ALL">ALL</option>
                    </select>
                  </label>
                  <div className="flex items-end gap-2 sm:col-span-1">
                    <button
                      type="button"
                      disabled={busyId === farm.id}
                      onClick={() => savePricing(farm.id)}
                      className="fm-btn fm-btn-primary flex-1 !py-2 text-xs disabled:opacity-50"
                    >
                      {t('common.save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="fm-btn fm-btn-ghost !py-2 text-xs"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

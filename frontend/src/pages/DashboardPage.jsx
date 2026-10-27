import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/services';
import SuperAdminDashboard from './SuperAdminDashboard';
import WorkerTasksPage from './WorkerTasksPage';
import StatusBadge from '../components/StatusBadge';

function WeatherBanner() {
  const { t, i18n } = useTranslation();
  const [wx, setWx] = useState(null);

  useEffect(() => {
    // Open-Meteo (no API key) — Tirana default for thesis demo
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=41.3275&longitude=19.8187&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5'
    )
      .then((r) => r.json())
      .then(setWx)
      .catch(() => setWx(null));
  }, []);

  if (!wx?.current) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-sky-700 to-sky-500 px-5 py-4 text-white shadow-sm">
        <p className="text-sm font-medium opacity-90">{t('dashboard.weather')}</p>
        <p className="text-lg font-semibold">{t('dashboard.loadingForecast')}</p>
      </div>
    );
  }

  const days = wx.daily?.time || [];

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-800 via-sky-600 to-emerald-600 text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {t('dashboard.currentConditions')}
          </p>
          <p className="mt-1 text-3xl font-semibold">
            {Math.round(wx.current.temperature_2m)}°C
          </p>
          <p className="mt-1 text-sm text-white/85">
            {t('dashboard.humidity')} {wx.current.relative_humidity_2m}% · {t('dashboard.wind')}{' '}
            {Math.round(wx.current.wind_speed_10m)} km/h
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {days.slice(0, 5).map((d, i) => (
            <div
              key={d}
              className="min-w-[4.5rem] rounded-xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm"
            >
              <div className="text-[10px] font-semibold uppercase text-white/75">
                {new Date(d).toLocaleDateString(i18n.language === 'sq' ? 'sq-AL' : 'en-US', { weekday: 'short' })}
              </div>
              <div className="mt-1 text-sm font-bold">
                {Math.round(wx.daily.temperature_2m_max[i])}°
              </div>
              <div className="text-[10px] text-white/70">
                {wx.daily.precipitation_probability_max[i]}% {t('dashboard.rain')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceChart({ series }) {
  const { t } = useTranslation();
  if (!series?.length) {
    return (
      <p className="py-10 text-center text-sm text-ink-500">
        {t('dashboard.noFinanceData')}
      </p>
    );
  }

  const max = Math.max(
    ...series.flatMap((m) => [m.income, m.expense]),
    1
  );

  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end gap-2 sm:gap-3">
        {series.map((m) => (
          <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-40 w-full items-end justify-center gap-0.5">
              <div
                className="w-[42%] rounded-t bg-leaf-500"
                style={{ height: `${(m.income / max) * 100}%` }}
                title={`Income ${m.income}`}
              />
              <div
                className="w-[42%] rounded-t bg-rose-400"
                style={{ height: `${(m.expense / max) * 100}%` }}
                title={`Expense ${m.expense}`}
              />
            </div>
            <span className="text-[10px] font-medium text-ink-500">
              {m.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-leaf-500" /> {t('dashboard.income')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" /> {t('dashboard.expense')}
        </span>
      </div>
    </div>
  );
}

function PriorityBadge({ status }) {
  const { t } = useTranslation();
  if (status === 'COMPLETED') {
    return (
      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800">
        {t('dashboard.review')}
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-800">
        {t('dashboard.highest')}
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
        {t('dashboard.high')}
      </span>
    );
  }
  return null;
}

function StaffDashboard() {
  const { t } = useTranslation();
  const { isOwner, isManager } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    dashboardApi
      .farm()
      .then(({ data: d }) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setError(t('dashboard.loadFailed'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="text-ink-500">{t('dashboard.loadingDashboard')}</p>;
  if (error) return <p className="text-rose-700">{error}</p>;
  if (!data) return null;

  const openTasks =
    (data.tasks?.pending || 0) + (data.tasks?.in_progress || 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
            {data.farm?.name}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isOwner ? t('dashboard.ownerOverview') : t('dashboard.managerBoard')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white px-3 py-1.5 text-ink-700 shadow-sm">
            {t('dashboard.animalsCount', { count: data.animals })}
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-ink-700 shadow-sm">
            {t('dashboard.fieldsCount', { count: data.crops })}
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-ink-700 shadow-sm">
            {t('dashboard.openTasksCount', { count: openTasks })}
          </span>
          {(data.pending_vacation_count || 0) > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-900 shadow-sm">
              {t('dashboard.leavePending', { count: data.pending_vacation_count })}
            </span>
          )}
        </div>
      </div>

      <WeatherBanner />

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Upcoming tasks — main column */}
        <section className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-brand-950">
              {t('dashboard.topTasks')}
            </h2>
            <Link
              to="/tasks"
              className="text-sm font-semibold text-sky-700 hover:underline"
            >
              {t('dashboard.viewAllTasks')}
            </Link>
          </div>

          {!data.upcoming_tasks?.length ? (
            <p className="py-8 text-center text-sm text-ink-500">
              {t('dashboard.noOpenTasks')}
            </p>
          ) : (
            <ul className="divide-y divide-brand-900/5">
              {data.upcoming_tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    className={`mt-1.5 h-4 w-4 shrink-0 rounded border-2 ${
                      task.status === 'COMPLETED'
                        ? 'border-leaf-500 bg-leaf-500'
                        : 'border-brand-900/25'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-brand-950">
                        {task.title}
                      </span>
                      <PriorityBadge status={task.status} />
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-ink-500">
                      <span>{task.assigned_to_name || t('dashboard.unassigned')}</span>
                      {task.due_date && (
                        <span>{t('dashboard.dueDate', { date: task.due_date })}</span>
                      )}
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right column widgets */}
        <div className="space-y-5 xl:col-span-2">
          {/* Task status bars — useful for Manager */}
          <section className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-brand-950">
              {t('dashboard.taskStatus')}
            </h2>
            <div className="space-y-3">
              {[
                [t('dashboard.pending'), data.tasks?.pending, 'bg-amber-400'],
                [t('dashboard.inProgress'), data.tasks?.in_progress, 'bg-sky-500'],
                [t('dashboard.awaitingReview'), data.tasks?.awaiting_review, 'bg-violet-500'],
                [t('dashboard.approved'), data.tasks?.approved, 'bg-leaf-500'],
              ].map(([label, value, color]) => {
                const total = Math.max(data.tasks?.total || 1, 1);
                const pct = Math.round(((value || 0) / total) * 100);
                return (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-ink-700">{label}</span>
                      <span className="text-ink-500">
                        {value || 0} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-mist-100">
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

          {isOwner && data.finances && (
            <section className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-base font-semibold text-brand-950">
                  {t('dashboard.incomeVsExpense')}
                </h2>
                <Link
                  to="/finances"
                  className="text-xs font-semibold text-sky-700 hover:underline"
                >
                  {t('nav.accounting')}
                </Link>
              </div>
              <p className="mb-4 text-xs text-ink-500">
                {t('dashboard.balance')}{' '}
                <span className="font-semibold text-brand-950">
                  ${Number(data.finances.balance).toFixed(2)}
                </span>
              </p>
              <FinanceChart series={data.monthly_finance} />
            </section>
          )}

          {isManager && (
            <section className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-brand-950">
                {t('dashboard.operationsSnapshot')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  [t('dashboard.animals'), data.animals],
                  [t('dashboard.cropFields'), data.crops],
                  [t('dashboard.team'), data.employees],
                  [t('dashboard.openTasks'), openTasks],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-mist-50 px-3 py-3 text-center"
                  >
                    <div className="font-display text-2xl font-bold text-brand-950">
                      {value}
                    </div>
                    <div className="text-[11px] font-medium text-ink-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Leave requests widget */}
      <section className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-950">
            {t('dashboard.pendingLeave')}
          </h2>
          <Link
            to="/vacations"
            className="text-sm font-semibold text-sky-700 hover:underline"
          >
            {t('dashboard.manageLeave')}
          </Link>
        </div>
        {!data.pending_vacations?.length ? (
          <p className="text-sm text-ink-500">{t('dashboard.noPendingLeave')}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.pending_vacations.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-brand-900/5 bg-mist-50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-brand-950">
                    {v.employee_name}
                  </span>
                  <StatusBadge status="PENDING" />
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-leaf-600">
                  {v.leave_type}
                </p>
                <p className="mt-1 text-sm text-ink-700">
                  {v.start_date} → {v.end_date}
                </p>
                {v.reason && (
                  <p className="mt-1 truncate text-xs text-ink-500">
                    {v.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const { isSuperAdmin, isWorker } = useAuth();
  if (isSuperAdmin) return <SuperAdminDashboard />;
  if (isWorker) return <WorkerTasksPage />;
  return <StaffDashboard />;
}

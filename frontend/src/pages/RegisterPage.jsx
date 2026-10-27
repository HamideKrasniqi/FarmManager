import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PricingPlanCards from '../components/PricingPlanCards';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getPlanById, PRICING_PLANS } from '../constants/pricingPlans';
import { useAuth } from '../context/AuthContext';

const VALID_PLANS = PRICING_PLANS.map((p) => p.id);

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan');
  const defaultPlan = VALID_PLANS.includes(initialPlan) ? initialPlan : 'BASIC';

  const [form, setForm] = useState({
    farm_name: '',
    plan: defaultPlan,
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPlan = useMemo(() => {
    const plan = getPlanById(form.plan) || PRICING_PLANS[1];
    return {
      ...plan,
      name: t(`plans.${plan.id}.name`, { defaultValue: plan.name }),
    };
  }, [form.plan, t]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/login', {
        state: {
          registered: true,
          plan: selectedPlan.name,
          price: selectedPlan.price,
        },
      });
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.farm_name?.[0] ||
        data?.plan?.[0] ||
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        t('register.registrationFailed');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist-50">
      <header className="border-b border-brand-900/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white">
              F
            </span>
            <span className="font-display text-xl font-bold text-brand-950">
              {t('common.appName')}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="shrink-0">
              <LanguageSwitcher />
            </span>
            <Link
              to="/login"
              className="text-sm font-semibold text-leaf-600 hover:text-leaf-500"
            >
              {t('common.signIn')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center fm-animate-in">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            {t('register.title')}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
            {t('register.heading')}
          </h1>
          <p className="mt-3 text-ink-500">{t('register.subtitle')}</p>
        </div>

        <section className="mt-10 fm-animate-in">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-950">
              {t('register.stepPlan')}
            </h2>
            <Link
              to="/pricing"
              className="text-xs font-semibold text-leaf-600 hover:text-leaf-500"
            >
              {t('register.comparePlans')}
            </Link>
          </div>
          <PricingPlanCards
            selectedPlan={form.plan}
            onSelect={(planId) => setForm((f) => ({ ...f, plan: planId }))}
            compact
          />
          <p className="mt-3 text-center text-sm text-ink-500">
            {t('register.selected')}:{' '}
            <span className="font-semibold text-brand-950">
              {selectedPlan.name}
            </span>{' '}
            —{' '}
            {selectedPlan.price === 0
              ? t('common.freeForever')
              : t('common.eurPerMonth', { price: selectedPlan.price })}
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-lg fm-animate-in">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-950">
            {t('register.stepDetails')}
          </h2>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-brand-900/5 bg-white p-4 shadow-[0_20px_60px_rgba(12,31,23,0.08)] sm:p-8"
          >
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <span className="mt-0.5 text-base">!</span>
                <span>{error}</span>
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-950">
                {t('register.farmName')}
              </span>
              <input
                className="fm-input !rounded-2xl !px-4 !py-3"
                value={form.farm_name}
                onChange={set('farm_name')}
                placeholder={t('register.farmNamePlaceholder')}
                required
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-brand-950">
                  {t('register.firstName')}
                </span>
                <input
                  className="fm-input !rounded-2xl !px-4 !py-3"
                  value={form.first_name}
                  onChange={set('first_name')}
                  placeholder={t('common.optional')}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-brand-950">
                  {t('register.lastName')}
                </span>
                <input
                  className="fm-input !rounded-2xl !px-4 !py-3"
                  value={form.last_name}
                  onChange={set('last_name')}
                  placeholder={t('common.optional')}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-brand-950">
                {t('auth.username')}
              </span>
              <input
                className="fm-input !rounded-2xl !px-4 !py-3"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                placeholder={t('auth.usernamePlaceholder')}
                required
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-brand-950">
                {t('register.email')}
              </span>
              <input
                type="email"
                className="fm-input !rounded-2xl !px-4 !py-3"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                placeholder={t('register.emailPlaceholder')}
                required
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-brand-950">
                {t('auth.password')}
              </span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="fm-input !rounded-2xl !px-4 !py-3 !pr-12"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  placeholder={t('register.passwordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:bg-mist-100 hover:text-brand-950"
                >
                  {showPassword ? t('common.hide') : t('common.show')}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 flex w-full items-center justify-center rounded-full bg-leaf-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf-600/25 transition hover:bg-leaf-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('register.creating')}
                </span>
              ) : (
                t('register.createOnPlan', { plan: selectedPlan.name })
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-500">
            {t('register.alreadyHave')}{' '}
            <Link
              to="/login"
              className="font-semibold text-leaf-600 hover:text-leaf-500"
            >
              {t('common.signIn')}
            </Link>
            <span className="mx-2 text-brand-900/20">·</span>
            <Link to="/" className="font-semibold text-ink-700 hover:text-brand-950">
              {t('common.backHome')}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

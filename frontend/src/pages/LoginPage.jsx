import { useState } from 'react';

import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import LanguageSwitcher from '../components/LanguageSwitcher';

import { useAuth } from '../context/AuthContext';

export default function LoginPage() {

  const { t } = useTranslation();

  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);



  if (isAuthenticated) {

    return <Navigate to="/dashboard" replace />;

  }



  const onSubmit = async (e) => {

    e.preventDefault();

    setError('');

    setSubmitting(true);

    try {

      await login(username, password);

      navigate('/dashboard');

    } catch (err) {

      const detail =

        err.response?.data?.detail ||

        err.response?.data?.non_field_errors?.[0] ||

        t('auth.invalidCredentials');

      setError(typeof detail === 'string' ? detail : t('auth.loginFailed'));

    } finally {

      setSubmitting(false);

    }

  };

  const heroBullets = [

    t('auth.heroBullet1'),

    t('auth.heroBullet2'),

    t('auth.heroBullet3'),

  ];



  return (

    <div className="flex min-h-screen flex-col md:grid md:grid-cols-2">

      <aside className="relative overflow-hidden text-white md:min-h-screen">

        <div className="fm-hero-mesh absolute inset-0" />

        <div

          className="absolute inset-0 opacity-35"

          style={{

            backgroundImage:

              'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80)',

            backgroundSize: 'cover',

            backgroundPosition: 'center',

          }}

        />

        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-900/85 to-brand-900/70" />



        <div className="relative flex flex-col justify-between px-5 py-6 sm:px-8 md:h-full md:p-10 xl:p-14">

          <div className="flex items-center justify-between gap-3">

            <Link to="/" className="inline-flex items-center gap-2.5 sm:gap-3">

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500 text-sm font-bold shadow-lg shadow-leaf-600/30 sm:h-10 sm:w-10 sm:text-lg">

                F

              </span>

              <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">

                {t('common.appName')}

              </span>

            </Link>

            <span className="md:hidden">
              <LanguageSwitcher variant="dark" />
            </span>

          </div>



          <div className="mt-5 max-w-md md:mt-0">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-leaf-400 sm:text-sm">

              {t('auth.heroTagline')}

            </p>

            <h1 className="mt-2 font-display text-2xl font-bold leading-tight sm:mt-4 sm:text-4xl xl:text-5xl">

              {t('auth.heroTitle')}

            </h1>

            <p className="mt-2 hidden text-sm leading-relaxed text-white/75 sm:mt-4 sm:block sm:text-base">

              {t('auth.heroText')}

            </p>



            <ul className="mt-5 hidden space-y-3 md:block">

              {heroBullets.map((item) => (

                <li

                  key={item}

                  className="flex items-center gap-3 text-sm text-white/90"

                >

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf-500/20 text-xs text-leaf-400">

                    ✓

                  </span>

                  {item}

                </li>

              ))}

            </ul>

          </div>



          <p className="mt-4 hidden text-xs text-white/50 md:block">

            {t('auth.diplomaNote')}

          </p>

        </div>

      </aside>



      <main className="relative flex flex-1 items-start justify-center bg-mist-50 px-4 py-8 sm:items-center sm:px-6 sm:py-12 md:px-8">

        <div

          className="pointer-events-none absolute inset-0 opacity-60"

          style={{

            background:

              'radial-gradient(ellipse 60% 40% at 80% 0%, rgba(39,163,90,0.12), transparent), radial-gradient(ellipse 50% 30% at 10% 100%, rgba(18,48,40,0.06), transparent)',

          }}

        />



        <div className="relative w-full max-w-[420px]">

          <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">

            <div>

              <h2 className="font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">

                {t('auth.loginTitle')}

              </h2>

              <p className="mt-1.5 text-sm text-ink-500 sm:mt-2 sm:text-base">

                {t('auth.loginSubtitle')}

              </p>

            </div>

            <span className="hidden shrink-0 md:inline-flex">
              <LanguageSwitcher />
            </span>

          </div>



          <form

            onSubmit={onSubmit}

            className="rounded-2xl border border-brand-900/5 bg-white p-5 shadow-[0_20px_60px_rgba(12,31,23,0.08)] sm:rounded-3xl sm:p-7 md:p-8"

          >

            {error && (

              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">

                <span className="mt-0.5 text-base">!</span>

                <span>{error}</span>

              </div>

            )}



            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-brand-950">

                {t('auth.username')}

              </span>

              <input

                className="fm-input !rounded-xl !px-3 !py-2.5 sm:!rounded-2xl sm:!px-4 sm:!py-3"

                value={username}

                onChange={(e) => setUsername(e.target.value)}

                autoComplete="username"

                placeholder={t('auth.usernamePlaceholder')}

                required

              />

            </label>



            <label className="mt-4 block sm:mt-5">

              <span className="mb-2 block text-sm font-semibold text-brand-950">

                {t('auth.password')}

              </span>

              <div className="relative">

                <input

                  type={showPassword ? 'text' : 'password'}

                  className="fm-input !rounded-xl !px-3 !py-2.5 !pr-14 sm:!rounded-2xl sm:!px-4 sm:!py-3"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  autoComplete="current-password"

                  placeholder={t('auth.passwordPlaceholder')}

                  required

                />

                <button

                  type="button"

                  onClick={() => setShowPassword((v) => !v)}

                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:bg-mist-100 hover:text-brand-950 sm:right-3"

                >

                  {showPassword ? t('common.hide') : t('common.show')}

                </button>

              </div>

            </label>



            <button

              type="submit"

              disabled={submitting}

              className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-900 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-7 sm:py-3.5"

            >

              {submitting ? (

                <span className="inline-flex items-center gap-2">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  {t('auth.signingIn')}

                </span>

              ) : (

                t('common.signIn')

              )}

            </button>

          </form>



          <p className="mt-6 text-center text-sm text-ink-500 sm:mt-8">

            {t('auth.newHere')}{' '}

            <Link

              to="/register"

              className="font-semibold text-leaf-600 hover:text-leaf-500"

            >

              {t('auth.createFarm')}

            </Link>

            <span className="mx-2 text-brand-900/20">·</span>

            <Link

              to="/"

              className="font-semibold text-ink-700 hover:text-brand-950"

            >

              {t('common.backHome')}

            </Link>

          </p>

        </div>

      </main>

    </div>

  );

}



import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FEATURE_KEYS = [
  { mark: 'MT', key: 'multiTenant' },
  { mark: 'RB', key: 'rbac' },
  { mark: 'TV', key: 'tasks' },
  { mark: 'LC', key: 'livestock' },
  { mark: 'FS', key: 'finances' },
  { mark: 'VR', key: 'vacations' },
  { mark: 'JW', key: 'jwt' },
  { mark: 'SA', key: 'admin' },
];

export default function FeaturesPage() {
  const { t } = useTranslation();

  return (
    <main>
      <section className="border-b border-brand-900/5 bg-mist-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-leaf-600">
            {t('nav.features')}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-brand-950 sm:text-5xl">
            {t('features.heroTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-ink-500">
            {t('features.heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="fm-btn fm-btn-primary">
              {t('nav.startFree')}
            </Link>
            <Link to="/modules" className="fm-btn fm-btn-ghost">
              {t('features.seeModules')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.map((f) => (
            <article
              key={f.key}
              className="rounded-3xl border border-brand-900/5 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(12,31,23,0.08)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-xs font-bold tracking-wide text-leaf-400">
                {f.mark}
              </div>
              <h2 className="text-lg font-semibold text-brand-950">
                {t(`features.${f.key}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {t(`features.${f.key}.text`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

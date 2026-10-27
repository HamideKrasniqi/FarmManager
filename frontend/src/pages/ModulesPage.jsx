import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MODULE_IDS = [
  'dashboard',
  'tasksMod',
  'livestockMod',
  'cropsMod',
  'financesMod',
  'employeesMod',
  'salariesMod',
  'vacationsMod',
  'farmsMod',
];

export default function ModulesPage() {
  const { t } = useTranslation();

  return (
    <main>
      <section className="border-b border-brand-900/5 bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-leaf-400">
            {t('nav.modules')}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            {t('modulesPage.heroTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">{t('modulesPage.heroSubtitle')}</p>
          <Link to="/register" className="fm-btn mt-8 bg-white text-brand-950 hover:bg-mist-100">
            {t('modulesPage.createFarm')}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MODULE_IDS.map((id) => (
            <article
              key={id}
              className="flex flex-col rounded-3xl border border-brand-900/5 bg-mist-50 p-6"
            >
              <h2 className="font-display text-2xl font-bold text-brand-950">
                {t(`modulesPage.${id}.name`)}
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-leaf-600">
                {t(`modulesPage.${id}.for`)}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {['p1', 'p2', 'p3'].map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-ink-500">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                    {t(`modulesPage.${id}.${p}`)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-brand-900/5 bg-white p-8 text-center shadow-sm">
          <h3 className="font-display text-2xl font-bold text-brand-950">
            {t('modulesPage.readyTitle')}
          </h3>
          <p className="mt-2 text-ink-500">{t('modulesPage.readySubtitle')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="fm-btn fm-btn-dark">{t('common.signIn')}</Link>
            <Link to="/roles" className="fm-btn fm-btn-ghost">{t('modulesPage.compareRoles')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

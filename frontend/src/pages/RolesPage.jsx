import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ROLES = [
  {
    roleKey: 'SUPERADMIN',
    badgeKey: 'badgePlatform',
    color: 'from-emerald-500 to-teal-700',
    login: 'superadmin / SuperAdmin123!',
    canKeys: ['superAdminCan1', 'superAdminCan2', 'superAdminCan3', 'superAdminCan4', 'superAdminCan5'],
    cannotKeys: ['superAdminCannot1'],
  },
  {
    roleKey: 'OWNER',
    badgeKey: 'badgeFarm',
    color: 'from-leaf-500 to-leaf-700',
    login: 'owner / Owner123!',
    canKeys: ['ownerCan1', 'ownerCan2', 'ownerCan3', 'ownerCan4'],
    cannotKeys: ['ownerCannot1', 'ownerCannot2'],
  },
  {
    roleKey: 'MANAGER',
    badgeKey: 'badgeFarm',
    color: 'from-sky-500 to-sky-700',
    login: 'manager / Manager123!',
    canKeys: ['managerCan1', 'managerCan2', 'managerCan3', 'managerCan4'],
    cannotKeys: ['managerCannot1'],
  },
  {
    roleKey: 'WORKER',
    badgeKey: 'badgeFarm',
    color: 'from-amber-500 to-orange-600',
    login: 'worker / Worker123!',
    canKeys: ['workerCan1', 'workerCan2', 'workerCan3', 'workerCan4'],
    cannotKeys: ['workerCannot1', 'workerCannot2'],
  },
];

export default function RolesPage() {
  const { t } = useTranslation();

  return (
    <main>
      <section className="border-b border-brand-900/5 bg-mist-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-leaf-600">
            {t('nav.roles')}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-brand-950 sm:text-5xl">
            {t('rolesPage.heroTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-ink-500">{t('rolesPage.heroSubtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {ROLES.map((r) => (
            <article
              key={r.roleKey}
              className="overflow-hidden rounded-3xl border border-brand-900/5 bg-white shadow-sm"
            >
              <div className={`bg-gradient-to-r ${r.color} px-6 py-5 text-white`}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-bold">{t(`roles.${r.roleKey}`)}</h2>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                    {t(`rolesPage.${r.badgeKey}`)}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-white/85">{r.login}</p>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-leaf-600">
                    {t('rolesPage.can')}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {r.canKeys.map((key) => (
                      <li key={key} className="flex gap-2 text-sm text-ink-700">
                        <span className="text-leaf-600">+</span>
                        {t(`rolesPage.${key}`)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    {t('rolesPage.cannot')}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {r.cannotKeys.map((key) => (
                      <li key={key} className="flex gap-2 text-sm text-ink-500">
                        <span className="text-rose-500">−</span>
                        {t(`rolesPage.${key}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="fm-btn fm-btn-primary">{t('rolesPage.signInTry')}</Link>
          <Link to="/features" className="fm-btn fm-btn-ghost">{t('rolesPage.backFeatures')}</Link>
        </div>
      </section>
    </main>
  );
}

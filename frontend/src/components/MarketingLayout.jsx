import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicHeader from './PublicHeader';

/**
 * Shared chrome for public marketing pages (Features / Modules / Roles).
 */
export default function MarketingLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-ink-900">
      <PublicHeader />

      <Outlet />

      <footer className="relative overflow-hidden bg-brand-950 text-white">
        <div className="relative mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-500 text-sm font-bold">
                  F
                </span>
                <span className="font-display text-lg font-bold">
                  {t('common.appName')}
                </span>
              </Link>
              <p className="mt-3 text-sm text-white/55">
                {t('landing.footerTagline')}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-leaf-400">
                {t('nav.explore')}
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-white/65">
                <li>
                  <Link to="/features" className="hover:text-white">
                    {t('nav.features')}
                  </Link>
                </li>
                <li>
                  <Link to="/modules" className="hover:text-white">
                    {t('nav.modules')}
                  </Link>
                </li>
                <li>
                  <Link to="/roles" className="hover:text-white">
                    {t('nav.roles')}
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white">
                    {t('nav.pricing')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-leaf-400">
                {t('nav.account')}
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-white/65">
                <li>
                  <Link to="/login" className="hover:text-white">
                    {t('common.signIn')}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white">
                    {t('nav.registerFarm')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-leaf-400">
                {t('nav.stack')}
              </h4>
              <p className="mt-3 text-sm text-white/65">{t('landing.footerStack')}</p>
            </div>
          </div>
          <p className="mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
            {t('landing.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}

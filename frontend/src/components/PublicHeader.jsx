import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const LINKS = [
  { to: '/features', key: 'nav.features' },
  { to: '/modules', key: 'nav.modules' },
  { to: '/roles', key: 'nav.roles' },
  { to: '/pricing', key: 'nav.pricing' },
];

/**
 * Marketing / landing header. Desktop shows inline links.
 * Narrow screens collapse them into a menu so the bar never overflows.
 */
export default function PublicHeader({ overlay = false }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const onDark = overlay && !open;

  const close = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        onDark
          ? 'border-transparent bg-transparent'
          : 'border-brand-900/5 bg-white/95 shadow-sm backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
        <Link to="/" onClick={close} className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white shadow-lg shadow-leaf-600/30">
            F
          </span>
          <span
            className={`truncate font-display text-lg font-bold tracking-tight sm:text-xl ${
              onDark ? 'text-white' : 'text-brand-950'
            }`}
          >
            {t('common.appName')}
          </span>
        </Link>

        <nav
          className={`hidden items-center gap-6 text-sm font-medium lg:flex ${
            onDark ? 'text-white/85' : 'text-ink-700'
          }`}
        >
          {LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'text-leaf-600' : 'hover:text-leaf-600'
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden sm:inline-flex">
            <LanguageSwitcher variant={onDark ? 'dark' : 'light'} />
          </span>
          <Link
            to="/login"
            onClick={close}
            className={`!hidden px-2 py-2 text-sm font-semibold sm:!inline ${
              onDark ? 'text-white/90 hover:text-white' : 'text-ink-700 hover:text-leaf-600'
            }`}
          >
            {t('common.signIn')}
          </Link>
          <Link
            to="/register"
            onClick={close}
            className={`fm-btn !hidden !px-3 !py-2 text-xs sm:!inline-flex sm:text-sm ${
              onDark ? 'bg-white text-brand-950 hover:bg-mist-100' : 'fm-btn-dark'
            }`}
          >
            {t('nav.startFree')}
          </Link>
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold lg:hidden ${
              onDark
                ? 'border-white/25 text-white'
                : 'border-brand-900/10 text-brand-950'
            }`}
            aria-expanded={open}
            aria-label={open ? t('common.closeMenu') : t('common.menu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-900/5 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-sm font-semibold ${
                    isActive ? 'bg-leaf-600/10 text-leaf-600' : 'text-ink-700'
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 border-t border-brand-900/5 pt-4">
            <LanguageSwitcher className="w-full justify-center sm:hidden" />
            <Link
              to="/login"
              onClick={close}
              className="fm-btn fm-btn-ghost w-full sm:hidden"
            >
              {t('common.signIn')}
            </Link>
            <Link
              to="/register"
              onClick={close}
              className="fm-btn fm-btn-dark w-full sm:hidden"
            >
              {t('nav.startFree')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

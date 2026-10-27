import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Farmbrite-style shell with left sidebar for Owner / Manager / SuperAdmin.
 * Worker keeps a compact top navigation.
 */
export default function AppLayout() {
  const { t } = useTranslation();
  const { user, logout, isSuperAdmin, isOwner, isFarmStaff, isWorker } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sideClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-leaf-600/10 text-leaf-600'
        : 'text-ink-700 hover:bg-mist-100'
    }`;

  // Sidebar for SuperAdmin, Owner, Manager
  if (isFarmStaff || isSuperAdmin) {
    const links = isSuperAdmin
      ? [
          { to: '/dashboard', label: t('nav.dashboard'), end: true },
          { to: '/admin/farms', label: t('nav.farmsPricing') },
        ]
      : [
          { to: '/dashboard', label: t('nav.dashboard'), end: true },
          { to: '/tasks', label: t('nav.tasks') },
          { to: '/animals', label: t('nav.livestock') },
          { to: '/crops', label: t('nav.crops') },
          { to: '/vacations', label: t('nav.vacations') },
          ...(isOwner
            ? [
                { to: '/finances', label: t('nav.accounting') },
                { to: '/salaries', label: t('nav.salaries') },
                { to: '/employees', label: t('nav.employees') },
              ]
            : []),
        ];

    const brandSub = isSuperAdmin ? t('nav.platformAdmin') : user?.farm_name;
    const roleLabel = t(`roles.${user?.role}`, { defaultValue: user?.role });

    return (
      <div className="flex min-h-screen bg-[#f4f6f5]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-brand-900/5 bg-white lg:flex">
          <div className="flex items-center gap-2.5 border-b border-brand-900/5 px-5 py-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white">
              F
            </span>
            <div>
              <div className="font-display text-base font-bold text-brand-950">
                {t('common.appName')}
              </div>
              <div className="truncate text-[11px] text-ink-500">{brandSub}</div>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={sideClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-brand-900/5 p-4">
            <LanguageSwitcher className="mb-3 w-full justify-center" />
            <div className="text-sm font-semibold text-brand-950">
              {user?.username}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-leaf-600">
              {roleLabel}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-brand-900/10 px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-mist-100"
            >
              {t('common.signOut')}
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-brand-950/40"
              aria-label={t('common.closeMenu')}
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <span className="font-display font-bold text-brand-950">
                  {t('common.appName')}
                </span>
                <button type="button" onClick={() => setMobileOpen(false)}>
                  ✕
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setMobileOpen(false)}
                    className={sideClass}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
              <div className="border-t border-brand-900/5 p-4">
                <div className="truncate text-sm font-semibold text-brand-950">
                  {user?.username}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-leaf-600">
                  {roleLabel}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-lg border border-brand-900/10 px-3 py-2 text-left text-sm font-medium text-ink-700"
                >
                  {t('common.signOut')}
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-brand-900/5 bg-white/95 px-3 py-3 backdrop-blur sm:px-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="shrink-0 rounded-lg border border-brand-900/10 px-3 py-1.5 text-sm lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                {t('common.menu')}
              </button>
              <div className="hidden truncate text-sm text-ink-500 sm:block">
                {t('common.welcomeUser', {
                  name: user?.first_name || user?.username,
                })}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher className="lg:hidden" />
              {isSuperAdmin ? (
                <NavLink
                  to="/admin/farms"
                  className="fm-btn fm-btn-dark !hidden !py-1.5 text-xs sm:!inline-flex"
                >
                  {t('nav.managePricing')}
                </NavLink>
              ) : (
                <NavLink
                  to="/tasks"
                  className="fm-btn fm-btn-dark !hidden !py-1.5 text-xs sm:!inline-flex"
                >
                  {t('nav.quickAddTask')}
                </NavLink>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Worker compact top nav
  const linkClass = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-900 text-white shadow-sm'
        : 'text-ink-700 hover:bg-mist-100'
    }`;

  const roleLabel = t(`roles.${user?.role}`, { defaultValue: user?.role });

  return (
    <div className="min-h-screen bg-mist-50">
      <header className="sticky top-0 z-30 border-b border-brand-900/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white">
              F
            </span>
            <div>
              <div className="font-display text-lg font-bold leading-none text-brand-950">
                {t('common.appName')}
              </div>
              {user?.farm_name && (
                <div className="mt-0.5 text-xs text-ink-500">{user.farm_name}</div>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {isWorker && (
              <>
                <NavLink to="/dashboard" end className={linkClass}>
                  {t('nav.myTasks')}
                </NavLink>
                <NavLink to="/vacations" className={linkClass}>
                  {t('nav.vacations')}
                </NavLink>
                <NavLink to="/salaries" className={linkClass}>
                  {t('nav.mySalary')}
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <LanguageSwitcher />
            <div className="text-right leading-tight">
              <div className="font-semibold text-brand-950">{user?.username}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-leaf-600">
                {roleLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="fm-btn fm-btn-ghost !py-1.5"
            >
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

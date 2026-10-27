import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

/**
 * Compact EN / SQ toggle for headers and auth pages.
 */
export default function LanguageSwitcher({ className = '', variant = 'light' }) {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith('sq') ? 'sq' : 'en';

  const base =
    variant === 'dark'
      ? 'border-white/20 bg-white/10 text-white'
      : 'border-brand-900/10 bg-white text-ink-700';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border p-0.5 ${base} ${className}`}
      role="group"
      aria-label={t('language.label')}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = current === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              active
                ? variant === 'dark'
                  ? 'bg-white text-brand-950'
                  : 'bg-leaf-600 text-white shadow-sm'
                : variant === 'dark'
                  ? 'text-white/80 hover:text-white'
                  : 'text-ink-500 hover:text-brand-950'
            }`}
            aria-pressed={active}
          >
            {lang.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

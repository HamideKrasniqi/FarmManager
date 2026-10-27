import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PricingPlanCards from '../components/PricingPlanCards';
import { PRICING_PLANS } from '../constants/pricingPlans';

export default function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main>
      <section className="border-b border-brand-900/5 bg-mist-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            {t('pricing.badge')}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight text-brand-950 sm:text-5xl">
            {t('pricing.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            {t('pricing.subtitle')}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <PricingPlanCards plans={PRICING_PLANS} readOnly />

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate('/register?plan=BASIC')}
            className="fm-btn fm-btn-dark px-8 py-3"
          >
            {t('pricing.startBasic')}
          </button>
          <Link
            to="/register?plan=FREE"
            className="text-sm font-semibold text-leaf-600 hover:text-leaf-500"
          >
            {t('pricing.orFree')}
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-ink-500">
          {t('pricing.footerNote')}
        </p>
      </section>
    </main>
  );
}

import { useTranslation } from 'react-i18next';
import { PRICING_PLANS } from '../constants/pricingPlans';

function formatPrice(plan, t) {
  if (plan.price === 0) return t('common.free');
  return `${plan.currency === 'EUR' ? '€' : plan.currency}${plan.price}`;
}

/**
 * Selectable or display-only pricing cards for registration / marketing.
 */
export default function PricingPlanCards({
  plans = PRICING_PLANS,
  selectedPlan,
  onSelect,
  compact = false,
  readOnly = false,
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-4'}`}
    >
      {plans.map((plan) => {
        const selected = selectedPlan === plan.id;
        const interactive = Boolean(onSelect) && !readOnly;
        const name = t(`plans.${plan.id}.name`, { defaultValue: plan.name });
        const description = t(`plans.${plan.id}.description`, {
          defaultValue: plan.description,
        });
        const features = t(`planFeatures.${plan.id}`, {
          returnObjects: true,
          defaultValue: plan.features,
        });

        const body = (
          <>
            {plan.highlighted && (
              <span className="absolute -top-2.5 left-4 rounded-full bg-leaf-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {t('common.popular')}
              </span>
            )}
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-brand-950">
                {name}
              </h3>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-brand-950">
                  {formatPrice(plan, t)}
                </span>
                {plan.price > 0 && (
                  <span className="text-xs text-ink-500">
                    /{t('common.month')}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              {description}
            </p>
            {!compact && Array.isArray(features) && (
              <ul className="mt-3 space-y-1.5 text-xs text-ink-600">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-leaf-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        );

        if (interactive) {
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={`relative rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-leaf-500 bg-leaf-50 ring-2 ring-leaf-500/30'
                  : 'border-brand-900/10 bg-white hover:border-leaf-300 hover:shadow-md'
              } ${plan.highlighted && !selected ? 'border-leaf-200' : ''}`}
            >
              {body}
            </button>
          );
        }

        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-4 ${
              plan.highlighted
                ? 'border-leaf-300 bg-leaf-50/50 shadow-md'
                : 'border-brand-900/10 bg-white'
            }`}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}

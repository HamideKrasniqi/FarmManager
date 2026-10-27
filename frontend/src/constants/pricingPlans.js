/** Platform subscription packages — keep in sync with Farm.Plan in backend. */
export const PRICING_PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    currency: 'EUR',
    period: 'month',
    description: 'Try FarmManager with core features for small farms.',
    features: [
      '1 farm tenant',
      'Up to 3 users',
      'Tasks & livestock',
      'Basic dashboard',
    ],
    highlighted: false,
  },
  {
    id: 'BASIC',
    name: 'Basic',
    price: 29,
    currency: 'EUR',
    period: 'month',
    description: 'Best for growing farms starting digital operations.',
    features: [
      'Unlimited users',
      'Crops & vacations',
      'Task verification',
      'Email support',
    ],
    highlighted: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 79,
    currency: 'EUR',
    period: 'month',
    description: 'Full operations plus finances and employee management.',
    features: [
      'Everything in Basic',
      'Finances & salaries',
      'Employee management',
      'Priority support',
    ],
    highlighted: false,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 199,
    currency: 'EUR',
    period: 'month',
    description: 'Large farms with advanced needs and custom limits.',
    features: [
      'Everything in Pro',
      'Dedicated onboarding',
      'Custom reporting',
      'SLA & admin tools',
    ],
    highlighted: false,
  },
];

export function getPlanById(planId) {
  return PRICING_PLANS.find((p) => p.id === planId);
}

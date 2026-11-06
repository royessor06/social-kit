export const PLANS = {
  FREE: {
    name: 'Gratuit',
    maxSites: 0,
    unlimitedPosters: false,
    posterPayment: 'Paiement à l’acte pour les affiches',
    price: 'Gratuit',
  },
  STARTER: {
    name: 'Starter',
    maxSites: 0,
    unlimitedPosters: true,
    posterPayment: 'Affiches illimitées',
    price: 'Bientôt disponible',
  },
  BUSINESS: {
    name: 'Business',
    maxSites: 1,
    unlimitedPosters: true,
    posterPayment: 'Affiches illimitées',
    price: 'Bientôt disponible',
  },
  PREMIUM: {
    name: 'Premium',
    maxSites: 5,
    unlimitedPosters: true,
    posterPayment: 'Affiches illimitées',
    price: 'Bientôt disponible',
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlan(plan: string) {
  return PLANS[plan as PlanKey] ?? PLANS.FREE
}

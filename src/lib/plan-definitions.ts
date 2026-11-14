export const PLANS = {
  FREE: {
    name: 'Gratuit',
    maxSites: 0,
    unlimitedPosters: true,
    posterPayment: 'Création et téléchargement d’affiches gratuits',
    price: 'Gratuit',
    priceXof: 0,
    premiumTemplates: false,
  },
  STARTER: {
    name: 'Starter',
    maxSites: 0,
    unlimitedPosters: true,
    posterPayment: 'Affiches illimitées sans filigrane',
    price: '2 000 FCFA / mois',
    priceXof: 2000,
    premiumTemplates: false,
  },
  BUSINESS: {
    name: 'Business',
    maxSites: 1,
    unlimitedPosters: true,
    posterPayment: 'Affiches illimitées sans filigrane',
    price: '5 000 FCFA / mois',
    priceXof: 5000,
    premiumTemplates: false,
  },
  PREMIUM: {
    name: 'Premium',
    maxSites: 5,
    unlimitedPosters: true,
    posterPayment: 'Affiches illimitées sans filigrane',
    price: '10 000 FCFA / mois',
    priceXof: 10000,
    premiumTemplates: true,
  },
} as const

export type PlanKey = keyof typeof PLANS
export type PaidPlanKey = Exclude<PlanKey, 'FREE'>

export function isPaidPlan(plan: string): plan is PaidPlanKey {
  return plan === 'STARTER' || plan === 'BUSINESS' || plan === 'PREMIUM'
}

export function getPlan(plan: string) {
  return PLANS[plan as PlanKey] ?? PLANS.FREE
}

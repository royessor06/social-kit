import type { TemplateCategoryId, TemplateCategoryMeta } from './types'

export const TEMPLATE_CATEGORIES: readonly TemplateCategoryMeta[] = [
  {
    id: 'restaurants-alimentation',
    label: 'Restaurants et alimentation',
    shortLabel: 'Restaurants',
    description: 'Restaurants, maquis, traiteurs, pâtisseries et cafés.',
  },
  {
    id: 'boutiques-commerce',
    label: 'Boutiques et commerce',
    shortLabel: 'Boutiques',
    description: 'Boutiques de mode, artisanat, épiceries et magasins locaux.',
  },
  {
    id: 'services-professionnels',
    label: 'Services professionnels',
    shortLabel: 'Services',
    description: 'Cabinets de conseil, artisans, dépannage et prestataires B2B.',
  },
  {
    id: 'beaute-bien-etre',
    label: 'Beauté et bien-être',
    shortLabel: 'Beauté',
    description: 'Salons de coiffure, instituts, spas et soins esthétiques.',
  },
  {
    id: 'technologie-numerique',
    label: 'Technologie et numérique',
    shortLabel: 'Technologie',
    description: 'Agences digitales, studios web, startups et services IT.',
  },
  {
    id: 'education-formation',
    label: 'Éducation et formation',
    shortLabel: 'Formation',
    description: 'Centres de formation, écoles, coachs et ateliers.',
  },
  {
    id: 'evenementiel',
    label: 'Événementiel',
    shortLabel: 'Événementiel',
    description: 'Agences événementielles, conférences, concerts et réceptions.',
  },
  {
    id: 'immobilier-construction',
    label: 'Immobilier et construction',
    shortLabel: 'Immobilier',
    description: 'Agences immobilières, promoteurs, architectes et BTP.',
  },
  {
    id: 'portfolio-creation',
    label: 'Portfolio et création',
    shortLabel: 'Portfolio',
    description: 'Photographes, designers, créateurs et indépendants.',
  },
] as const

export const CATEGORY_BY_ID: Record<TemplateCategoryId, TemplateCategoryMeta> =
  Object.fromEntries(
    TEMPLATE_CATEGORIES.map((category) => [category.id, category])
  ) as Record<TemplateCategoryId, TemplateCategoryMeta>

export function getCategoryMeta(categoryId: TemplateCategoryId): TemplateCategoryMeta {
  return CATEGORY_BY_ID[categoryId]
}

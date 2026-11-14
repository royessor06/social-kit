import type { TemplateCategoryId } from '../templates'

export type WizardStepId = 1 | 2 | 3 | 4 | 5 | 6

export type WizardVisualMoodId =
  | 'elegant'
  | 'moderne'
  | 'minimaliste'
  | 'dynamique'
  | 'naturel'
  | 'premium'

export type WizardTypographyPresetId =
  | 'editorial-serif'
  | 'moderne-sans'
  | 'classique-equilibre'
  | 'institutionnel-net'

export type WizardCtaDestination =
  | 'contact'
  | 'catalogue'
  | 'whatsapp'
  | 'telephone'

export type WizardCatalogItem = {
  id: string
  name: string
  description: string
  imageUrl?: string
}

export type WizardSocialLinks = {
  facebook: string
  instagram: string
  linkedin: string
  website: string
}

export type WizardFormData = {
  // Étape 1 — Informations générales
  businessName: string
  sector: string
  activityType: string
  slogan: string
  shortDescription: string

  // Étape 2 — Identité visuelle
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  typographyId: WizardTypographyPresetId
  mood: WizardVisualMoodId

  // Étape 3 — Présentation de l'entreprise
  heroTitle: string
  heroText: string
  heroImageUrl: string
  ctaLabel: string
  ctaDestination: WizardCtaDestination

  // Étape 4 — Services et produits
  items: WizardCatalogItem[]

  // Étape 5 — Coordonnées et contact
  phone: string
  whatsapp: string
  address: string
  city: string
  openingHours: string
  email: string
  socialLinks: WizardSocialLinks
}

export type WizardStepMeta = {
  id: WizardStepId
  title: string
  shortTitle: string
  description: string
}

export const WIZARD_STEPS: readonly WizardStepMeta[] = [
  {
    id: 1,
    title: 'Informations générales',
    shortTitle: 'Entreprise',
    description:
      'Présentez votre activité en quelques lignes pour adapter la structure de votre site.',
  },
  {
    id: 2,
    title: 'Identité visuelle',
    shortTitle: 'Identité',
    description:
      'Choisissez votre logo, vos couleurs, votre typographie et l’ambiance de votre marque.',
  },
  {
    id: 3,
    title: 'Présentation de l’entreprise',
    shortTitle: 'Présentation',
    description:
      'Rédigez l’accroche principale et l’image d’ouverture que verront vos visiteurs.',
  },
  {
    id: 4,
    title: 'Services et produits',
    shortTitle: 'Offre',
    description:
      'Ajoutez librement vos offres principales. Vous pourrez les compléter ou les ajuster ensuite.',
  },
  {
    id: 5,
    title: 'Coordonnées et contact',
    shortTitle: 'Contact',
    description:
      'Indiquez comment vos clients peuvent vous joindre, vous écrire sur WhatsApp ou vous rendre visite.',
  },
  {
    id: 6,
    title: 'Récapitulatif et génération',
    shortTitle: 'Récapitulatif',
    description:
      'Vérifiez vos informations, prévisualisez le rendu et préparez votre site avant publication.',
  },
] as const

export type WizardFieldErrors = Record<string, string>

export type WizardValidationResult = {
  valid: boolean
  errors: WizardFieldErrors
  stepErrors: Partial<Record<WizardStepId, WizardFieldErrors>>
}

export type WizardPalettePreset = {
  id: string
  name: string
  sectorHint: string
  primary: string
  secondary: string
  mood: WizardVisualMoodId
  recommendedCategories?: TemplateCategoryId[]
}

export type WizardTypographyPreset = {
  id: WizardTypographyPresetId
  label: string
  description: string
  headingFont: string
  bodyFont: string
}

export type WizardMoodOption = {
  id: WizardVisualMoodId
  label: string
  description: string
}

export type WizardTemplateGuidance = {
  itemNounSingular: string
  itemNounPlural: string
  sectionHeadingLabel: string
  addItemButtonLabel: string
  namePlaceholder: string
  activityTypePlaceholder: string
  sloganPlaceholder: string
  descriptionPlaceholder: string
  heroTitlePlaceholder: string
  heroTextPlaceholder: string
  defaultCtaLabel: string
  defaultCtaDestination: WizardCtaDestination
  heroExamples: readonly string[]
  businessExample: {
    businessName: string
    activityType: string
    slogan: string
    shortDescription: string
  }
  itemExample: {
    name: string
    description: string
  }
}

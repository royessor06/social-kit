import type { ResolvedSiteTemplate, TemplateCategoryId } from '../templates'
import type {
  WizardMoodOption,
  WizardPalettePreset,
  WizardTemplateGuidance,
  WizardTypographyPreset,
  WizardTypographyPresetId,
  WizardVisualMoodId,
} from './types'

export const WIZARD_PALETTE_PRESETS: readonly WizardPalettePreset[] = [
  {
    id: 'terre-epices',
    name: 'Terre & Épices',
    sectorHint: 'Restauration, cuisine artisanale',
    primary: '#a34d32',
    secondary: '#29251f',
    mood: 'elegant',
    recommendedCategories: ['restaurants-alimentation'],
  },
  {
    id: 'sauge-naturelle',
    name: 'Sauge & Lin',
    sectorHint: 'Boutique, artisanat, bien-être',
    primary: '#59634b',
    secondary: '#262820',
    mood: 'naturel',
    recommendedCategories: ['boutiques-commerce', 'beaute-bien-etre'],
  },
  {
    id: 'bleu-conseil',
    name: 'Bleu Studio',
    sectorHint: 'Services, conseil, formation',
    primary: '#315f72',
    secondary: '#202b30',
    mood: 'moderne',
    recommendedCategories: [
      'services-professionnels',
      'technologie-numerique',
      'education-formation',
    ],
  },
  {
    id: 'emeraude-pro',
    name: 'Émeraude Atelier',
    sectorHint: 'Commerce local, numérique, immobilier',
    primary: '#059669',
    secondary: '#0f172a',
    mood: 'dynamique',
    recommendedCategories: ['technologie-numerique', 'immobilier-construction'],
  },
  {
    id: 'anthracite-sobre',
    name: 'Anthracite Épuré',
    sectorHint: 'Portfolio, architecture, création',
    primary: '#1e293b',
    secondary: '#0f172a',
    mood: 'minimaliste',
    recommendedCategories: ['portfolio-creation', 'immobilier-construction'],
  },
  {
    id: 'bordeaux-prestige',
    name: 'Bordeaux Prestige',
    sectorHint: 'Événementiel, gastronomie, luxe',
    primary: '#881337',
    secondary: '#1c1917',
    mood: 'premium',
    recommendedCategories: ['evenementiel', 'restaurants-alimentation', 'beaute-bien-etre'],
  },
] as const

export const WIZARD_TYPOGRAPHY_PRESETS: readonly WizardTypographyPreset[] = [
  {
    id: 'editorial-serif',
    label: 'Éditorial classique',
    description: 'Titres en Georgia serif et corps Arial fluide — idéal pour la restauration et le savoir-faire.',
    headingFont: 'Georgia, serif',
    bodyFont: 'Arial, sans-serif',
  },
  {
    id: 'classique-equilibre',
    label: 'Boutique soignée',
    description: 'Titres raffinés et textes courts aérés — adapté au commerce, à la mode et au bien-être.',
    headingFont: 'Georgia, serif',
    bodyFont: 'Helvetica Neue, Arial, sans-serif',
  },
  {
    id: 'moderne-sans',
    label: 'Moderne & direct',
    description: 'Sans-serif contemporaine haute lisibilité pour services, tech et formation.',
    headingFont: 'Arial, Helvetica, sans-serif',
    bodyFont: 'Arial, Helvetica, sans-serif',
  },
  {
    id: 'institutionnel-net',
    label: 'Structuré & sobre',
    description: 'Lignes géométriques nettes pour inspirer confiance sur les prestations B2B.',
    headingFont: 'Trebuchet MS, Arial, sans-serif',
    bodyFont: 'Arial, sans-serif',
  },
] as const

export const WIZARD_MOODS: readonly WizardMoodOption[] = [
  {
    id: 'elegant',
    label: 'Élégant',
    description: 'Chaleureux, soigné et rassurant.',
  },
  {
    id: 'moderne',
    label: 'Moderne',
    description: 'Clair, structuré et actuel.',
  },
  {
    id: 'minimaliste',
    label: 'Minimaliste',
    description: 'Épuré et centré sur l’essentiel.',
  },
  {
    id: 'dynamique',
    label: 'Dynamique',
    description: 'Énergique et tourné vers l’action.',
  },
  {
    id: 'naturel',
    label: 'Naturel',
    description: 'Authentique, doux et artisanal.',
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Haut de gamme et affirmé.',
  },
] as const

export function getDefaultMoodForCategory(
  categoryId: TemplateCategoryId
): WizardVisualMoodId {
  switch (categoryId) {
    case 'restaurants-alimentation':
      return 'elegant'
    case 'boutiques-commerce':
    case 'beaute-bien-etre':
      return 'naturel'
    case 'portfolio-creation':
      return 'minimaliste'
    case 'evenementiel':
      return 'premium'
    case 'technologie-numerique':
      return 'dynamique'
    default:
      return 'moderne'
  }
}

export function getDefaultTypographyForTemplate(
  template: ResolvedSiteTemplate
): WizardTypographyPresetId {
  const heading = template.defaultTheme.typography.headingFont.toLowerCase()
  if (heading.includes('georgia') || heading.includes('serif')) {
    return template.categoryId === 'boutiques-commerce'
      ? 'classique-equilibre'
      : 'editorial-serif'
  }
  return template.categoryId === 'services-professionnels'
    ? 'institutionnel-net'
    : 'moderne-sans'
}

const GUIDANCE_BY_CATEGORY: Partial<Record<TemplateCategoryId, WizardTemplateGuidance>> = {
  'restaurants-alimentation': {
    itemNounSingular: 'plat ou spécialité',
    itemNounPlural: 'plats et spécialités',
    sectionHeadingLabel: 'Votre carte & spécialités',
    addItemButtonLabel: 'Ajouter un plat ou une spécialité',
    namePlaceholder: 'Ex. Chez Marie',
    activityTypePlaceholder: 'Ex. Restaurant grill, traiteur, maquis, pâtisserie',
    sloganPlaceholder: 'Ex. Les saveurs du pays, faites maison',
    descriptionPlaceholder:
      'Ex. Cuisine généreuse préparée chaque jour avec des produits frais du marché, sur place ou à emporter.',
    heroTitlePlaceholder: 'Ex. Découvrez une cuisine authentique et généreuse.',
    heroTextPlaceholder:
      'Ex. Installez-vous dans un cadre convivial ou commandez vos plats favoris préparés à la minute.',
    defaultCtaLabel: 'Réserver une table',
    defaultCtaDestination: 'contact',
    heroExamples: [
      'Découvrez une cuisine authentique et généreuse.',
      'Le goût du fait maison, servi avec chaleur.',
      'Vos spécialités locales préparées chaque matin.',
    ],
    businessExample: {
      businessName: 'Table du Soleil',
      activityType: 'Restaurant & traiteur local',
      slogan: 'Cuisine maison et produits du marché',
      shortDescription:
        'Restaurant chaleureux proposant grillades, poissons frais et plats traditionnels préparés chaque jour.',
    },
    itemExample: {
      name: 'Poulet braisé aux épices douces',
      description: 'Mariné 12 heures, grillé au feu de bois et servi avec alloco ou riz parfumé.',
    },
  },
  'boutiques-commerce': {
    itemNounSingular: 'produit ou collection',
    itemNounPlural: 'produits et collections',
    sectionHeadingLabel: 'Votre catalogue & collections',
    addItemButtonLabel: 'Ajouter un produit ou une collection',
    namePlaceholder: 'Ex. Marie Boutique',
    activityTypePlaceholder: 'Ex. Prêt-à-porter, maroquinerie, épicerie fine, artisanat',
    sloganPlaceholder: 'Ex. Votre élégance, notre priorité.',
    descriptionPlaceholder:
      'Ex. Boutique spécialisée dans la vente de vêtements et accessoires choisis pour leur qualité et leur durabilité.',
    heroTitlePlaceholder: 'Ex. Découvrez notre nouvelle collection.',
    heroTextPlaceholder:
      'Ex. Des pièces sélectionnées avec soin pour allier style, confort et authenticité au quotidien.',
    defaultCtaLabel: 'Découvrir la sélection',
    defaultCtaDestination: 'catalogue',
    heroExamples: [
      'Découvrez notre nouvelle collection.',
      'Des créations choisies avec soin pour votre quotidien.',
      'Qualité, style et savoir-faire en boutique.',
    ],
    businessExample: {
      businessName: 'Marie Boutique',
      activityType: 'Prêt-à-porter et accessoires',
      slogan: 'Votre élégance, notre priorité.',
      shortDescription:
        'Boutique spécialisée dans la vente de vêtements et accessoires pour hommes et femmes.',
    },
    itemExample: {
      name: 'Sac cabas en cuir souple',
      description: 'Format idéal pour le quotidien, finitions soignées et doublure résistante.',
    },
  },
  'services-professionnels': {
    itemNounSingular: 'service ou expertise',
    itemNounPlural: 'prestations et domaines d’expertise',
    sectionHeadingLabel: 'Vos prestations & expertises',
    addItemButtonLabel: 'Ajouter une prestation',
    namePlaceholder: 'Ex. Horizon Conseil',
    activityTypePlaceholder: 'Ex. Conseil, comptabilité, maintenance, agence, artisanat',
    sloganPlaceholder: 'Ex. Des idées claires. Des résultats concrets.',
    descriptionPlaceholder:
      'Ex. Accompagnement personnalisé des entrepreneurs et PME avec des solutions pratiques et réactives.',
    heroTitlePlaceholder: 'Ex. Des solutions adaptées à vos besoins.',
    heroTextPlaceholder:
      'Ex. Nous intervenons à vos côtés pour sécuriser vos projets, optimiser vos coûts et gagner du temps.',
    defaultCtaLabel: 'Parlons de votre projet',
    defaultCtaDestination: 'contact',
    heroExamples: [
      'Des solutions adaptées à vos besoins.',
      'Faisons avancer vos projets avec méthode.',
      'Un partenaire fiable pour votre activité.',
    ],
    businessExample: {
      businessName: 'Atelier Kossi Conseil',
      activityType: 'Conseil & accompagnement d’entreprises',
      slogan: 'Des solutions concrètes pour vos projets',
      shortDescription:
        'Cabinet de proximité accompagnant commerçants et PME dans leur organisation et leur développement.',
    },
    itemExample: {
      name: 'Audit et organisation commerciale',
      description: 'Diagnostic complet de vos processus et plan d’action prioritaire sous 7 jours.',
    },
  },
}

const DEFAULT_GUIDANCE: WizardTemplateGuidance = {
  itemNounSingular: 'service ou produit',
  itemNounPlural: 'services et produits',
  sectionHeadingLabel: 'Vos services et produits phares',
  addItemButtonLabel: 'Ajouter un élément',
  namePlaceholder: 'Ex. Nom de votre activité',
  activityTypePlaceholder: 'Ex. Précisez votre spécialité ou métier',
  sloganPlaceholder: 'Ex. La qualité proche de vous',
  descriptionPlaceholder:
    'Ex. Présentez brièvement ce que vous proposez, votre savoir-faire et ce qui vous distingue.',
  heroTitlePlaceholder: 'Ex. Bienvenue chez vous, découvrez notre savoir-faire.',
  heroTextPlaceholder:
    'Ex. Expliquez en deux phrases comment vous aidez vos clients et pourquoi vous choisir.',
  defaultCtaLabel: 'Nous contacter',
  defaultCtaDestination: 'contact',
  heroExamples: [
    'Des solutions fiables pensées pour vos besoins.',
    'Un savoir-faire reconnu au service de vos projets.',
    'Qualité, écoute et réactivité au quotidien.',
  ],
  businessExample: {
    businessName: 'Maison Horizon',
    activityType: 'Activité locale & services',
    slogan: 'À votre écoute au quotidien',
    shortDescription:
      'Entreprise locale dédiée à la qualité de service et à la satisfaction durable de ses clients.',
  },
  itemExample: {
    name: 'Offre principale',
    description: 'Présentation claire des bénéfices et de l’accompagnement inclus pour vos clients.',
  },
}

export function getWizardTemplateGuidance(
  template: ResolvedSiteTemplate
): WizardTemplateGuidance {
  const byCategory = GUIDANCE_BY_CATEGORY[template.categoryId]
  if (byCategory) return byCategory

  if (template.id === 'restaurant') {
    return GUIDANCE_BY_CATEGORY['restaurants-alimentation'] ?? DEFAULT_GUIDANCE
  }
  if (template.id === 'boutique') {
    return GUIDANCE_BY_CATEGORY['boutiques-commerce'] ?? DEFAULT_GUIDANCE
  }
  if (template.id === 'service') {
    return GUIDANCE_BY_CATEGORY['services-professionnels'] ?? DEFAULT_GUIDANCE
  }

  return DEFAULT_GUIDANCE
}

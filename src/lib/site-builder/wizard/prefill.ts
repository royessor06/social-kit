import type { ResolvedSiteTemplate } from '../templates'
import {
  getDefaultMoodForCategory,
  getDefaultTypographyForTemplate,
  getWizardTemplateGuidance,
} from './presets'
import type { WizardCatalogItem, WizardFormData } from './types'

function readString(
  source: Record<string, string> | undefined,
  keys: string[],
  fallback = ''
): string {
  if (!source) return fallback
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return fallback
}

function hydrateItemsFromLegacy(
  source: Record<string, string> | undefined
): WizardCatalogItem[] {
  if (!source) return []
  const items: WizardCatalogItem[] = []
  for (let index = 1; index <= 6; index += 1) {
    const name = readString(source, [`service_${index}`, `produit_${index}`])
    const description = readString(source, [
      `service_${index}_desc`,
      `service_${index}_description`,
      `produit_${index}_desc`,
      `produit_${index}_description`,
    ])
    const imageUrl = readString(source, [
      `service_${index}_image`,
      `produit_${index}_image`,
    ])

    if (name || description || imageUrl) {
      items.push({
        id: `item-${index}`,
        name,
        description,
        ...(imageUrl ? { imageUrl } : {}),
      })
    }
  }
  return items
}

export function createInitialWizardState(
  template: ResolvedSiteTemplate,
  existingFormData?: Record<string, string>
): WizardFormData {
  const guidance = getWizardTemplateGuidance(template)
  const rawAddress = readString(existingFormData, ['adresse'])
  const hexColor = readString(
    existingFormData,
    ['couleur_accent'],
    template.defaultTheme.palette.primary
  )

  return {
    businessName: readString(existingFormData, ['nom_entreprise']),
    sector: template.categoryLabel,
    activityType: readString(existingFormData, ['type_activite']),
    slogan: readString(existingFormData, ['slogan']),
    shortDescription: readString(existingFormData, ['description_entreprise']),

    logoUrl: readString(existingFormData, ['logo']),
    primaryColor: /^#[\da-f]{6}$/i.test(hexColor)
      ? hexColor
      : template.defaultTheme.palette.primary,
    secondaryColor: template.defaultTheme.palette.secondary,
    typographyId: getDefaultTypographyForTemplate(template),
    mood: getDefaultMoodForCategory(template.categoryId),

    heroTitle: readString(existingFormData, ['hero_titre']),
    heroText: readString(existingFormData, ['hero_texte']),
    heroImageUrl: readString(existingFormData, ['hero_image']),
    ctaLabel: readString(existingFormData, ['cta_label'], guidance.defaultCtaLabel),
    ctaDestination: guidance.defaultCtaDestination,

    items: hydrateItemsFromLegacy(existingFormData),

    phone: readString(existingFormData, ['telephone']),
    whatsapp: readString(existingFormData, ['whatsapp']),
    address: rawAddress,
    city: readString(existingFormData, ['ville']),
    openingHours: readString(existingFormData, ['horaires']),
    email: readString(existingFormData, ['email']),
    socialLinks: {
      facebook: readString(existingFormData, ['facebook']),
      instagram: readString(existingFormData, ['instagram']),
      linkedin: readString(existingFormData, ['linkedin']),
      website: readString(existingFormData, ['site_web']),
    },
  }
}

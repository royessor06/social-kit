import type { ResolvedSiteTemplate } from '../templates'
import {
  getDefaultMoodForCategory,
  getDefaultTypographyForTemplate,
  getWizardTemplateGuidance,
} from './presets'
import type {
  WizardCatalogItem,
  WizardCtaDestination,
  WizardFormData,
  WizardSocialLinks,
  WizardTypographyPresetId,
  WizardVisualMoodId,
} from './types'
import { isValidHexColor, isValidUploadedImageUrl } from './validation'

export type WizardRetainedDraftData = {
  activityType?: string
  shortDescription?: string
  logoUrl?: string
  secondaryColor?: string
  typographyId?: WizardTypographyPresetId
  mood?: WizardVisualMoodId
  ctaLabel?: string
  ctaDestination?: WizardCtaDestination
  whatsapp?: string
  email?: string
  socialLinks?: Partial<WizardSocialLinks>
  extraCatalogItems?: WizardCatalogItem[]
}

export type WizardTransformationResult = {
  templateFormData: Record<string, string>
  retainedFields: WizardRetainedDraftData
  unappliedLabels: string[]
}

function buildContactLocationString(data: WizardFormData): string {
  const parts = [data.address.trim(), data.city.trim()].filter(Boolean)
  return parts.join(', ')
}

function cleanItems(items: WizardCatalogItem[]): WizardCatalogItem[] {
  return items
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      description: item.description.trim(),
      imageUrl: item.imageUrl?.trim() || undefined,
    }))
    .filter((item) => item.name.length > 0)
}

/**
 * Transforme les réponses structurées du Wizard vers le format clé/valeur
 * attendu par les templates HTML existants, sans mélanger les coordonnées
 * ni perdre les données non encore prises en charge par le template actif.
 */
export function transformWizardData(
  data: WizardFormData,
  template: ResolvedSiteTemplate
): WizardTransformationResult {
  const items = cleanItems(data.items)
  const variableKeys = new Set(template.variables.map((variable) => variable.key))
  const caps = template.capabilities
  const guidance = getWizardTemplateGuidance(template)
  const defaultTypography = getDefaultTypographyForTemplate(template)
  const defaultMood = getDefaultMoodForCategory(template.categoryId)
  const defaultSecondary = template.defaultTheme.palette.secondary

  const primaryColor = isValidHexColor(data.primaryColor)
    ? data.primaryColor.trim()
    : template.defaultTheme.palette.primary

  const heroImage =
    data.heroImageUrl.trim() && isValidUploadedImageUrl(data.heroImageUrl)
      ? data.heroImageUrl.trim()
      : ''

  const logoImage =
    data.logoUrl.trim() && isValidUploadedImageUrl(data.logoUrl)
      ? data.logoUrl.trim()
      : ''

  const mappedValues: Record<string, string> = {
    nom_entreprise: data.businessName.trim(),
    slogan: data.slogan.trim(),
    couleur_accent: primaryColor,
    hero_titre: data.heroTitle.trim(),
    hero_texte: data.heroText.trim() || data.shortDescription.trim(),
    hero_image: caps.supportsHeroImage ? heroImage : '',
    adresse: buildContactLocationString(data),
    telephone: data.phone.trim(),
    horaires: data.openingHours.trim(),
  }

  if (caps.supportsWhatsApp && variableKeys.has('whatsapp')) {
    mappedValues.whatsapp = data.whatsapp.trim()
  }
  if (caps.supportsEmail && variableKeys.has('email')) {
    mappedValues.email = data.email.trim()
  }
  if (caps.supportsLogo && variableKeys.has('logo')) {
    mappedValues.logo = logoImage
  }
  if (caps.supportsCustomCta && variableKeys.has('cta_label')) {
    mappedValues.cta_label = data.ctaLabel.trim()
  }

  const maxSlots = Math.max(0, caps.maxFeaturedItems)
  for (let index = 1; index <= maxSlots; index += 1) {
    const item = items[index - 1]
    const name = item?.name ?? ''
    const description = item?.description ?? ''
    const imageUrl =
      caps.supportsCatalogItemImages &&
      item?.imageUrl &&
      isValidUploadedImageUrl(item.imageUrl)
        ? item.imageUrl
        : ''

    mappedValues[`service_${index}`] = name
    mappedValues[`service_${index}_desc`] = description
    mappedValues[`service_${index}_description`] = description
    if (caps.supportsCatalogItemImages) {
      mappedValues[`service_${index}_image`] = imageUrl
      mappedValues[`produit_${index}_image`] = imageUrl
    }
    mappedValues[`produit_${index}`] = name
    mappedValues[`produit_${index}_desc`] = description
    mappedValues[`produit_${index}_description`] = description
  }

  // Respect strict du jeu de variables du template actif :
  // aucune nouvelle clé n'est inventée pour les templates v1.
  const templateFormData: Record<string, string> = {}
  for (const variable of template.variables) {
    if (Object.prototype.hasOwnProperty.call(mappedValues, variable.key)) {
      templateFormData[variable.key] = mappedValues[variable.key] ?? ''
    } else {
      templateFormData[variable.key] =
        template.defaultConfig[variable.key] ?? variable.default
    }
  }

  // Conservation séparée des champs collectés mais non appliqués par le template
  const retainedFields: WizardRetainedDraftData = {}
  const unappliedLabels: string[] = []

  if (data.activityType.trim()) {
    retainedFields.activityType = data.activityType.trim()
    unappliedLabels.push('Type d’activité')
  }

  if (data.shortDescription.trim() && data.heroText.trim()) {
    retainedFields.shortDescription = data.shortDescription.trim()
    unappliedLabels.push('Description courte (remplacée par le texte d’accroche)')
  }

  if (logoImage && !(caps.supportsLogo && variableKeys.has('logo'))) {
    retainedFields.logoUrl = logoImage
    unappliedLabels.push('Logo')
  }

  if (!caps.supportsSecondaryColor && isValidHexColor(data.secondaryColor)) {
    const cleanSecondary = data.secondaryColor.trim()
    retainedFields.secondaryColor = cleanSecondary
    if (cleanSecondary.toLowerCase() !== defaultSecondary.toLowerCase()) {
      unappliedLabels.push('Couleur secondaire')
    }
  }

  if (!caps.supportsCustomTypography) {
    retainedFields.typographyId = data.typographyId
    if (data.typographyId !== defaultTypography) {
      unappliedLabels.push('Typographie personnalisée')
    }
  }

  if (!caps.supportsVisualMood) {
    retainedFields.mood = data.mood
    if (data.mood !== defaultMood) {
      unappliedLabels.push('Ambiance visuelle')
    }
  }

  if (!caps.supportsCustomCta) {
    const cleanCtaLabel = data.ctaLabel.trim()
    if (cleanCtaLabel) retainedFields.ctaLabel = cleanCtaLabel
    retainedFields.ctaDestination = data.ctaDestination
    if (
      (cleanCtaLabel && cleanCtaLabel !== guidance.defaultCtaLabel) ||
      data.ctaDestination !== guidance.defaultCtaDestination
    ) {
      unappliedLabels.push('Bouton d’action personnalisé')
    }
  }

  const whatsapp = data.whatsapp.trim()
  if (whatsapp && !(caps.supportsWhatsApp && variableKeys.has('whatsapp'))) {
    retainedFields.whatsapp = whatsapp
    unappliedLabels.push('WhatsApp')
  }

  const email = data.email.trim()
  if (email && !(caps.supportsEmail && variableKeys.has('email'))) {
    retainedFields.email = email
    unappliedLabels.push('Adresse e-mail')
  }

  const nonEmptySocials: Partial<WizardSocialLinks> = {}
  for (const key of ['facebook', 'instagram', 'linkedin', 'website'] as const) {
    const val = data.socialLinks[key].trim()
    if (val) nonEmptySocials[key] = val
  }
  if (Object.keys(nonEmptySocials).length > 0 && !caps.supportsSocialLinks) {
    retainedFields.socialLinks = nonEmptySocials
    unappliedLabels.push('Liens réseaux sociaux')
  }

  if (items.length > maxSlots) {
    retainedFields.extraCatalogItems = items.slice(maxSlots)
    unappliedLabels.push(`Éléments supplémentaires (au-delà de ${maxSlots})`)
  }

  if (!caps.supportsCatalogItemImages && items.some((item) => Boolean(item.imageUrl))) {
    unappliedLabels.push('Images individuelles des offres')
  }

  return {
    templateFormData,
    retainedFields,
    unappliedLabels,
  }
}

export function transformWizardToTemplateFormData(
  data: WizardFormData,
  template: ResolvedSiteTemplate
): Record<string, string> {
  return transformWizardData(data, template).templateFormData
}

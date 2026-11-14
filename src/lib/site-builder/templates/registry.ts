import { getTemplateVariables } from '../../template-variables'
import { CATEGORY_BY_ID, getCategoryMeta } from './categories'
import { SITE_TEMPLATE_DEFINITIONS } from './definitions'
import type {
  DbSiteTemplateRecord,
  ResolvedSiteTemplate,
  SiteTemplateDefinition,
  TemplateCategoryId,
} from './types'

const DEFINITION_MAP = new Map<string, SiteTemplateDefinition>(
  SITE_TEMPLATE_DEFINITIONS.map((template) => [template.id, template])
)

const LEGACY_CATEGORY_MAP: Record<string, TemplateCategoryId> = {
  restaurant: 'restaurants-alimentation',
  boutique: 'boutiques-commerce',
  services: 'services-professionnels',
}

function resolveCategoryId(
  definition: SiteTemplateDefinition | undefined,
  dbCategory: string
): TemplateCategoryId {
  if (definition) return definition.categoryId
  const normalized = dbCategory.trim().toLowerCase()
  if (normalized in CATEGORY_BY_ID) {
    return normalized as TemplateCategoryId
  }
  return LEGACY_CATEGORY_MAP[normalized] ?? 'services-professionnels'
}

export function getTemplateDefinition(id: string): SiteTemplateDefinition | undefined {
  return DEFINITION_MAP.get(id)
}

export function listTemplateDefinitions(): readonly SiteTemplateDefinition[] {
  return SITE_TEMPLATE_DEFINITIONS
}

export function resolveSiteTemplate(
  dbTemplate: DbSiteTemplateRecord,
  previewHtml: string
): ResolvedSiteTemplate {
  const definition = DEFINITION_MAP.get(dbTemplate.id)
  const categoryId = resolveCategoryId(definition, dbTemplate.category)
  const category = getCategoryMeta(categoryId)

  let variables = definition?.variables ?? []
  try {
    const parsed = getTemplateVariables(dbTemplate.variables)
    if (parsed.length > 0) {
      variables = parsed
    }
  } catch {
    // Fallback to code registry variables if DB metadata is malformed or legacy
  }

  const defaultConfig =
    definition?.defaultConfig ??
    Object.fromEntries(variables.map((variable) => [variable.key, variable.default]))

  return {
    id: dbTemplate.id,
    name: definition?.name ?? dbTemplate.name,
    shortDescription:
      definition?.shortDescription ??
      'Modèle vitrine personnalisable avec aperçu immédiat.',
    categoryId,
    categoryLabel: category.label,
    previewSummary:
      definition?.previewSummary ??
      'Structure vitrine complète prête à personnaliser.',
    supportedSections: definition?.supportedSections ?? [
      'header',
      'hero',
      'services',
      'contact',
      'footer',
    ],
    defaultSections: definition?.defaultSections ?? [
      'header',
      'hero',
      'services',
      'contact',
      'footer',
    ],
    defaultTheme: definition?.defaultTheme ?? {
      styleName: 'Classique',
      palette: {
        primary: '#10b981',
        secondary: '#0f172a',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        mutedText: '#475569',
      },
      typography: {
        headingFont: 'Arial, sans-serif',
        bodyFont: 'Arial, sans-serif',
        styleLabel: 'Sans-serif sobre',
      },
    },
    capabilities: definition?.capabilities ?? {
      supportsHeroImage: true,
      supportsLogo: false,
      supportsSecondaryColor: false,
      supportsCustomTypography: false,
      supportsVisualMood: false,
      supportsCustomCta: false,
      supportsCatalogItems: true,
      supportsCatalogItemImages: false,
      supportsGallery: false,
      supportsTestimonials: false,
      supportsWhatsApp: false,
      supportsEmail: false,
      supportsSocialLinks: false,
      supportsOpeningHours: true,
      maxFeaturedItems: 3,
    },
    variables,
    defaultConfig,
    active: dbTemplate.active,
    previewHtml,
  }
}

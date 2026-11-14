import type { TemplateVariableMeta } from '../../template-variables'

export type TemplateCategoryId =
  | 'restaurants-alimentation'
  | 'boutiques-commerce'
  | 'services-professionnels'
  | 'beaute-bien-etre'
  | 'technologie-numerique'
  | 'education-formation'
  | 'evenementiel'
  | 'immobilier-construction'
  | 'portfolio-creation'

export type TemplateCategoryMeta = {
  id: TemplateCategoryId
  label: string
  shortLabel: string
  description: string
}

export type TemplateSectionType =
  | 'header'
  | 'hero'
  | 'about'
  | 'services'
  | 'products'
  | 'gallery'
  | 'testimonials'
  | 'contact'
  | 'location'
  | 'footer'

export type TemplatePalette = {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  mutedText: string
}

export type TemplateTypography = {
  headingFont: string
  bodyFont: string
  styleLabel: string
}

export type TemplateCapabilities = {
  supportsHeroImage: boolean
  supportsLogo: boolean
  supportsSecondaryColor: boolean
  supportsCustomTypography: boolean
  supportsVisualMood: boolean
  supportsCustomCta: boolean
  supportsCatalogItems: boolean
  supportsCatalogItemImages: boolean
  supportsGallery: boolean
  supportsTestimonials: boolean
  supportsWhatsApp: boolean
  supportsEmail: boolean
  supportsSocialLinks: boolean
  supportsOpeningHours: boolean
  maxFeaturedItems: number
}

export type SiteTemplateDefinition = {
  id: string
  name: string
  shortDescription: string
  categoryId: TemplateCategoryId
  legacyDbCategory: string
  templateFile: string
  previewSummary: string
  supportedSections: TemplateSectionType[]
  defaultSections: TemplateSectionType[]
  defaultTheme: {
    styleName: string
    palette: TemplatePalette
    typography: TemplateTypography
  }
  capabilities: TemplateCapabilities
  variables: TemplateVariableMeta[]
  defaultConfig: Record<string, string>
}

export type DbSiteTemplateRecord = {
  id: string
  name: string
  category: string
  active: boolean
  variables: unknown
}

export type ResolvedSiteTemplate = {
  id: string
  name: string
  shortDescription: string
  categoryId: TemplateCategoryId
  categoryLabel: string
  previewSummary: string
  supportedSections: TemplateSectionType[]
  defaultSections: TemplateSectionType[]
  defaultTheme: SiteTemplateDefinition['defaultTheme']
  capabilities: TemplateCapabilities
  variables: TemplateVariableMeta[]
  defaultConfig: Record<string, string>
  active: boolean
  previewHtml: string
}

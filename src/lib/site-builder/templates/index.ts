export {
  CATEGORY_BY_ID,
  TEMPLATE_CATEGORIES,
  getCategoryMeta,
} from './categories'
export {
  SITE_TEMPLATE_DEFINITIONS,
  TEMPLATE_SECTION_LABELS,
} from './definitions'
export {
  getTemplateDefinition,
  listTemplateDefinitions,
  resolveSiteTemplate,
} from './registry'
export type {
  DbSiteTemplateRecord,
  ResolvedSiteTemplate,
  SiteTemplateDefinition,
  TemplateCapabilities,
  TemplateCategoryId,
  TemplateCategoryMeta,
  TemplatePalette,
  TemplateSectionType,
  TemplateTypography,
} from './types'

export const RESERVED_SITE_SLUGS = new Set([
  'about',
  'admin',
  'api',
  'contact',
  'cgv',
  'dashboard',
  'favicon-ico',
  'login',
  'logout',
  'new',
  'poster',
  'paiement',
  'pricing',
  'register',
  'reinitialiser-mot-de-passe',
  'mot-de-passe-oublie',
  'mentions-legales',
  'robots-txt',
  'settings',
  'site',
  'sites',
  'sitemap-xml',
  'templates',
  'tarifs',
  'uploads',
])

export function createSiteSlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

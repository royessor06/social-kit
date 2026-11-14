import type { TemplateVariableMeta } from '../../template-variables'
import type { SiteTemplateDefinition, TemplateSectionType } from './types'

export const TEMPLATE_SECTION_LABELS: Record<TemplateSectionType, string> = {
  header: 'En-tête',
  hero: 'Bannière principale',
  about: 'À propos',
  services: 'Services / Carte',
  products: 'Produits',
  gallery: 'Galerie',
  testimonials: 'Témoignages',
  contact: 'Contact',
  location: 'Localisation & horaires',
  footer: 'Pied de page',
}

function buildDefaultConfig(variables: TemplateVariableMeta[]): Record<string, string> {
  return Object.fromEntries(
    variables.map((variable) => [variable.key, variable.default])
  )
}

const restaurantVariables: TemplateVariableMeta[] = [
  { key: 'nom_entreprise', label: 'Nom du restaurant', type: 'text', default: 'Chez Marie' },
  { key: 'slogan', label: 'Signature', type: 'text', default: 'Les saveurs du pays, faites maison' },
  { key: 'couleur_accent', label: 'Couleur principale', type: 'color', default: '#a34d32' },
  { key: 'hero_titre', label: 'Titre principal', type: 'text', default: 'Le goût des bons moments.' },
  {
    key: 'hero_texte',
    label: 'Présentation',
    type: 'textarea',
    default: 'Une cuisine généreuse, des produits frais et un accueil comme à la maison.',
  },
  { key: 'hero_image', label: 'Photo principale', type: 'image', default: '' },
  { key: 'service_1', label: 'Plat ou spécialité 1', type: 'text', default: 'Poulet braisé' },
  {
    key: 'service_1_desc',
    label: 'Description 1',
    type: 'textarea',
    default: 'Mariné aux épices maison et servi avec ses accompagnements.',
  },
  { key: 'service_2', label: 'Plat ou spécialité 2', type: 'text', default: 'Poisson du jour' },
  {
    key: 'service_2_desc',
    label: 'Description 2',
    type: 'textarea',
    default: 'La pêche du marché, cuisinée avec fraîcheur.',
  },
  { key: 'service_3', label: 'Plat ou spécialité 3', type: 'text', default: 'Jus frais maison' },
  {
    key: 'service_3_desc',
    label: 'Description 3',
    type: 'textarea',
    default: 'Des fruits de saison pressés à la commande.',
  },
  { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
  { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
  { key: 'horaires', label: 'Horaires', type: 'textarea', default: 'Lun - Sam · 11h00 - 22h00' },
]

const boutiqueVariables: TemplateVariableMeta[] = [
  { key: 'nom_entreprise', label: 'Nom de la boutique', type: 'text', default: 'Maison Marie' },
  { key: 'slogan', label: 'Signature', type: 'text', default: 'Des pièces choisies avec soin' },
  { key: 'couleur_accent', label: 'Couleur principale', type: 'color', default: '#59634b' },
  { key: 'hero_titre', label: 'Titre principal', type: 'text', default: 'Le beau au quotidien.' },
  {
    key: 'hero_texte',
    label: 'Présentation',
    type: 'textarea',
    default: 'Découvrez une sélection de produits authentiques, pensés pour durer et vous ressembler.',
  },
  { key: 'hero_image', label: 'Photo principale', type: 'image', default: '' },
  { key: 'service_1', label: 'Produit 1', type: 'text', default: 'Sac en cuir naturel' },
  {
    key: 'service_1_desc',
    label: 'Description du produit 1',
    type: 'textarea',
    default: 'Une pièce élégante confectionnée avec soin.',
  },
  { key: 'service_2', label: 'Produit 2', type: 'text', default: 'Accessoires du quotidien' },
  {
    key: 'service_2_desc',
    label: 'Description du produit 2',
    type: 'textarea',
    default: 'Des essentiels qui allient style et fonctionnalité.',
  },
  { key: 'service_3', label: 'Produit 3', type: 'text', default: 'Collection maison' },
  {
    key: 'service_3_desc',
    label: 'Description du produit 3',
    type: 'textarea',
    default: 'Une collection chaleureuse pour votre intérieur.',
  },
  { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
  { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
  { key: 'horaires', label: 'Horaires', type: 'textarea', default: 'Lun - Sam · 9h00 - 19h00' },
]

const serviceVariables: TemplateVariableMeta[] = [
  { key: 'nom_entreprise', label: 'Nom de l’entreprise', type: 'text', default: 'Studio Conseil' },
  {
    key: 'slogan',
    label: 'Signature',
    type: 'text',
    default: 'Des idées claires. Des résultats concrets.',
  },
  { key: 'couleur_accent', label: 'Couleur principale', type: 'color', default: '#315f72' },
  { key: 'hero_titre', label: 'Titre principal', type: 'text', default: 'Faisons grandir vos projets.' },
  {
    key: 'hero_texte',
    label: 'Présentation',
    type: 'textarea',
    default:
      'Nous accompagnons les entreprises avec des solutions adaptées, un conseil humain et une expertise de terrain.',
  },
  { key: 'hero_image', label: 'Photo principale', type: 'image', default: '' },
  { key: 'service_1', label: 'Service 1', type: 'text', default: 'Conseil stratégique' },
  {
    key: 'service_1_desc',
    label: 'Description 1',
    type: 'textarea',
    default: 'Une vision structurée pour transformer vos ambitions en actions.',
  },
  { key: 'service_2', label: 'Service 2', type: 'text', default: 'Accompagnement' },
  {
    key: 'service_2_desc',
    label: 'Description 2',
    type: 'textarea',
    default: 'Un partenaire présent à chaque étape de votre développement.',
  },
  { key: 'service_3', label: 'Service 3', type: 'text', default: 'Formation' },
  {
    key: 'service_3_desc',
    label: 'Description 3',
    type: 'textarea',
    default: 'Des compétences concrètes pour renforcer vos équipes.',
  },
  { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
  { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
  { key: 'horaires', label: 'Disponibilité', type: 'textarea', default: 'Lun - Ven · 8h00 - 18h00' },
]

export const SITE_TEMPLATE_DEFINITIONS: readonly SiteTemplateDefinition[] = [
  {
    id: 'restaurant',
    name: 'Table & Terroir',
    shortDescription:
      'Un site chaleureux et éditorial pour mettre en valeur votre carte, vos spécialités et vos horaires.',
    categoryId: 'restaurants-alimentation',
    legacyDbCategory: 'Restaurant',
    templateFile: 'restaurant.html',
    previewSummary:
      'En-tête clair, bannière avec photo de plat, grille de 3 spécialités et bloc réservation/contact.',
    supportedSections: ['header', 'hero', 'services', 'contact', 'location', 'footer'],
    defaultSections: ['header', 'hero', 'services', 'contact', 'footer'],
    defaultTheme: {
      styleName: 'Éditorial chaleureux',
      palette: {
        primary: '#a34d32',
        secondary: '#29251f',
        background: '#fbf8f2',
        surface: '#fffdfa',
        text: '#29251f',
        mutedText: '#71695f',
      },
      typography: {
        headingFont: 'Georgia, serif',
        bodyFont: 'Arial, sans-serif',
        styleLabel: 'Serif classique & sans lisible',
      },
    },
    capabilities: {
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
    variables: restaurantVariables,
    defaultConfig: buildDefaultConfig(restaurantVariables),
  },
  {
    id: 'boutique',
    name: 'Maison & Sélection',
    shortDescription:
      'Une vitrine épurée pour présenter vos produits phares, votre univers de marque et votre point de vente.',
    categoryId: 'boutiques-commerce',
    legacyDbCategory: 'Boutique',
    templateFile: 'boutique.html',
    previewSummary:
      'Mise en page sobre sur fond crème, section sélection produits et coordonnées de boutique.',
    supportedSections: ['header', 'hero', 'products', 'contact', 'location', 'footer'],
    defaultSections: ['header', 'hero', 'products', 'contact', 'footer'],
    defaultTheme: {
      styleName: 'Boutique naturelle',
      palette: {
        primary: '#59634b',
        secondary: '#262820',
        background: '#f7f6f0',
        surface: '#ffffff',
        text: '#262820',
        mutedText: '#6b6d64',
      },
      typography: {
        headingFont: 'Georgia, serif',
        bodyFont: 'Arial, sans-serif',
        styleLabel: 'Titres éditoriaux & corps épuré',
      },
    },
    capabilities: {
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
    variables: boutiqueVariables,
    defaultConfig: buildDefaultConfig(boutiqueVariables),
  },
  {
    id: 'service',
    name: 'Studio Conseil',
    shortDescription:
      'Une structure nette et rassurante pour présenter vos expertises, votre approche et faciliter la prise de contact.',
    categoryId: 'services-professionnels',
    legacyDbCategory: 'Services',
    templateFile: 'service.html',
    previewSummary:
      'En-tête institutionnel, accroche directe, 3 cartes d’expertise soulignées et appel à l’action téléphone.',
    supportedSections: ['header', 'hero', 'services', 'contact', 'location', 'footer'],
    defaultSections: ['header', 'hero', 'services', 'contact', 'footer'],
    defaultTheme: {
      styleName: 'Studio structuré',
      palette: {
        primary: '#315f72',
        secondary: '#202b30',
        background: '#ffffff',
        surface: '#f5f8f8',
        text: '#202b30',
        mutedText: '#65747a',
      },
      typography: {
        headingFont: 'Arial, sans-serif',
        bodyFont: 'Arial, sans-serif',
        styleLabel: 'Sans-serif géométrique et sobre',
      },
    },
    capabilities: {
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
    variables: serviceVariables,
    defaultConfig: buildDefaultConfig(serviceVariables),
  },
] as const

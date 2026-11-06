import { Prisma, PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type SiteVariable = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'image'
  default: string
}

type SiteTemplateDefinition = {
  id: string
  name: string
  category: string
  file: string
  variables: SiteVariable[]
}

const SITE_TEMPLATES: SiteTemplateDefinition[] = [
  {
    id: 'restaurant',
    name: 'Table & Terroir',
    category: 'Restaurant',
    file: 'restaurant.html',
    variables: [
      { key: 'nom_entreprise', label: 'Nom du restaurant', type: 'text', default: 'Chez Marie' },
      { key: 'slogan', label: 'Signature', type: 'text', default: 'Les saveurs du pays, faites maison' },
      { key: 'couleur_accent', label: 'Couleur principale', type: 'color', default: '#a34d32' },
      { key: 'hero_titre', label: 'Titre principal', type: 'text', default: 'Le goût des bons moments.' },
      { key: 'hero_texte', label: 'Présentation', type: 'textarea', default: 'Une cuisine généreuse, des produits frais et un accueil comme à la maison.' },
      { key: 'hero_image', label: 'Photo principale', type: 'image', default: '' },
      { key: 'service_1', label: 'Plat ou spécialité 1', type: 'text', default: 'Poulet braisé' },
      { key: 'service_1_desc', label: 'Description 1', type: 'textarea', default: 'Mariné aux épices maison et servi avec ses accompagnements.' },
      { key: 'service_2', label: 'Plat ou spécialité 2', type: 'text', default: 'Poisson du jour' },
      { key: 'service_2_desc', label: 'Description 2', type: 'textarea', default: 'La pêche du marché, cuisinée avec fraîcheur.' },
      { key: 'service_3', label: 'Plat ou spécialité 3', type: 'text', default: 'Jus frais maison' },
      { key: 'service_3_desc', label: 'Description 3', type: 'textarea', default: 'Des fruits de saison pressés à la commande.' },
      { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
      { key: 'horaires', label: 'Horaires', type: 'textarea', default: 'Lun - Sam · 11h00 - 22h00' },
    ],
  },
  {
    id: 'boutique',
    name: 'Maison & Sélection',
    category: 'Boutique',
    file: 'boutique.html',
    variables: [
      { key: 'nom_entreprise', label: 'Nom de la boutique', type: 'text', default: 'Maison Marie' },
      { key: 'slogan', label: 'Signature', type: 'text', default: 'Des pièces choisies avec soin' },
      { key: 'couleur_accent', label: 'Couleur principale', type: 'color', default: '#59634b' },
      { key: 'hero_titre', label: 'Titre principal', type: 'text', default: 'Le beau au quotidien.' },
      { key: 'hero_texte', label: 'Présentation', type: 'textarea', default: 'Découvrez une sélection de produits authentiques, pensés pour durer et vous ressembler.' },
      { key: 'hero_image', label: 'Photo principale', type: 'image', default: '' },
      { key: 'service_1', label: 'Produit 1', type: 'text', default: 'Sac en cuir naturel' },
      { key: 'service_1_desc', label: 'Description du produit 1', type: 'textarea', default: 'Une pièce élégante confectionnée avec soin.' },
      { key: 'service_2', label: 'Produit 2', type: 'text', default: 'Accessoires du quotidien' },
      { key: 'service_2_desc', label: 'Description du produit 2', type: 'textarea', default: 'Des essentiels qui allient style et fonctionnalité.' },
      { key: 'service_3', label: 'Produit 3', type: 'text', default: 'Collection maison' },
      { key: 'service_3_desc', label: 'Description du produit 3', type: 'textarea', default: 'Une collection chaleureuse pour votre intérieur.' },
      { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
      { key: 'horaires', label: 'Horaires', type: 'textarea', default: 'Lun - Sam · 9h00 - 19h00' },
    ],
  },
  {
    id: 'service',
    name: 'Studio Conseil',
    category: 'Services',
    file: 'service.html',
    variables: [
      { key: 'nom_entreprise', label: 'Nom de l’entreprise', type: 'text', default: 'Studio Conseil' },
      { key: 'slogan', label: 'Signature', type: 'text', default: 'Des idées claires. Des résultats concrets.' },
      { key: 'couleur_accent', label: 'Couleur principale', type: 'color', default: '#315f72' },
      { key: 'hero_titre', label: 'Titre principal', type: 'text', default: 'Faisons grandir vos projets.' },
      { key: 'hero_texte', label: 'Présentation', type: 'textarea', default: 'Nous accompagnons les entreprises avec des solutions adaptées, un conseil humain et une expertise de terrain.' },
      { key: 'hero_image', label: 'Photo principale', type: 'image', default: '' },
      { key: 'service_1', label: 'Service 1', type: 'text', default: 'Conseil stratégique' },
      { key: 'service_1_desc', label: 'Description 1', type: 'textarea', default: 'Une vision structurée pour transformer vos ambitions en actions.' },
      { key: 'service_2', label: 'Service 2', type: 'text', default: 'Accompagnement' },
      { key: 'service_2_desc', label: 'Description 2', type: 'textarea', default: 'Un partenaire présent à chaque étape de votre développement.' },
      { key: 'service_3', label: 'Service 3', type: 'text', default: 'Formation' },
      { key: 'service_3_desc', label: 'Description 3', type: 'textarea', default: 'Des compétences concrètes pour renforcer vos équipes.' },
      { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
      { key: 'horaires', label: 'Disponibilité', type: 'textarea', default: 'Lun - Ven · 8h00 - 18h00' },
    ],
  },
]

export async function seedSiteTemplates(prisma: PrismaClient) {
  for (const template of SITE_TEMPLATES) {
    const htmlContent = readFileSync(
      join(process.cwd(), 'src', 'templates', 'sites', template.file),
      'utf8'
    )

    await prisma.siteTemplate.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        category: template.category,
        htmlContent,
        variables: template.variables as Prisma.InputJsonArray,
        active: true,
      },
      create: {
        id: template.id,
        name: template.name,
        category: template.category,
        htmlContent,
        variables: template.variables as Prisma.InputJsonArray,
        active: true,
      },
    })
  }
}

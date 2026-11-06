import { Prisma, PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { seedSiteTemplates } from './site-templates'

const prisma = new PrismaClient()

// Type pour les métadonnées d'une variable
type VariableMeta = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'image'
  default: string
}

type TemplateDef = {
  id: string
  name: string
  category: string
  file: string
  variables: VariableMeta[]
}

const TEMPLATES: TemplateDef[] = [
  {
    id: 'promo-simple',
    name: 'Promo Simple',
    category: 'Promotions',
    file: 'promo-simple.html',
    variables: [
      { key: 'badge', label: 'Badge', type: 'text', default: 'PROMO' },
      { key: 'nom_entreprise', label: 'Nom de l\'entreprise', type: 'text', default: 'Mon Commerce' },
      { key: 'slogan', label: 'Slogan', type: 'text', default: 'Qualité et service' },
      { key: 'promo_label', label: 'Étiquette promo', type: 'text', default: 'Offre spéciale' },
      { key: 'promo_texte', label: 'Texte promo', type: 'text', default: '-20%' },
      { key: 'promo_detail', label: 'Détail promo', type: 'textarea', default: 'Sur tous les articles' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'text', default: '+229 97 00 00 00' },
      { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
    ],
  },
  {
    id: 'service-pro',
    name: 'Services Pro',
    category: 'Services',
    file: 'service-pro.html',
    variables: [
      { key: 'initiales', label: 'Initiales (logo)', type: 'text', default: 'SP' },
      { key: 'nom_entreprise', label: 'Nom de l\'entreprise', type: 'text', default: 'Services Pro' },
      { key: 'slogan', label: 'Slogan', type: 'text', default: 'Votre partenaire de confiance' },
      { key: 'titre_section', label: 'Titre de la section', type: 'text', default: 'Nos services' },
      { key: 'service_1', label: 'Service 1', type: 'text', default: 'Conseil' },
      { key: 'service_2', label: 'Service 2', type: 'text', default: 'Installation' },
      { key: 'service_3', label: 'Service 3', type: 'text', default: 'Maintenance' },
      { key: 'service_4', label: 'Service 4', type: 'text', default: 'Formation' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
      { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
    ],
  },
  {
    id: 'evenement',
    name: 'Événement',
    category: 'Événements',
    file: 'evenement.html',
    variables: [
      { key: 'type_evenement', label: 'Type d\'événement', type: 'text', default: 'Concert' },
      { key: 'titre_evenement', label: 'Titre', type: 'text', default: 'Grand Live' },
      { key: 'description', label: 'Description', type: 'textarea', default: 'Une soirée inoubliable' },
      { key: 'jour', label: 'Jour', type: 'text', default: '15' },
      { key: 'mois', label: 'Mois', type: 'text', default: 'Décembre' },
      { key: 'heure', label: 'Heure', type: 'text', default: '20h00' },
      { key: 'lieu', label: 'Lieu', type: 'text', default: 'Cotonou' },
      { key: 'organisateur', label: 'Organisateur', type: 'text', default: 'SOCIAL KIT' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
    ],
  },
    {
    id: 'produit',
    name: 'Produit Vedette',
    category: 'Produits',
    file: 'produit.html',
    variables: [
      { key: 'couleur_accent', label: 'Couleur d\'accent', type: 'color', default: '#10b981' },
      { key: 'logo', label: 'Logo', type: 'image', default: '' },
      { key: 'nom_entreprise', label: 'Nom de l\'entreprise', type: 'text', default: 'Ma Boutique' },
      { key: 'badge', label: 'Badge', type: 'text', default: 'NOUVEAU' },
      { key: 'nom_produit', label: 'Nom du produit', type: 'text', default: 'Sac en cuir' },
      { key: 'description', label: 'Description', type: 'textarea', default: 'Élégant et durable' },
      { key: 'prix', label: 'Prix', type: 'text', default: '15 000' },
      { key: 'devise', label: 'Devise', type: 'text', default: 'FCFA' },
      { key: 'ancien_prix', label: 'Ancien prix', type: 'text', default: '20 000' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
      { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
    ],
  },
  {
    id: 'annonce',
    name: 'Annonce Commerciale',
    category: 'Annonces',
    file: 'annonce.html',
    variables: [
      { key: 'kicker', label: 'Kicker', type: 'text', default: 'GRANDE OUVERTURE' },
      { key: 'titre', label: 'Titre', type: 'text', default: 'C\'est ouvert !' },
      { key: 'message', label: 'Message', type: 'textarea', default: 'Venez nombreux découvrir notre nouveau magasin' },
      { key: 'date_ouverture', label: 'Date d\'ouverture', type: 'text', default: '1er Janvier' },
      { key: 'adresse', label: 'Adresse', type: 'text', default: 'Cotonou, Bénin' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'text', default: '+229 97 00 00 00' },
      { key: 'nom_entreprise', label: 'Nom de l\'entreprise', type: 'text', default: 'Ma Boutique' },
      { key: 'slogan', label: 'Slogan', type: 'text', default: 'Qualité et service' },
    ],
  },
  {
    id: 'immobilier',
    name: 'Bien Immobilier',
    category: 'Immobilier',
    file: 'immobilier.html',
    variables: [
      { key: 'type_bien', label: 'Type de bien', type: 'text', default: 'À VENDRE' },
      { key: 'titre', label: 'Titre de l’annonce', type: 'text', default: 'Villa contemporaine' },
      { key: 'description', label: 'Description', type: 'textarea', default: 'Un espace lumineux et confortable, idéal pour votre famille.' },
      { key: 'prix', label: 'Prix', type: 'text', default: '85 000 000' },
      { key: 'devise', label: 'Devise', type: 'text', default: 'FCFA' },
      { key: 'localisation', label: 'Localisation', type: 'text', default: 'Cotonou, Bénin' },
      { key: 'surface', label: 'Surface', type: 'text', default: '180 m²' },
      { key: 'details', label: 'Détails du bien', type: 'text', default: '4 chambres · 3 salles de bain' },
      { key: 'nom_agence', label: 'Agence ou propriétaire', type: 'text', default: 'Votre agence immobilière' },
      { key: 'telephone', label: 'Téléphone', type: 'text', default: '+229 97 00 00 00' },
    ],
  },
]

async function main() {
  for (const t of TEMPLATES) {
    const htmlContent = readFileSync(
      join(process.cwd(), 'src/templates/posters', t.file),
      'utf-8'
    )

    await prisma.posterTemplate.upsert({
      where: { id: t.id },
      update: {
        htmlContent,
        name: t.name,
        category: t.category,
        variables: t.variables as Prisma.InputJsonArray,
      },
      create: {
        id: t.id,
        name: t.name,
        category: t.category,
        htmlContent,
        variables: t.variables as Prisma.InputJsonArray,
        active: true,
      },
    })
    console.log(`Template ${t.id} seedé.`)
  }

  await seedSiteTemplates(prisma)

  await prisma.clientSite.upsert({
    where: { slug: 'marieshop' },
    update: {
      businessName: 'Chez Marie',
      templateId: 'restaurant',
      data: {
        nom_entreprise: 'Chez Marie',
        slogan: 'Les saveurs du pays, faites maison',
        couleur_accent: '#a34d32',
        hero_titre: 'Le goût des bons moments.',
        hero_texte: 'Une cuisine généreuse, des produits frais et un accueil comme à la maison.',
        hero_image: '',
        service_1: 'Poulet braisé',
        service_1_desc: 'Mariné aux épices maison et servi avec ses accompagnements.',
        service_2: 'Poisson du jour',
        service_2_desc: 'La pêche du marché, cuisinée avec fraîcheur.',
        service_3: 'Jus frais maison',
        service_3_desc: 'Des fruits de saison pressés à la commande.',
        adresse: 'Cotonou, Bénin',
        telephone: '+229 97 00 00 00',
        horaires: 'Lun - Sam · 11h00 - 22h00',
      },
      published: true,
    },
    create: {
      slug: 'marieshop',
      businessName: 'Chez Marie',
      templateId: 'restaurant',
      data: {
        nom_entreprise: 'Chez Marie',
        slogan: 'Les saveurs du pays, faites maison',
        couleur_accent: '#a34d32',
        hero_titre: 'Le goût des bons moments.',
        hero_texte: 'Une cuisine généreuse, des produits frais et un accueil comme à la maison.',
        hero_image: '',
        service_1: 'Poulet braisé',
        service_1_desc: 'Mariné aux épices maison et servi avec ses accompagnements.',
        service_2: 'Poisson du jour',
        service_2_desc: 'La pêche du marché, cuisinée avec fraîcheur.',
        service_3: 'Jus frais maison',
        service_3_desc: 'Des fruits de saison pressés à la commande.',
        adresse: 'Cotonou, Bénin',
        telephone: '+229 97 00 00 00',
        horaires: 'Lun - Sam · 11h00 - 22h00',
      },
      published: true,
    },
  })
  console.log('Site marieshop seedé.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resolveSiteTemplate } from '@/lib/site-builder/templates'
import {
  transformWizardData,
  validateAllWizardSteps,
  type WizardCatalogItem,
  type WizardCtaDestination,
  type WizardFormData,
  type WizardTypographyPresetId,
  type WizardVisualMoodId,
} from '@/lib/site-builder/wizard'
import { InvalidPosterDataError, renderPosterHtml } from '@/lib/template'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, maxLength = 1000): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : ''
}

function parseTypography(value: unknown): WizardTypographyPresetId {
  switch (value) {
    case 'editorial-serif':
    case 'moderne-sans':
    case 'classique-equilibre':
    case 'institutionnel-net':
      return value
    default:
      return 'editorial-serif'
  }
}

function parseMood(value: unknown): WizardVisualMoodId {
  switch (value) {
    case 'elegant':
    case 'moderne':
    case 'minimaliste':
    case 'dynamique':
    case 'naturel':
    case 'premium':
      return value
    default:
      return 'elegant'
  }
}

function parseCtaDestination(value: unknown): WizardCtaDestination {
  switch (value) {
    case 'contact':
    case 'catalogue':
    case 'whatsapp':
    case 'telephone':
      return value
    default:
      return 'contact'
  }
}

function parseItems(value: unknown): WizardCatalogItem[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 12).map((raw, index) => {
    const record = isRecord(raw) ? raw : {}
    const imageUrl = asString(record.imageUrl, 500)
    return {
      id: asString(record.id, 64) || `item-${index + 1}`,
      name: asString(record.name, 150),
      description: asString(record.description, 500),
      ...(imageUrl ? { imageUrl } : {}),
    }
  })
}

function parseWizardFormData(raw: Record<string, unknown>): WizardFormData {
  const social = isRecord(raw.socialLinks) ? raw.socialLinks : {}

  return {
    businessName: asString(raw.businessName, 120),
    sector: asString(raw.sector, 100),
    activityType: asString(raw.activityType, 120),
    slogan: asString(raw.slogan, 200),
    shortDescription: asString(raw.shortDescription, 600),
    logoUrl: asString(raw.logoUrl, 500),
    primaryColor: asString(raw.primaryColor, 20),
    secondaryColor: asString(raw.secondaryColor, 20),
    typographyId: parseTypography(raw.typographyId),
    mood: parseMood(raw.mood),
    heroTitle: asString(raw.heroTitle, 200),
    heroText: asString(raw.heroText, 1000),
    heroImageUrl: asString(raw.heroImageUrl, 500),
    ctaLabel: asString(raw.ctaLabel, 80),
    ctaDestination: parseCtaDestination(raw.ctaDestination),
    items: parseItems(raw.items),
    phone: asString(raw.phone, 40),
    whatsapp: asString(raw.whatsapp, 40),
    address: asString(raw.address, 240),
    city: asString(raw.city, 120),
    openingHours: asString(raw.openingHours, 400),
    email: asString(raw.email, 200),
    socialLinks: {
      facebook: asString(social.facebook, 300),
      instagram: asString(social.instagram, 300),
      linkedin: asString(social.linkedin, 300),
      website: asString(social.website, 300),
    },
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide.' }, { status: 400 })
  }

  if (
    !isRecord(body) ||
    typeof body.templateId !== 'string' ||
    !body.templateId.trim() ||
    !isRecord(body.wizardData)
  ) {
    return Response.json(
      { error: 'Modèle et données de l’assistant requis.' },
      { status: 400 }
    )
  }

  let template: Awaited<ReturnType<typeof prisma.siteTemplate.findUnique>>
  try {
    template = await prisma.siteTemplate.findUnique({
      where: { id: body.templateId.trim(), active: true },
    })
  } catch {
    return Response.json(
      {
        error:
          'La base de données est momentanément indisponible pour préparer le site.',
      },
      { status: 503 }
    )
  }

  if (!template) {
    return Response.json(
      { error: 'Le modèle sélectionné est introuvable ou inactif.' },
      { status: 404 }
    )
  }

  const resolvedTemplate = resolveSiteTemplate(template, '')
  const wizardData = parseWizardFormData(body.wizardData)
  const validation = validateAllWizardSteps(wizardData, resolvedTemplate)

  if (!validation.valid) {
    const firstError =
      Object.values(validation.errors)[0] ??
      'Certains champs doivent être corrigés avant la génération.'
    return Response.json(
      {
        error: firstError,
        errors: validation.errors,
        stepErrors: validation.stepErrors,
      },
      { status: 400 }
    )
  }

  const {
    templateFormData: formData,
    retainedFields,
    unappliedLabels,
  } = transformWizardData(wizardData, resolvedTemplate)

  let previewHtml: string
  try {
    previewHtml = await renderPosterHtml(
      template.htmlContent,
      formData,
      template.variables
    )
  } catch (error) {
    if (error instanceof InvalidPosterDataError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  let isAuthenticated = false
  try {
    const session = await auth()
    isAuthenticated = Boolean(session?.user?.id)
  } catch {
    isAuthenticated = false
  }

  return Response.json(
    {
      templateId: template.id,
      formData,
      retainedFields,
      unappliedLabels,
      previewHtml,
      isAuthenticated,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

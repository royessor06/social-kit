import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getPlan, getUserPlan } from '@/lib/plans'
import { createSiteSlug, RESERVED_SITE_SLUGS } from '@/lib/site'
import {
  getTemplateVariables,
  InvalidPosterDataError,
  renderPosterHtml,
} from '@/lib/template'

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  )
}

function isPublishRequest(
  value: unknown
): value is { templateId: string; formData: Record<string, string> } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  const request = value as Record<string, unknown>
  return typeof request.templateId === 'string' && isStringRecord(request.formData)
}

class SiteQuotaExceededError extends Error {}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  if (!isPublishRequest(body)) {
    return Response.json({ error: 'templateId et données du site requis' }, { status: 400 })
  }

  const template = await prisma.siteTemplate.findUnique({
    where: { id: body.templateId, active: true },
  })
  if (!template) {
    return Response.json({ error: 'Modèle de site introuvable' }, { status: 404 })
  }

  const variables = getTemplateVariables(template.variables)
  const formData = Object.fromEntries(
    variables.map(({ key, default: defaultValue }) => [
      key,
      body.formData[key] ?? defaultValue,
    ])
  )
  const businessName = formData.nom_entreprise?.trim()

  if (!businessName || businessName.length > 80) {
    return Response.json(
      { error: 'Le nom de l’entreprise est requis (80 caractères maximum)' },
      { status: 400 }
    )
  }

  formData.nom_entreprise = businessName
  try {
    await renderPosterHtml(template.htmlContent, formData, template.variables)
  } catch (error) {
    if (error instanceof InvalidPosterDataError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  const baseSlug = createSiteSlug(businessName)
  if (!baseSlug) {
    return Response.json({ error: 'Le nom ne permet pas de créer une adresse web' }, { status: 400 })
  }
  if (RESERVED_SITE_SLUGS.has(baseSlug)) {
    return Response.json({ error: 'Ce nom est réservé, choisissez un autre nom' }, { status: 409 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Connectez-vous pour publier un site.' }, { status: 401 })
  }
  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suspended: true },
  })
  if (!owner || owner.suspended) {
    return Response.json({ error: 'Compte indisponible' }, { status: 403 })
  }

  const { plan: ownerPlan } = await getUserPlan(session.user.id)
  const limit = getPlan(ownerPlan).maxSites
  const existingSites = await prisma.clientSite.count({
    where: { userId: session.user.id },
  })
  if (existingSites >= limit) {
    return Response.json(
      {
        error: `Votre offre ${getPlan(ownerPlan).name} autorise ${limit} site(s). Passez à une offre supérieure pour en publier davantage.`,
        code: 'SITE_LIMIT_REACHED',
        plan: ownerPlan,
        limit,
      },
      { status: 403 }
    )
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`
    const slug = `${baseSlug.slice(0, 60 - suffix.length).replace(/-+$/g, '')}${suffix}`

    try {
      const site = await prisma.$transaction(async (transaction) => {
        const count = await transaction.clientSite.count({
          where: { userId: session.user.id },
        })
        if (count >= getPlan(ownerPlan).maxSites) {
          throw new SiteQuotaExceededError()
        }
        return transaction.clientSite.create({
          data: {
            slug,
            businessName,
            templateId: template.id,
            data: formData,
            published: true,
            userId: session.user.id,
          },
          select: { slug: true },
        })
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
      return Response.json(
        { slug: site.slug, url: `/${site.slug}` },
        { status: 201 }
      )
    } catch (error) {
      if (error instanceof SiteQuotaExceededError) {
        return Response.json(
          {
            error: `Votre offre ${getPlan(ownerPlan).name} a atteint sa limite de sites.`,
            code: 'SITE_LIMIT_REACHED',
          },
          { status: 403 }
        )
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        continue
      }
      throw error
    }
  }

  return Response.json(
    { error: 'Impossible de réserver une adresse pour ce site, réessayez' },
    { status: 503 }
  )
}

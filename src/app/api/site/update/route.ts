import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
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

function isUpdateRequest(
  value: unknown
): value is { slug: string; templateId: string; formData: Record<string, string> } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  const request = value as Record<string, unknown>
  return (
    typeof request.slug === 'string' &&
    request.slug.length > 0 &&
    typeof request.templateId === 'string' &&
    isStringRecord(request.formData)
  )
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Authentification requise' }, { status: 401 })
  }
  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suspended: true },
  })
  if (!account || account.suspended) {
    return Response.json({ error: 'Compte suspendu' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }
  if (!isUpdateRequest(body)) {
    return Response.json({ error: 'Données du site invalides' }, { status: 400 })
  }

  const site = await prisma.clientSite.findUnique({
    where: { slug: body.slug },
    include: { template: true },
  })
  if (!site || site.userId !== session.user.id) {
    return Response.json({ error: 'Site introuvable' }, { status: 404 })
  }
  if (site.templateId !== body.templateId) {
    return Response.json({ error: 'Le modèle du site ne peut pas être modifié' }, { status: 400 })
  }

  const variables = getTemplateVariables(site.template.variables)
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
    await renderPosterHtml(site.template.htmlContent, formData, site.template.variables)
  } catch (error) {
    if (error instanceof InvalidPosterDataError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  await prisma.clientSite.update({
    where: { id: site.id },
    data: { businessName, data: formData },
  })

  return Response.json({ url: `/${site.slug}` })
}

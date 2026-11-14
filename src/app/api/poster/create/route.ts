import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { InvalidPosterDataError, renderPosterHtml } from '@/lib/template'
import { enforceRateLimit } from '@/lib/rate-limit'

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  )
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, 'poster-create', 10)
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { suspended: true },
    })
    if (!user || user.suspended) {
      return Response.json({ error: 'Votre compte est suspendu.' }, { status: 403 })
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const { formData, templateId, format = 'png' } = body as {
    formData?: unknown
    templateId?: unknown
    format?: unknown
  }
  if (
    typeof templateId !== 'string' ||
    !templateId ||
    (format !== 'png' && format !== 'pdf') ||
    !isStringRecord(formData)
  ) {
    return Response.json(
      { error: 'templateId et formData requis' },
      { status: 400 }
    )
  }

  const template = await prisma.posterTemplate.findUnique({
    where: { id: templateId, active: true },
  })
  if (!template) {
    return Response.json({ error: 'Template introuvable' }, { status: 404 })
  }

  try {
    await renderPosterHtml(template.htmlContent, formData, template.variables)
  } catch (error) {
    if (error instanceof InvalidPosterDataError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  try {
    const creation = await prisma.posterCreation.create({
      data: {
        templateId,
        data: formData,
        format,
        userId: session?.user?.id,
      },
      select: { id: true },
    })
    return Response.json({ creationId: creation.id })
  } catch (error) {
    console.error('Échec de création de l’affiche gratuite:', error)
    return Response.json(
      { error: 'Impossible de préparer cette affiche pour le moment.' },
      { status: 503 }
    )
  }
}

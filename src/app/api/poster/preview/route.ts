import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvalidPosterDataError, renderPosterHtml } from '@/lib/template'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const { formData, templateId } = body as {
    formData?: unknown
    templateId?: unknown
  }

  if (typeof templateId !== 'string' || !templateId || !formData) {
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

  let html: string
  try {
    html = await renderPosterHtml(
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

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
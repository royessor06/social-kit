import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvalidPosterDataError, renderPosterHtml } from '@/lib/template'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  if (!isRecord(body) || typeof body.templateId !== 'string' || !isRecord(body.formData)) {
    return Response.json({ error: 'templateId et formData requis' }, { status: 400 })
  }

  const template = await prisma.siteTemplate.findUnique({
    where: { id: body.templateId, active: true },
  })
  if (!template) {
    return Response.json({ error: 'Modèle de site introuvable' }, { status: 404 })
  }

  let html: string
  try {
    html = await renderPosterHtml(
      template.htmlContent,
      body.formData,
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

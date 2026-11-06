import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const access = await requireAdmin()
  if (!access.ok) return access.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }
  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body) ||
    typeof (body as Record<string, unknown>).active !== 'boolean'
  ) {
    return Response.json({ error: 'Statut du modèle invalide' }, { status: 400 })
  }

  const { kind, id } = await params
  const active = (body as { active: boolean }).active
  if (kind === 'posters') {
    const result = await prisma.posterTemplate.updateMany({
      where: { id },
      data: { active },
    })
    if (result.count === 0) {
      return Response.json({ error: 'Modèle introuvable' }, { status: 404 })
    }
  } else if (kind === 'sites') {
    const result = await prisma.siteTemplate.updateMany({
      where: { id },
      data: { active },
    })
    if (result.count === 0) {
      return Response.json({ error: 'Modèle introuvable' }, { status: 404 })
    }
  } else {
    return Response.json({ error: 'Type de modèle invalide' }, { status: 404 })
  }

  return Response.json({ id, active })
}

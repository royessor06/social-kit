import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
    typeof (body as Record<string, unknown>).suspended !== 'boolean'
  ) {
    return Response.json({ error: 'Statut de suspension invalide' }, { status: 400 })
  }

  const { id } = await params
  const suspended = (body as { suspended: boolean }).suspended
  const result = await prisma.clientSite.updateMany({
    where: { id },
    data: { suspended },
  })
  if (result.count === 0) {
    return Response.json({ error: 'Site introuvable' }, { status: 404 })
  }
  return Response.json({ id, suspended })
}

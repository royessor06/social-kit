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
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, suspended: true },
  })
  if (!target) {
    return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }
  if (target.id === access.user.id && suspended) {
    return Response.json(
      { error: 'Vous ne pouvez pas suspendre votre propre compte' },
      { status: 400 }
    )
  }
  if (target.role === 'ADMIN' && suspended && !target.suspended) {
    const activeAdmins = await prisma.user.count({
      where: { role: 'ADMIN', suspended: false },
    })
    if (activeAdmins <= 1) {
      return Response.json(
        { error: 'Le dernier administrateur actif ne peut pas être suspendu' },
        { status: 409 }
      )
    }
  }

  await prisma.user.update({ where: { id }, data: { suspended } })
  return Response.json({ id, suspended })
}

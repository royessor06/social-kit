import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: Response.json({ error: 'Authentification requise' }, { status: 401 }),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, suspended: true },
  })

  if (!user || user.suspended || user.role !== 'ADMIN') {
    return {
      ok: false as const,
      response: Response.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 }),
    }
  }

  return { ok: true as const, user }
}

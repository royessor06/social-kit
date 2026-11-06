import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }
  const token = 'token' in body && typeof body.token === 'string' ? body.token : ''
  const password =
    'password' in body && typeof body.password === 'string' ? body.password : ''

  if (!/^[a-f0-9]{64}$/.test(token) || password.length < 8 || password.length > 128) {
    return Response.json(
      { error: 'Le lien est invalide ou expiré, ou le mot de passe ne respecte pas les critères.' },
      { status: 400 }
    )
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
    select: { id: true, userId: true, expiresAt: true },
  })

  if (!resetToken || resetToken.expiresAt <= new Date()) {
    return Response.json(
      { error: 'Le lien est invalide ou expiré. Demandez-en un nouveau.' },
      { status: 400 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const updated = await prisma.$transaction(async (transaction) => {
    const consumed = await transaction.passwordResetToken.deleteMany({
      where: {
        id: resetToken.id,
        token: tokenHash,
        expiresAt: { gt: new Date() },
      },
    })
    if (consumed.count !== 1) return false

    await transaction.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    })
    await transaction.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    })
    return true
  })

  if (!updated) {
    return Response.json(
      { error: 'Le lien est invalide ou expiré. Demandez-en un nouveau.' },
      { status: 400 }
    )
  }

  return Response.json({ message: 'Votre mot de passe a été modifié. Vous pouvez vous connecter.' })
}

import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'

const genericMessage =
  'Si un compte correspond à cette adresse, un lien de réinitialisation va être envoyé.'

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const email =
    typeof body === 'object' &&
    body !== null &&
    'email' in body &&
    typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ error: 'Adresse e-mail invalide.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  })

  if (!user) return Response.json({ message: genericMessage })

  const token = randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL doit être configuré pour la réinitialisation.')
  }

  const resetUrl = new URL('/reinitialiser-mot-de-passe', appUrl)
  resetUrl.searchParams.set('token', token)

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { token: tokenHash, userId: user.id, expiresAt },
    }),
  ])

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? 'SOCIAL KIT <onboarding@resend.dev>',
          to: [user.email],
          subject: 'Réinitialisation de votre mot de passe SOCIAL KIT',
          html: `<p>Vous avez demandé à réinitialiser votre mot de passe.</p><p><a href="${resetUrl.toString()}">Choisir un nouveau mot de passe</a></p><p>Ce lien expire dans 30 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
        }),
      })

      if (!response.ok) {
        console.error(
          `Échec de l’envoi de l’e-mail de réinitialisation (Resend ${response.status}):`,
          await response.text()
        )
      }
    } catch (error) {
      console.error('Impossible de joindre Resend pour envoyer le lien de réinitialisation:', error)
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.info('Lien de réinitialisation SOCIAL KIT (développement):', resetUrl.toString())
  }

  return Response.json({ message: genericMessage })
}

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { getPosterPrice } from '@/lib/payment'
import { prisma } from '@/lib/prisma'
import { verifyFedaPayTransaction } from '@/lib/fedapay'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const creationId =
    typeof body === 'object' &&
    body !== null &&
    !Array.isArray(body) &&
    'creationId' in body &&
    typeof body.creationId === 'string'
      ? body.creationId
      : ''
  if (!creationId) {
    return Response.json({ error: 'creationId requis' }, { status: 400 })
  }

  const creation = await prisma.posterCreation.findUnique({
    where: { id: creationId },
    select: {
      id: true,
      transactionId: true,
      paymentStatus: true,
      userId: true,
    },
  })
  if (!creation || !creation.transactionId) {
    return Response.json({ error: 'Paiement introuvable' }, { status: 404 })
  }

  if (creation.userId) {
    const session = await auth()
    if (session?.user?.id !== creation.userId) {
      return Response.json({ error: 'Accès interdit' }, { status: 403 })
    }
  }

  if (creation.paymentStatus === 'PAID') {
    return Response.json({ paid: true })
  }

  let verification: Awaited<ReturnType<typeof verifyFedaPayTransaction>>
  try {
    verification = await verifyFedaPayTransaction(
      creation.transactionId,
      creation.id,
      getPosterPrice()
    )
  } catch (error) {
    console.error('Échec de vérification du paiement FedaPay:', error)
    return Response.json(
      { error: 'Impossible de vérifier le paiement auprès de FedaPay.' },
      { status: 502 }
    )
  }

  if (!verification.isValid) {
    return Response.json(
      { error: 'Les informations de la transaction ne correspondent pas.' },
      { status: 409 }
    )
  }

  if (verification.status !== 'approved') {
    if (verification.status === 'declined' || verification.status === 'canceled') {
      await prisma.posterCreation.updateMany({
        where: { id: creation.id, paymentStatus: { not: 'PAID' } },
        data: { paymentStatus: 'FAILED' },
      })
    }
    return Response.json(
      { paid: false, error: 'Le paiement n’est pas encore confirmé.' },
      { status: 409 }
    )
  }

  await prisma.posterCreation.updateMany({
    where: {
      id: creation.id,
      transactionId: creation.transactionId,
      paymentStatus: { not: 'PAID' },
    },
    data: {
      paid: true,
      paymentStatus: 'PAID',
      paymentMethod: verification.paymentMethod,
    },
  })

  return Response.json({ paid: true })
}

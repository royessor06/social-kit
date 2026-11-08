import { getPosterPrice } from '@/lib/payment'
import { prisma } from '@/lib/prisma'
import {
  hasValidFedaPayWebhookSignature,
  verifyFedaPayTransaction,
} from '@/lib/fedapay'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function findTransactionId(value: unknown, depth = 0): string | null {
  if (!isRecord(value) || depth > 4) return null

  const nestedKeys = [
    'v1/transaction',
    'transaction',
    'entity',
    'data',
    'object',
    'resource',
  ]
  for (const key of nestedKeys) {
    const nested = value[key]
    if (!isRecord(nested)) continue
    const id = nested.id
    if (
      (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) ||
      (typeof id === 'string' && /^\d+$/.test(id))
    ) {
      return String(id)
    }
    const nestedId = findTransactionId(nested, depth + 1)
    if (nestedId) return nestedId
  }

  return null
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return Response.json(
      { error: 'Le webhook doit être au format JSON.' },
      { status: 415 }
    )
  }

  const secret = process.env.FEDAPAY_WEBHOOK_SECRET
  if (!secret) {
    return Response.json(
      { error: 'FEDAPAY_WEBHOOK_SECRET n’est pas configurée.' },
      { status: 503 }
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-fedapay-signature')
  if (
    !signature ||
    !hasValidFedaPayWebhookSignature(rawBody, signature, secret)
  ) {
    return Response.json({ error: 'Signature invalide ou expirée.' }, { status: 401 })
  }

  let event: unknown
  try {
    event = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Corps JSON invalide.' }, { status: 400 })
  }
  if (!isRecord(event) || typeof event.name !== 'string') {
    return Response.json(
      { error: 'Événement FedaPay invalide.' },
      { status: 400 }
    )
  }

  if (event.name !== 'transaction.approved') {
    return Response.json({ received: true })
  }

  const transactionId = findTransactionId(event)
  if (!transactionId) {
    return Response.json(
      { error: 'Identifiant de transaction manquant.' },
      { status: 400 }
    )
  }

  const creation = await prisma.posterCreation.findFirst({
    where: { transactionId },
    select: { id: true, paymentStatus: true },
  })
  if (!creation) {
    return Response.json({ error: 'Transaction introuvable.' }, { status: 404 })
  }
  if (creation.paymentStatus === 'PAID') {
    return Response.json({ received: true })
  }

  let verification: Awaited<ReturnType<typeof verifyFedaPayTransaction>>
  try {
    verification = await verifyFedaPayTransaction(
      transactionId,
      creation.id,
      getPosterPrice()
    )
  } catch (error) {
    console.error('Échec de vérification du webhook FedaPay:', error)
    return Response.json(
      { error: 'Impossible de vérifier le paiement auprès de FedaPay.' },
      { status: 502 }
    )
  }

  if (
    !verification.isValid ||
    verification.status !== 'approved'
  ) {
    return Response.json(
      { error: 'Le paiement FedaPay n’est pas approuvé.' },
      { status: 409 }
    )
  }

  await prisma.posterCreation.updateMany({
    where: { id: creation.id, transactionId, paymentStatus: { not: 'PAID' } },
    data: {
      paid: true,
      paymentStatus: 'PAID',
      paymentMethod: verification.paymentMethod,
    },
  })

  return Response.json({ received: true })
}

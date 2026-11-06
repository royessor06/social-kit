import { createHmac, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { getCinetPayBaseUrl, getPosterPrice } from '@/lib/cinetpay'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasValidSignature(rawBody: string, signature: string, secret: string) {
  const provided = signature.replace(/^sha256=/i, '').trim()
  const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBase64 = createHmac('sha256', secret).update(rawBody).digest('base64')
  const candidates = [expectedHex, expectedBase64]

  return candidates.some((candidate) => {
    const expectedBuffer = Buffer.from(candidate)
    const providedBuffer = Buffer.from(provided)
    return (
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer)
    )
  })
}

export async function POST(request: Request) {
  const secret = process.env.CINETPAY_SECRET_KEY
  if (!secret) {
    return Response.json(
      { error: 'La clé secrète CinetPay n’est pas configurée' },
      { status: 503 }
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-cinetpay-signature')
  if (!signature || !hasValidSignature(rawBody, signature, secret)) {
    return Response.json({ error: 'Signature invalide' }, { status: 401 })
  }

  let payload: unknown
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }
  } else if (
    request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')
  ) {
    payload = Object.fromEntries(new URLSearchParams(rawBody))
  } else {
    return Response.json({ error: 'Type de contenu non pris en charge' }, { status: 415 })
  }
  if (!isRecord(payload)) {
    return Response.json({ error: 'Notification invalide' }, { status: 400 })
  }

  const transactionId =
    typeof payload.transaction_id === 'string'
      ? payload.transaction_id
      : typeof payload.cpm_trans_id === 'string'
        ? payload.cpm_trans_id
        : ''
  if (!transactionId) {
    return Response.json({ error: 'Identifiant de transaction manquant' }, { status: 400 })
  }

  const creation = await prisma.posterCreation.findFirst({
    where: { transactionId },
    select: { id: true, paymentStatus: true },
  })
  if (!creation) {
    return Response.json({ error: 'Transaction introuvable' }, { status: 404 })
  }
  if (creation.paymentStatus === 'PAID') {
    return Response.json({ received: true })
  }

  const notificationStatus =
    typeof payload.status === 'string'
      ? payload.status.toUpperCase()
      : payload.cpm_result === '00'
        ? 'ACCEPTED'
        : ''
  if (notificationStatus !== 'ACCEPTED') {
    await prisma.posterCreation.updateMany({
      where: { id: creation.id, paymentStatus: { not: 'PAID' } },
      data: { paymentStatus: 'FAILED' },
    })
    return Response.json({ received: true })
  }

  const apiKey = process.env.CINETPAY_API_KEY
  const siteId = process.env.CINETPAY_SITE_ID
  if (!apiKey || !siteId) {
    return Response.json(
      { error: 'La configuration CinetPay est incomplète' },
      { status: 503 }
    )
  }

  let verificationResponse: Response
  try {
    verificationResponse = await fetch(
      `${getCinetPayBaseUrl()}/v2/payment/check`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          apikey: apiKey,
          site_id: siteId,
          transaction_id: transactionId,
        }),
      }
    )
  } catch {
    return Response.json(
      { error: 'Impossible de vérifier le paiement auprès de CinetPay' },
      { status: 502 }
    )
  }

  let verification: unknown
  try {
    verification = await verificationResponse.json()
  } catch {
    return Response.json({ error: 'Réponse de vérification invalide' }, { status: 502 })
  }

  const paymentData =
    isRecord(verification) && isRecord(verification.data)
      ? verification.data
      : null
  let expectedAmount: number
  try {
    expectedAmount = getPosterPrice()
  } catch {
    return Response.json({ error: 'Configuration du tarif invalide' }, { status: 503 })
  }
  if (
    !verificationResponse.ok ||
    !paymentData ||
    paymentData.status !== 'ACCEPTED' ||
    Number(paymentData.amount) !== expectedAmount ||
    paymentData.currency !== 'XOF' ||
    (typeof paymentData.transaction_id === 'string' &&
      paymentData.transaction_id !== transactionId)
  ) {
    return Response.json(
      { error: 'Le paiement n’a pas pu être confirmé' },
      { status: 409 }
    )
  }

  const paymentMethod =
    typeof paymentData.payment_method === 'string'
      ? paymentData.payment_method
      : typeof payload.payment_method === 'string'
        ? payload.payment_method
        : null

  await prisma.posterCreation.updateMany({
    where: { id: creation.id, paymentStatus: { not: 'PAID' } },
    data: {
      paid: true,
      paymentStatus: 'PAID',
      paymentMethod,
    },
  })

  return Response.json({ received: true })
}

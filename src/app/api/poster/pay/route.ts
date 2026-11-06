import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCinetPayBaseUrl, getPosterPrice } from '@/lib/cinetpay'
import { InvalidPosterDataError, renderPosterHtml } from '@/lib/template'

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  )
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const { formData, templateId, format = 'png' } = body as {
    formData?: unknown
    templateId?: unknown
    format?: unknown
  }

  if (
    typeof templateId !== 'string' ||
    !templateId ||
    (format !== 'png' && format !== 'pdf') ||
    !isStringRecord(formData)
  ) {
    return Response.json(
      { error: 'templateId et formData requis' },
      { status: 400 }
    )
  }

  const template = await prisma.posterTemplate.findUnique({
    where: { id: templateId, active: true },
  })

  if (!template) {
    return Response.json({ error: 'Template introuvable' }, { status: 404 })
  }

  try {
    await renderPosterHtml(template.htmlContent, formData, template.variables)
  } catch (error) {
    if (error instanceof InvalidPosterDataError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  const apiKey = process.env.CINETPAY_API_KEY
  const siteId = process.env.CINETPAY_SITE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!apiKey || !siteId || !appUrl) {
    return Response.json(
      { error: 'La configuration CinetPay est incomplète' },
      { status: 503 }
    )
  }

  let baseUrl: string
  let amount: number
  let publicUrl: URL
  try {
    baseUrl = getCinetPayBaseUrl()
    amount = getPosterPrice()
    publicUrl = new URL(appUrl)
    if (
      publicUrl.protocol !== 'https:' &&
      !(process.env.NODE_ENV !== 'production' && publicUrl.hostname === 'localhost')
    ) {
      throw new Error('NEXT_PUBLIC_APP_URL doit utiliser HTTPS')
    }
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'La configuration CinetPay est invalide',
      },
      { status: 503 }
    )
  }

  const session = await auth()
  const transactionId = randomUUID()
  const creation = await prisma.posterCreation.create({
    data: {
      templateId,
      data: formData,
      paid: false,
      paymentStatus: 'PENDING',
      transactionId,
      format,
      userId: session?.user?.id,
    },
  })

  const returnUrl = new URL('/paiement/succes', publicUrl)
  returnUrl.searchParams.set('creationId', creation.id)
  returnUrl.searchParams.set('templateId', templateId)
  returnUrl.searchParams.set('format', format)
  const notifyUrl = new URL('/api/webhooks/cinetpay', publicUrl)

  let paymentResponse: Response
  try {
    paymentResponse = await fetch(`${baseUrl}/v2/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transactionId,
        amount,
        currency: 'XOF',
        description: 'Téléchargement d’une affiche SOCIAL KIT',
        notify_url: notifyUrl.toString(),
        return_url: returnUrl.toString(),
        channels: 'ALL',
        lang: 'FR',
        metadata: JSON.stringify({ creationId: creation.id }),
      }),
    })
  } catch {
    await prisma.posterCreation.update({
      where: { id: creation.id },
      data: { paymentStatus: 'FAILED' },
    })
    return Response.json(
      { error: 'CinetPay est momentanément injoignable. Réessayez.' },
      { status: 502 }
    )
  }

  let result: unknown
  try {
    result = await paymentResponse.json()
  } catch {
    await prisma.posterCreation.update({
      where: { id: creation.id },
      data: { paymentStatus: 'FAILED' },
    })
    return Response.json(
      { error: 'Réponse CinetPay invalide' },
      { status: 502 }
    )
  }

  const paymentUrl =
    typeof result === 'object' &&
    result !== null &&
    !Array.isArray(result) &&
    typeof (result as { data?: { payment_url?: unknown } }).data?.payment_url ===
      'string'
      ? (result as { data: { payment_url: string } }).data.payment_url
      : ''
  let trustedPaymentUrl: URL | null = null
  try {
    trustedPaymentUrl = new URL(paymentUrl)
  } catch {
    trustedPaymentUrl = null
  }

  if (
    !paymentResponse.ok ||
    !trustedPaymentUrl ||
    trustedPaymentUrl.protocol !== 'https:' ||
    !(
      trustedPaymentUrl.hostname === 'cinetpay.com' ||
      trustedPaymentUrl.hostname.endsWith('.cinetpay.com')
    )
  ) {
    await prisma.posterCreation.update({
      where: { id: creation.id },
      data: { paymentStatus: 'FAILED' },
    })
    return Response.json(
      { error: 'CinetPay n’a pas pu générer le lien de paiement' },
      { status: 502 }
    )
  }

  return Response.json({
    creationId: creation.id,
    payment_url: trustedPaymentUrl.toString(),
  })
}
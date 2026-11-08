import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getPosterPrice } from '@/lib/payment'
import {
  extractFedaPayTransaction,
  fedaPayRequest,
  getFedaPayConfig,
} from '@/lib/fedapay'
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  let fedapayConfig: ReturnType<typeof getFedaPayConfig>
  let amount: number
  let publicUrl: URL
  try {
    fedapayConfig = getFedaPayConfig()
    amount = getPosterPrice()
    if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL doit être configurée')
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
            : 'La configuration FedaPay est invalide',
      },
      { status: 503 }
    )
  }

  const session = await auth()
  const creation = await prisma.posterCreation.create({
    data: {
      templateId,
      data: formData,
      paid: false,
      paymentStatus: 'PENDING',
      format,
      userId: session?.user?.id,
    },
  })

  const returnUrl = new URL('/paiement/succes', publicUrl)
  returnUrl.searchParams.set('creationId', creation.id)
  returnUrl.searchParams.set('templateId', templateId)
  returnUrl.searchParams.set('format', format)
  let transactionId: string
  try {
    const result = await fedaPayRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency: { iso: 'XOF' },
        description: 'Affiche SOCIAL KIT',
        callback_url: returnUrl.toString(),
        custom_metadata: { creationId: creation.id },
      }),
    })

    const transaction = extractFedaPayTransaction(result)
    const id = transaction?.id
    if (
      typeof id !== 'number' ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      throw new Error('Réponse de création FedaPay invalide')
    }
    transactionId = String(id)
  } catch (error) {
    console.error('Échec de création de transaction FedaPay:', error)
    await prisma.posterCreation.update({
      where: { id: creation.id },
      data: { paymentStatus: 'FAILED' },
    })
    return Response.json(
      { error: 'FedaPay ne peut pas préparer le paiement pour le moment. Réessayez.' },
      { status: 502 }
    )
  }

  await prisma.posterCreation.update({
    where: { id: creation.id },
    data: { transactionId },
  })

  return Response.json({
    creationId: creation.id,
    transactionId: Number(transactionId),
    amount,
    publicKey: fedapayConfig.publicKey,
    mode: fedapayConfig.mode,
  })
}
import { createHmac, timingSafeEqual } from 'node:crypto'

const FEDAPAY_API_BASE_URLS = {
  sandbox: 'https://sandbox-api.fedapay.com/v1',
  live: 'https://api.fedapay.com/v1',
} as const

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getFedaPayMode() {
  const mode = (process.env.FEDAPAY_MODE || 'sandbox').trim().toLowerCase()
  if (mode === 'sandbox' || mode === 'live') return mode
  throw new Error('FEDAPAY_MODE doit être sandbox ou live')
}

export function getFedaPayApiBaseUrl() {
  return FEDAPAY_API_BASE_URLS[getFedaPayMode()]
}

export function getFedaPayConfig() {
  const secretKey = process.env.FEDAPAY_SECRET_KEY
  const publicKey = process.env.FEDAPAY_PUBLIC_KEY
  if (!secretKey || !publicKey) {
    throw new Error('FEDAPAY_SECRET_KEY et FEDAPAY_PUBLIC_KEY doivent être configurées')
  }
  return { secretKey, publicKey, mode: getFedaPayMode() }
}

export function extractFedaPayTransaction(payload: unknown): JsonRecord | null {
  if (!isRecord(payload)) return null

  const resource =
    payload['v1/transaction'] ??
    payload.transaction ??
    payload.data ??
    payload

  if (!isRecord(resource)) return null

  const nestedResource = resource['v1/transaction'] ?? resource.transaction
  return isRecord(nestedResource) ? nestedResource : resource
}

export async function verifyFedaPayTransaction(
  transactionId: string,
  creationId: string,
  expectedAmount: number
) {
  const result = await fedaPayRequest(
    `/transactions/${encodeURIComponent(transactionId)}`
  )
  const transaction = extractFedaPayTransaction(result)
  const returnedId =
    typeof transaction?.id === 'number' || typeof transaction?.id === 'string'
      ? String(transaction.id)
      : ''
  const status =
    typeof transaction?.status === 'string'
      ? transaction.status.trim().toLowerCase()
      : ''
  const amount = Number(transaction?.amount)
  const currencyIso =
    typeof transaction?.currency === 'string'
      ? transaction.currency
      : isRecord(transaction?.currency) &&
          typeof transaction.currency.iso === 'string'
        ? transaction.currency.iso
        : typeof transaction?.currency_iso === 'string'
          ? transaction.currency_iso
          : null
  const metadata = isRecord(transaction?.custom_metadata)
    ? transaction.custom_metadata
    : null
  const metadataCreationId =
    typeof metadata?.creationId === 'string'
      ? metadata.creationId
      : typeof metadata?.creation_id === 'string'
        ? metadata.creation_id
        : null

  const isValid =
    returnedId === transactionId &&
    Number.isSafeInteger(amount) &&
    amount === expectedAmount &&
    (!currencyIso || currencyIso.toUpperCase() === 'XOF') &&
    (!metadataCreationId || metadataCreationId === creationId)

  const paymentMethod =
    typeof transaction?.payment_method === 'string'
      ? transaction.payment_method
      : isRecord(transaction?.payment_method) &&
          typeof transaction.payment_method.name === 'string'
        ? transaction.payment_method.name
        : null

  return { isValid, status, paymentMethod }
}

export async function fedaPayRequest(
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const secretKey = process.env.FEDAPAY_SECRET_KEY
  if (!secretKey) {
    throw new Error('FEDAPAY_SECRET_KEY doit être configurée')
  }
  const response = await fetch(`${getFedaPayApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`FedaPay API a répondu avec le statut ${response.status}`)
  }

  return response.json()
}

export function hasValidFedaPayWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
) {
  const fields = signatureHeader.split(',').map((field) => {
    const separator = field.indexOf('=')
    return separator < 0
      ? ['', '']
      : [field.slice(0, separator).trim(), field.slice(separator + 1).trim()]
  })
  const timestampValue = fields.find(([key]) => key === 't')?.[1]
  const timestamp = timestampValue ? Number(timestampValue) : NaN
  const currentTimestamp = Math.floor(Date.now() / 1000)

  if (
    !Number.isSafeInteger(timestamp) ||
    Math.abs(currentTimestamp - timestamp) > 300
  ) {
    return false
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest()
  const signatures = fields
    .filter(([key, value]) => key === 's' && /^[a-f0-9]{64}$/i.test(value))
    .map(([, value]) => Buffer.from(value, 'hex'))

  return signatures.some(
    (signature) =>
      signature.length === expected.length &&
      timingSafeEqual(signature, expected)
  )
}

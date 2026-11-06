import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

type VariableType = 'text' | 'textarea' | 'color' | 'image'

export type TemplateVariableMeta = {
  key: string
  label: string
  type: VariableType
  default: string
}

const VARIABLE_TYPES = ['text', 'textarea', 'color', 'image'] as const
const UPLOAD_PATH = /^\/uploads\/([a-zA-Z0-9_-]+\.(?:png|jpe?g|webp))$/
const BLOB_UPLOAD_PATH = /^\/uploads\/([a-zA-Z0-9_-]+\.(?:png|jpe?g|webp))$/
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export class InvalidPosterDataError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string')
}

function isVariableType(value: unknown): value is VariableType {
  return typeof value === 'string' && VARIABLE_TYPES.some((type) => type === value)
}

export function getTemplateVariables(value: unknown): TemplateVariableMeta[] {
  if (!Array.isArray(value)) {
    throw new Error('Métadonnées de variables du template invalides')
  }

  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.key !== 'string' ||
      !/^\w+$/.test(item.key) ||
      typeof item.label !== 'string' ||
      !isVariableType(item.type) ||
      typeof item.default !== 'string'
    ) {
      throw new Error('Métadonnées de variables du template invalides')
    }

    return {
      key: item.key,
      label: item.label,
      type: item.type,
      default: item.default,
    }
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

async function imageDataUrl(value: string) {
  let buffer: Buffer
  let filename: string
  const localMatch = UPLOAD_PATH.exec(value)
  if (localMatch) {
    filename = localMatch[1]
    try {
      buffer = await readFile(join(process.cwd(), 'public', 'uploads', filename))
    } catch {
      throw new InvalidPosterDataError('Image introuvable')
    }
  } else {
    let url: URL
    try {
      url = new URL(value)
    } catch {
      throw new InvalidPosterDataError('Image invalide')
    }
    const blobMatch = BLOB_UPLOAD_PATH.exec(url.pathname)
    if (
      url.protocol !== 'https:' ||
      !url.hostname.endsWith('.public.blob.vercel-storage.com') ||
      !blobMatch
    ) {
      throw new InvalidPosterDataError('Image invalide : seuls les uploads de la plateforme sont autorisés')
    }
    filename = blobMatch[1]
    let response: Response
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        redirect: 'error',
      })
    } catch {
      throw new InvalidPosterDataError('Image Blob momentanément indisponible')
    }
    const contentLength = Number(response.headers.get('content-length') ?? 0)
    if (!response.ok || (contentLength > 0 && contentLength > MAX_IMAGE_BYTES)) {
      throw new InvalidPosterDataError('Image introuvable ou trop volumineuse')
    }
    const bytes = await response.arrayBuffer()
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      throw new InvalidPosterDataError('Image trop volumineuse')
    }
    buffer = Buffer.from(bytes)
  }
  const extension = filename.split('.').pop()?.toLowerCase()
  const contentType = extension === 'png'
    ? 'image/png'
    : extension === 'webp'
      ? 'image/webp'
      : 'image/jpeg'

  return `data:${contentType};base64,${buffer.toString('base64')}`
}

export async function renderPosterHtml(
  html: string,
  formData: unknown,
  variableMetadata: unknown
) {
  if (
    !isStringRecord(formData) ||
    Object.keys(formData).length > 50 ||
    Object.values(formData).some((value) => value.length > 5000)
  ) {
    throw new InvalidPosterDataError('Les données du formulaire sont invalides')
  }

  const variables = getTemplateVariables(variableMetadata)
  const variablesByKey = new Map(variables.map((variable) => [variable.key, variable]))
  const values = formData
  const imageUrls = new Map<string, string>()

  for (const { key, type } of variables) {
    const value = values[key] ?? variablesByKey.get(key)?.default ?? ''
    if (value.length > 5000) {
      throw new InvalidPosterDataError(`Valeur trop longue pour ${key}`)
    }
    if (type === 'color' && !/^#[\da-f]{6}$/i.test(value)) {
      throw new InvalidPosterDataError(`Couleur invalide pour ${key}`)
    }
    if (type === 'image' && value) {
      imageUrls.set(key, await imageDataUrl(value))
    }
  }

  const rendered = html.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const variable = variablesByKey.get(key)
    const value = values[key] ?? variable?.default ?? ''

    if (variable?.type === 'image') {
      const src = imageUrls.get(key)
      return src
        ? `<img src="${escapeHtml(src)}" class="logo-img" alt="" />`
        : ''
    }

    return escapeHtml(value)
  })

  const policy =
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'; script-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">'

  return rendered.replace(/<head\b[^>]*>/i, (head) => `${head}\n${policy}`)
}

import { NextRequest } from 'next/server'
import chromium from '@sparticuz/chromium'
import { chromium as playwrightCoreChromium } from 'playwright-core'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { InvalidPosterDataError, renderPosterHtml } from '@/lib/template'
import { enforceRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

type ExportPage = {
  route: (
    url: string,
    handler: (route: { abort: () => Promise<void> }) => Promise<void>
  ) => Promise<unknown>
  setContent: (
    html: string,
    options: { waitUntil: 'networkidle' }
  ) => Promise<void>
  pdf: (options: {
    width: string
    height: string
    printBackground: boolean
  }) => Promise<Buffer>
  screenshot: (options: {
    type: 'png'
    fullPage: boolean
    clip: { x: number; y: number; width: number; height: number }
  }) => Promise<Buffer>
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, 'poster-export', 10)
  if (rateLimitResponse) return rateLimitResponse

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const { templateId, creationId, format = 'png' } = body as {
    templateId?: unknown
    creationId?: unknown
    format?: unknown
  }

  if (
    typeof templateId !== 'string' ||
    typeof creationId !== 'string' ||
    !templateId ||
    !creationId ||
    (format !== 'png' && format !== 'pdf')
  ) {
    return Response.json(
      { error: 'templateId, creationId ou format invalide' },
      { status: 400 }
    )
  }

  const creation = await prisma.posterCreation.findUnique({
    where: { id: creationId },
  })
  if (
    !creation ||
    creation.templateId !== templateId
  ) {
    return Response.json({ error: 'Affiche introuvable' }, { status: 404 })
  }
  const session = await auth()
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { suspended: true },
    })
    if (!user || user.suspended) {
      return Response.json({ error: 'Votre compte est suspendu.' }, { status: 403 })
    }
  }
  if (creation.userId) {
    if (session?.user?.id !== creation.userId) {
      return Response.json({ error: 'Accès interdit' }, { status: 403 })
    }
  }
  const template = await prisma.posterTemplate.findUnique({
    where: { id: templateId },
  })
  if (!template) {
    return Response.json({ error: 'Template introuvable' }, { status: 404 })
  }

  let html: string
  try {
    html = await renderPosterHtml(
      template.htmlContent,
      creation.data,
      template.variables
    )
  } catch (error) {
    if (error instanceof InvalidPosterDataError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  let buffer: Buffer
  let page: ExportPage
  let closeBrowser: (() => Promise<void>) | undefined
  try {
    if (process.env.NODE_ENV === 'production') {
      const browser = await playwrightCoreChromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
      closeBrowser = () => browser.close()
      page = await browser.newPage({
        viewport: { width: 1080, height: 1080 },
      })
    } else {
      const browser = await (await import('playwright')).chromium.launch()
      closeBrowser = () => browser.close()
      page = await browser.newPage({
        viewport: { width: 1080, height: 1080 },
      })
    }
    await page.route('**/*', (route) => route.abort())
    await page.setContent(html, { waitUntil: 'networkidle' })

    if (format === 'pdf') {
      buffer = await page.pdf({
        width: '1080px',
        height: '1080px',
        printBackground: true,
      })
    } else {
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1080, height: 1080 },
      })
      buffer = Buffer.from(screenshot)
    }
  } catch (error) {
    console.error('Échec de génération de l’export affiche:', error)
    return Response.json(
      { error: 'Impossible de générer le fichier pour le moment. Réessayez.' },
      { status: 500 }
    )
  } finally {
    await closeBrowser?.()
  }

  let claimed: { count: number }
  try {
    claimed = await prisma.posterCreation.updateMany({
      where: {
        id: creationId,
      },
      data: {
        downloadCount: { increment: 1 },
        exportedAt: new Date(),
        format,
      },
    })
  } catch (error) {
    console.error('Impossible d’enregistrer le téléchargement de l’affiche:', error)
    return Response.json(
      { error: 'Le fichier a été généré, mais son téléchargement ne peut pas être enregistré.' },
      { status: 503 }
    )
  }
  if (claimed.count !== 1) {
    return Response.json({ error: 'Affiche introuvable' }, { status: 404 })
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': format === 'pdf' ? 'application/pdf' : 'image/png',
      'Content-Disposition':
        format === 'pdf'
          ? 'attachment; filename="affiche.pdf"'
          : 'attachment; filename="affiche.png"',
    },
  })
}
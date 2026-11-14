import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { chromium } from 'playwright'
import { seedSiteTemplates } from '../prisma/site-templates'

const prisma = new PrismaClient()
const baseUrl = new URL(process.env.E2E_BASE_URL ?? 'http://localhost:3000')
const runId = randomUUID()
const email = `e2e-${runId}@example.test`
const name = `Test Social Kit ${runId.slice(0, 8)}`
const editedName = `${name} Modifie`
const password = `E2e!${runId}Aa9`

async function main() {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined
  let registrationAttempted = false

  try {
    await prisma.$connect()
    const templateCount = await prisma.siteTemplate.count()
    if (templateCount === 0) {
      await seedSiteTemplates(prisma)
    }

    const activeTemplate = await prisma.siteTemplate.findFirst({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true },
    })
    assert.ok(activeTemplate, 'PostgreSQL doit contenir au moins un modèle actif')
    assert.equal(
      await prisma.user.findUnique({ where: { email } }),
      null,
      'L’adresse de test doit être nouvelle'
    )

    const channel =
      process.env.PLAYWRIGHT_CHANNEL ??
      (process.platform === 'win32' ? 'msedge' : undefined)
    browser = await chromium.launch({
      headless: true,
      ...(channel ? { channel } : {}),
    })
    const page = await browser.newPage()
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))

    await page.goto(new URL('/register', baseUrl).toString())
    await page.getByLabel('Nom', { exact: true }).fill(name)
    await page.getByLabel('Adresse e-mail', { exact: true }).fill(email)
    await page
      .getByLabel(/Mot de passe/)
      .fill(password)
    registrationAttempted = true
    await page.getByRole('button', { name: 'Créer mon compte' }).click()
    await page.waitForURL(/\/dashboard$/, { timeout: 30_000 })

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    assert.ok(user, 'Le compte de test doit être enregistré dans PostgreSQL')

    await page.goto(new URL('/site/nouveau', baseUrl).toString())
    await page
      .getByRole('button', { name: 'Utiliser ce modèle' })
      .first()
      .click()
    await page.getByLabel('Nom de l’entreprise').fill(name)
    await page.getByRole('button', { name: 'Continuer', exact: true }).click()
    await page.getByRole('button', { name: 'Continuer', exact: true }).click()
    await page.getByLabel('Titre principal du site').fill(`Bienvenue chez ${name}`)
    await page.getByRole('button', { name: 'Continuer', exact: true }).click()
    await page.getByRole('button', { name: 'Continuer', exact: true }).click()
    await page.getByRole('button', { name: 'Continuer', exact: true }).click()
    await page.getByRole('button', { name: 'Générer mon site web' }).click()
    await page.getByRole('heading', { name: 'Personnalisez et publiez votre site' })
      .waitFor({ timeout: 30_000 })

    await page.locator('#site-nom_entreprise').fill(editedName)
    await page.getByRole('button', { name: 'Publier mon site' }).click()
    await page.waitForURL((url) => url.pathname !== '/site/nouveau', {
      timeout: 30_000,
    })

    const slug = new URL(page.url()).pathname.slice(1)
    assert.ok(slug, 'La publication doit ouvrir l’URL publique du site')
    const publicResponse = await page.goto(new URL(`/${slug}`, baseUrl).toString())
    assert.equal(publicResponse?.status(), 200, 'L’URL publique doit répondre HTTP 200')
    const publicContent = await page.frameLocator('iframe').locator('body').innerText()
    assert.ok(
      publicContent.includes(editedName),
      `Le nom publié doit apparaître sur la page publique. Contenu reçu : ${publicContent.slice(0, 1000)}`
    )

    const publishedSite = await prisma.clientSite.findUnique({
      where: { slug },
      select: { businessName: true, published: true, userId: true },
    })
    assert.deepEqual(publishedSite, {
      businessName: editedName,
      published: true,
      userId: user.id,
    })
    assert.deepEqual(pageErrors, [], 'Le navigateur ne doit signaler aucune erreur')

    console.log(
      JSON.stringify({
        browser: browser.version(),
        templateId: activeTemplate.id,
        accountCreatedInPostgres: true,
        wizardGenerated: true,
        editorChangesSaved: true,
        sitePublishedInPostgres: true,
        publicUrl: new URL(`/${slug}`, baseUrl).toString(),
        publicPageVerified: true,
        browserErrors: pageErrors.length,
      })
    )
  } finally {
    if (registrationAttempted) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
      if (user) {
        await prisma.$transaction(async (transaction) => {
          await transaction.clientSite.deleteMany({
            where: { userId: user.id },
          })
          await transaction.user.delete({ where: { id: user.id } })
        })
      }
    }
    await browser?.close()
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error('Échec du parcours Playwright de création/publication :', error)
  process.exitCode = 1
})

import { Prisma, PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SITE_TEMPLATE_DEFINITIONS } from '../src/lib/site-builder/templates'

export async function seedSiteTemplates(prisma: PrismaClient) {
  for (const template of SITE_TEMPLATE_DEFINITIONS) {
    const htmlContent = readFileSync(
      join(process.cwd(), 'src', 'templates', 'sites', template.templateFile),
      'utf8'
    )

    await prisma.siteTemplate.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        category: template.legacyDbCategory,
        htmlContent,
        variables: template.variables as Prisma.InputJsonArray,
        active: true,
      },
      create: {
        id: template.id,
        name: template.name,
        category: template.legacyDbCategory,
        htmlContent,
        variables: template.variables as Prisma.InputJsonArray,
        active: true,
      },
    })
  }
}

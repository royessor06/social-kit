import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  const htmlContent = readFileSync(
    join(process.cwd(), 'src/templates/posters/promo-simple.html'),
    'utf-8'
  )

  await prisma.posterTemplate.upsert({
    where: { id: 'promo-simple' },
    update: { htmlContent },
    create: {
      id: 'promo-simple',
      name: 'Promo Simple',
      category: 'Promotions',
      htmlContent,
      active: true,
    },
  })

  console.log('Template promo-simple seedé avec succès.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
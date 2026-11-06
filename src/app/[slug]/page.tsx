import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RESERVED_SITE_SLUGS } from '@/lib/site'
import { renderPosterHtml } from '@/lib/template'
import { notFound } from 'next/navigation'

export const instant = false

export default async function ClientSitePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await connection()
  const { slug } = await params

  if (RESERVED_SITE_SLUGS.has(slug.toLowerCase())) notFound()

  const site = await prisma.clientSite.findUnique({
    where: { slug, published: true, suspended: false },
    include: { template: true },
  })

  if (!site || !site.template.active) notFound()

  const html = await renderPosterHtml(
    site.template.htmlContent,
    site.data,
    site.template.variables
  )

  return (
    <main className="min-h-screen bg-white">
      <iframe
        srcDoc={html}
        title={`Site de ${site.businessName}`}
        sandbox=""
        className="h-screen min-h-screen w-full border-0"
      />
    </main>
  )
}

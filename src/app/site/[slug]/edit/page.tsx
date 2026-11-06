import Link from 'next/link'
import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getTemplateVariables } from '@/lib/template'
import { SiteBuilder } from '@/app/site/nouveau/SiteBuilder'

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Chargement de l’éditeur…
        </main>
      }
    >
      <EditSiteContent params={params} />
    </Suspense>
  )
}

async function EditSiteContent({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { slug } = await params
  const site = await prisma.clientSite.findUnique({
    where: { slug },
    include: { template: true },
  })
  if (!site || site.userId !== session.user.id) notFound()

  const variables = getTemplateVariables(site.template.variables)
  const storedData =
    typeof site.data === 'object' && site.data !== null && !Array.isArray(site.data)
      ? site.data as Record<string, unknown>
      : {}
  const formData = Object.fromEntries(
    variables.map(({ key, default: defaultValue }) => [
      key,
      typeof storedData[key] === 'string' ? storedData[key] : defaultValue,
    ])
  )

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">SOCIAL KIT</Link>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← Mon espace
          </Link>
        </div>
      </header>
      <SiteBuilder
        templates={[{
          id: site.template.id,
          name: site.template.name,
          category: site.template.category,
          variables,
        }]}
        editSite={{ slug: site.slug, templateId: site.templateId, formData }}
      />
    </main>
  )
}

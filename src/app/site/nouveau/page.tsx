import { Suspense } from 'react'
import { auth } from '@/auth'
import { AppHeader } from '@/components/layout/AppHeader'
import { SkeletonCard } from '@/components/ui'
import { prisma } from '@/lib/prisma'
import {
  resolveSiteTemplate,
  type ResolvedSiteTemplate,
} from '@/lib/site-builder/templates'
import { renderPosterHtml } from '@/lib/template'
import { SiteGalleryExperience } from './SiteGalleryExperience'

function GallerySkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-3xl space-y-3">
        <div className="h-3 w-40 animate-pulse rounded bg-slate-800" />
        <div className="h-9 w-80 max-w-full animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-800/80" />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  )
}

export default function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Suspense
        fallback={
          <>
            <AppHeader activeNav="sites" />
            <GallerySkeleton />
          </>
        }
      >
        <SiteTemplateGalleryLoader searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function SiteTemplateGalleryLoader({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const { template: requestedTemplateId } = await searchParams

  let headerUser: {
    name?: string | null
    email?: string | null
    isAdmin?: boolean
  } | null = null

  try {
    const session = await auth()
    if (session?.user?.id) {
      const account = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, suspended: true },
      })
      headerUser = {
        name: session.user.name,
        email: session.user.email,
        isAdmin: Boolean(account && !account.suspended && account.role === 'ADMIN'),
      }
    }
  } catch {
    // Keep public gallery accessible even if session/DB lookup fails
  }

  let resolvedTemplates: ResolvedSiteTemplate[] = []
  let loadError: string | undefined

  try {
    const templates = await prisma.siteTemplate.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        category: true,
        active: true,
        htmlContent: true,
        variables: true,
      },
    })

    resolvedTemplates = await Promise.all(
      templates.map(async (dbTemplate) => {
        const provisional = resolveSiteTemplate(dbTemplate, '')
        let previewHtml = ''
        try {
          previewHtml = await renderPosterHtml(
            dbTemplate.htmlContent,
            provisional.defaultConfig,
            provisional.variables
          )
        } catch {
          previewHtml = ''
        }
        return {
          ...provisional,
          previewHtml,
        }
      })
    )
  } catch {
    loadError =
      'La connexion à la base de données est momentanément indisponible. Vérifiez la configuration et réessayez.'
  }

  return (
    <SiteGalleryExperience
      templates={resolvedTemplates}
      initialTemplateId={requestedTemplateId}
      headerUser={headerUser}
      loadError={loadError}
    />
  )
}

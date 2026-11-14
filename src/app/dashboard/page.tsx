import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AppHeader } from '@/components/layout/AppHeader'
import { Badge, buttonClasses, Card, CardContent } from '@/components/ui'
import { prisma } from '@/lib/prisma'
import { PosterDownloadButtons } from './PosterDownloadButtons'
import { SignOutButton } from './SignOutButton'

function getPosterTitle(data: unknown) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return 'Affiche'
  }
  const record = data as Record<string, unknown>
  for (const key of ['titre', 'nom_evenement', 'nom_produit', 'nom_entreprise']) {
    if (typeof record[key] === 'string' && record[key].trim()) return record[key]
  }
  return 'Affiche'
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Chargement de votre espace…
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [account, posters, sites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, suspended: true },
    }),
    prisma.posterCreation.findMany({
      where: { userId: session.user.id },
      include: { template: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.clientSite.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        businessName: true,
        published: true,
        updatedAt: true,
      },
    }),
  ])

  const isAdmin = Boolean(account?.role === 'ADMIN' && !account.suspended)

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader
        activeNav="dashboard"
        user={{
          name: session.user.name,
          email: session.user.email,
          isAdmin,
        }}
        rightSlot={
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <SignOutButton />
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Espace personnel
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Bonjour {session.user.name ?? ''}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/templates"
              className={buttonClasses({ variant: 'outline', size: 'md' })}
            >
              Créer une affiche
            </Link>
            <Link
              href="/site/nouveau"
              className={buttonClasses({ variant: 'primary', size: 'md' })}
            >
              Créer un site
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight">Mes affiches</h2>
          {posters.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posters.map((poster) => (
                <Card key={poster.id}>
                  <CardContent>
                    <h3 className="font-semibold text-white">
                      {getPosterTitle(poster.data)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {poster.template.name}
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-slate-500">
                      Créée le {poster.createdAt.toLocaleDateString('fr-FR')}
                    </p>
                    <div className="mt-4">
                      <PosterDownloadButtons
                        creationId={poster.id}
                        templateId={poster.templateId}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-3">
              <CardContent className="text-sm text-slate-400">
                Vous n’avez pas encore d’affiches associées à ce compte.
              </CardContent>
            </Card>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Mes sites</h2>
          {sites.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <Card key={site.id}>
                  <CardContent>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white">
                        {site.businessName}
                      </h3>
                      <Badge variant={site.published ? 'success' : 'neutral'}>
                        {site.published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm tabular-nums text-slate-400">
                      Modifié le {site.updatedAt.toLocaleDateString('fr-FR')}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Link
                        href={`/${site.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClasses({ variant: 'outline', size: 'sm' })}
                      >
                        Voir le site
                      </Link>
                      <Link
                        href={`/site/${site.slug}/edit`}
                        className={buttonClasses({ variant: 'primary', size: 'sm' })}
                      >
                        Modifier
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-3">
              <CardContent className="text-sm text-slate-400">
                Vous n’avez pas encore de sites.{' '}
                <Link href="/site/nouveau" className="text-emerald-400 hover:underline">
                  Créez votre premier site.
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  )
}

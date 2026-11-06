import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">SOCIAL KIT</Link>
          <div className="flex items-center gap-4">
            {account?.role === 'ADMIN' && !account.suspended && (
              <Link href="/admin" className="text-sm text-emerald-400 hover:text-emerald-300">
                Administration
              </Link>
            )}
            <span className="hidden text-sm text-slate-400 sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Espace personnel
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">Bonjour {session.user.name ?? ''}</h1>
          </div>
          <Link
            href="/site/nouveau"
            className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Créer un site
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Mes affiches</h2>
          {posters.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posters.map((poster) => (
                <article key={poster.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <h3 className="font-semibold">{getPosterTitle(poster.data)}</h3>
                  <p className="mt-1 text-sm text-slate-400">{poster.template.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Créée le {poster.createdAt.toLocaleDateString('fr-FR')}
                  </p>
                  <div className="mt-4">
                    <PosterDownloadButtons
                      creationId={poster.id}
                      templateId={poster.templateId}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
              Vous n’avez pas encore d’affiches associées à ce compte.
            </p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Mes sites</h2>
          {sites.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <article key={site.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <h3 className="font-semibold">{site.businessName}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {site.published ? 'Publié' : 'Non publié'} · modifié le{' '}
                    {site.updatedAt.toLocaleDateString('fr-FR')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/${site.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
                    >
                      Voir le site
                    </Link>
                    <Link
                      href={`/site/${site.slug}/edit`}
                      className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      Modifier
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
              Vous n’avez pas encore de sites.{' '}
              <Link href="/site/nouveau" className="text-emerald-400 hover:underline">
                Créez votre premier site.
              </Link>
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

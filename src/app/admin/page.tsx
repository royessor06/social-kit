import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { AdminToggleButton } from './AdminToggleButton'

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Chargement de l’administration…
        </main>
      }
    >
      <AdminDashboard />
    </Suspense>
  )
}

async function AdminDashboard() {
  const access = await requireAdmin()
  if (!access.ok) {
    redirect(access.response.status === 401 ? '/login' : '/dashboard')
  }

  const [userCount, publishedSiteCount, posterCount, users, sites] =
    await Promise.all([
      prisma.user.count(),
      prisma.clientSite.count({ where: { published: true, suspended: false } }),
      prisma.posterCreation.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          suspended: true,
          createdAt: true,
          _count: { select: { clientSites: true } },
        },
      }),
      prisma.clientSite.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          slug: true,
          published: true,
          suspended: true,
          user: { select: { email: true } },
        },
      }),
    ])

  const stats = [
    { label: 'Total utilisateurs', value: userCount },
    { label: 'Sites publiés', value: publishedSiteCount },
    { label: 'Affiches générées', value: posterCount },
  ]

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">SOCIAL KIT</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/templates" className="text-emerald-400 hover:text-emerald-300">
              Gérer les modèles
            </Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white">
              Mon espace
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Vue d’ensemble</h1>

        <section aria-label="Statistiques" className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Utilisateurs</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full min-w-[760px] divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Rôle</th>
                  <th className="px-4 py-3 font-medium">Inscription</th>
                  <th className="px-4 py-3 font-medium">Sites</th>
                  <th className="px-4 py-3 font-medium">Compte</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {user.createdAt.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">{user._count.clientSites}</td>
                    <td className="px-4 py-3">
                      <span className={user.suspended ? 'text-amber-300' : 'text-emerald-300'}>
                        {user.suspended ? 'Suspendu' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.id === access.user.id ? (
                        <span className="text-xs text-slate-500">Compte courant</span>
                      ) : (
                        <AdminToggleButton
                          endpoint={`/api/admin/users/${user.id}`}
                          field="suspended"
                          value={user.suspended}
                          activeLabel="Réactiver"
                          inactiveLabel="Suspendre"
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Aucun utilisateur.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Sites</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full min-w-[760px] divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Propriétaire</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td className="px-4 py-3">{site.businessName}</td>
                    <td className="px-4 py-3 text-slate-400">/{site.slug}</td>
                    <td className="px-4 py-3 text-slate-400">{site.user?.email ?? 'Visiteur'}</td>
                    <td className="px-4 py-3">
                      <span className={site.suspended ? 'text-amber-300' : site.published ? 'text-emerald-300' : 'text-slate-400'}>
                        {site.suspended ? 'Suspendu' : site.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminToggleButton
                        endpoint={`/api/admin/sites/${site.id}`}
                        field="suspended"
                        value={site.suspended}
                        activeLabel="Réactiver"
                        inactiveLabel="Suspendre"
                      />
                    </td>
                  </tr>
                ))}
                {sites.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Aucun site.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

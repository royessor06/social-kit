import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { AdminToggleButton } from '../AdminToggleButton'

export default function AdminTemplatesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Chargement des modèles…
        </main>
      }
    >
      <AdminTemplates />
    </Suspense>
  )
}

async function AdminTemplates() {
  const access = await requireAdmin()
  if (!access.ok) {
    redirect(access.response.status === 401 ? '/login' : '/dashboard')
  }

  const [posters, sites] = await Promise.all([
    prisma.posterTemplate.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, category: true, active: true },
    }),
    prisma.siteTemplate.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, category: true, active: true },
    }),
  ])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-xl font-bold tracking-tight">SOCIAL KIT · ADMIN</Link>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white">← Administration</Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-extrabold">Modèles</h1>
        <TemplateTable
          title="Modèles d’affiches"
          kind="posters"
          templates={posters}
        />
        <TemplateTable
          title="Modèles de sites"
          kind="sites"
          templates={sites}
        />
      </div>
    </main>
  )
}

function TemplateTable({
  title,
  kind,
  templates,
}: {
  title: string
  kind: 'posters' | 'sites'
  templates: { id: string; name: string; category: string; active: boolean }[]
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[560px] divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-4 py-3">{template.name}</td>
                <td className="px-4 py-3 text-slate-400">{template.category}</td>
                <td className="px-4 py-3">
                  <span className={template.active ? 'text-emerald-300' : 'text-amber-300'}>
                    {template.active ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminToggleButton
                    endpoint={`/api/admin/templates/${kind}/${template.id}`}
                    field="active"
                    value={template.active}
                    activeLabel="Désactiver"
                    inactiveLabel="Activer"
                  />
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Aucun modèle.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

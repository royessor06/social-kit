import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getTemplates() {
  'use cache'
  return prisma.posterTemplate.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  })
}

export default async function TemplatesPage() {
 const templates = await getTemplates()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SOCIAL KIT
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← Accueil
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-extrabold">Bibliothèque de modèles</h1>
        <p className="mb-12 text-slate-400">
          Choisissez un modèle, personnalisez-le, téléchargez votre affiche.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/poster/${t.id}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-500"
            >
              <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-slate-800 text-4xl">
                🎨
              </div>
              <div className="text-sm font-medium text-emerald-400">{t.category}</div>
              <div className="mt-1 text-lg font-semibold group-hover:text-emerald-400">
                {t.name}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
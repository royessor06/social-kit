import { Palette } from 'lucide-react'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/AppHeader'
import { Card, CardContent } from '@/components/ui'
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
      <AppHeader activeNav="posters" />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Studio d’affiches
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Bibliothèque de modèles
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Choisissez un modèle, personnalisez-le et téléchargez votre affiche gratuitement.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Link key={t.id} href={`/poster/${t.id}`} className="group block">
              <Card interactive className="h-full overflow-hidden">
                <div className="flex h-44 items-center justify-center border-b border-slate-800 bg-slate-950 text-emerald-400 transition-colors group-hover:text-emerald-300">
                  <Palette className="h-10 w-10" aria-hidden="true" />
                </div>
                <CardContent>
                  <div className="text-xs font-medium text-emerald-300">
                    {t.category}
                  </div>
                  <div className="mt-1.5 text-lg font-semibold text-white transition-colors group-hover:text-emerald-300">
                    {t.name}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
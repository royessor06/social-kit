import Link from 'next/link'
import { Suspense } from 'react'
import { SiteBuilder } from './SiteBuilder'
import { prisma } from '@/lib/prisma'
import { getTemplateVariables } from '@/lib/template'

export default function NewSitePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SOCIAL KIT
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← Accueil
          </Link>
        </div>
      </header>
      <Suspense
        fallback={
          <p className="px-6 py-24 text-center text-slate-400">
            Chargement des modèles…
          </p>
        }
      >
        <SiteTemplateBuilder />
      </Suspense>
    </main>
  )
}

async function SiteTemplateBuilder() {
  const templates = await prisma.siteTemplate.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      category: true,
      variables: true,
    },
  })

  const options = templates.map((template) => ({
    id: template.id,
    name: template.name,
    category: template.category,
    variables: getTemplateVariables(template.variables),
  }))

  return options.length > 0 ? (
    <SiteBuilder templates={options} />
  ) : (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Aucun modèle de site disponible</h1>
      <p className="mt-4 text-slate-400">
        Lancez le seed de la base de données pour charger les modèles.
      </p>
    </section>
  )
}

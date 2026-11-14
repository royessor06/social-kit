import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/AppHeader'
import { buttonClasses } from '@/components/ui'

const steps = [
  {
    number: '01',
    title: 'Choisissez un modèle',
    description: 'Parcourez des modèles conçus pour les commerces, services et événements.',
  },
  {
    number: '02',
    title: 'Personnalisez',
    description: 'Ajoutez vos textes, vos couleurs et vos coordonnées avec un aperçu immédiat.',
  },
  {
    number: '03',
    title: 'Publiez ou téléchargez',
    description: 'Finalisez votre création et partagez votre affiche ou votre site en ligne.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader activeNav="home" />

      <section className="relative isolate overflow-hidden border-b border-white/5">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Vos idées, prêtes à rayonner
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Donnez une image forte à votre activité.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Créez des affiches professionnelles et des sites vitrines simplement,
              sans logiciel compliqué ni compétences en design.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/site/nouveau"
                className={buttonClasses({ variant: 'primary', size: 'lg' })}
              >
                <span>Créer un site vitrine</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/templates"
                className={buttonClasses({ variant: 'outline', size: 'lg' })}
              >
                Créer une affiche
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Gratuit pour les entrepreneurs, commerçants et prestataires.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6">
            <div className="rounded-xl border border-slate-800/80 bg-gradient-to-br from-emerald-400/12 via-slate-900 to-slate-950 p-7 sm:p-9">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-widest text-emerald-300">
                  Studio complet
                </span>
                <span>Affiches · Sites vitrines</span>
              </div>
              <div className="my-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Votre marque
                </p>
                <p className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                  Une belle idée mérite d’être vue.
                </p>
                <p className="mt-4 max-w-sm leading-7 text-slate-300">
                  Des créations cohérentes pour faire connaître vos produits et vos services.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-5 text-sm">
                <span className="text-slate-400">Simple. Rapide. À votre image.</span>
                <span className="font-semibold text-emerald-300">SOCIAL KIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Comment ça marche ?
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Du modèle au résultat en trois étapes.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-xl border border-slate-800 bg-slate-900/75 p-7">
              <span className="text-sm font-bold tabular-nums tracking-widest text-emerald-400">
                {step.number}
              </span>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="border-y border-slate-800/80 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Prêt à commencer ?
            </p>
            <h2 className="mt-2 text-2xl font-bold">Faites connaître votre activité.</h2>
          </div>
          <Link
            href="/site/nouveau"
            className={buttonClasses({ variant: 'primary', size: 'lg', className: 'w-fit' })}
          >
            Explorer les modèles de sites
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© SOCIAL KIT · Bénin, Afrique francophone</p>
        <nav id="contact-liens" aria-label="Liens légaux" className="flex gap-5">
          <Link href="/cgv" className="transition hover:text-slate-200">CGV</Link>
          <Link href="/mentions-legales" className="transition hover:text-slate-200">Mentions légales</Link>
        </nav>
      </footer>
    </main>
  )
}

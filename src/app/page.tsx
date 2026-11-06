import Link from 'next/link'

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
    title: 'Téléchargez',
    description: 'Finalisez votre création et récupérez un visuel prêt à partager.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:flex-nowrap md:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="SOCIAL KIT, accueil">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-sm font-black text-slate-950">
              SK
            </span>
            <span className="text-lg font-bold tracking-tight">SOCIAL KIT</span>
          </Link>
          <nav aria-label="Navigation principale" className="order-3 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-3 text-xs text-slate-300 md:order-none md:w-auto md:gap-7 md:border-0 md:pt-0 md:text-sm">
            <Link href="/" className="text-white">Accueil</Link>
            <Link href="/templates" className="transition hover:text-emerald-300">Templates</Link>
            <Link href="/tarifs" className="transition hover:text-emerald-300">Tarifs</Link>
            <a href="#contact" className="transition hover:text-emerald-300">Contact</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
            <Link href="/login" className="text-xs text-slate-300 transition hover:text-white sm:text-sm">
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-400 px-3 py-2 font-semibold text-slate-950 transition hover:bg-emerald-300 sm:px-4"
            >
              S’inscrire
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/5">
        <div className="absolute -right-36 -top-32 -z-10 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 sm:py-28 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Vos idées, prêtes à rayonner
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Donnez une image forte à votre activité.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Créez des affiches professionnelles et des sites vitrines simplement,
              sans logiciel compliqué ni compétences en design.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/templates"
                className="rounded-xl bg-emerald-400 px-6 py-3.5 text-center font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Découvrir les templates
              </Link>
              <Link
                href="/site/nouveau"
                className="rounded-xl border border-slate-700 px-6 py-3.5 text-center font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-white"
              >
                Créer un site vitrine
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-500">Pensé pour les entrepreneurs et commerçants.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-emerald-950/30 sm:p-6">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-400/15 via-slate-800 to-slate-900 p-7 sm:p-9">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold tracking-widest text-emerald-200">NOUVEAU</span>
                <span className="text-xs text-slate-400">APERÇU DE VOTRE CRÉATION</span>
              </div>
              <div className="my-12">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Votre marque</p>
                <p className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Une belle idée mérite d’être vue.</p>
                <p className="mt-4 max-w-sm leading-7 text-slate-300">Des créations cohérentes pour faire connaître vos produits et vos services.</p>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-5 text-sm">
                <span className="text-slate-400">Simple. Rapide. À votre image.</span>
                <span className="font-semibold text-emerald-300">SOCIAL KIT ↗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Comment ça marche ?</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Du modèle au résultat en trois étapes.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-white/10 bg-slate-900/60 p-7">
              <span className="text-sm font-bold tracking-widest text-emerald-300">{step.number}</span>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="border-y border-white/5 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Prêt à commencer ?</p>
            <h2 className="mt-2 text-2xl font-bold">Faites connaître votre activité.</h2>
          </div>
          <Link href="/templates" className="w-fit rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
            Explorer les modèles
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

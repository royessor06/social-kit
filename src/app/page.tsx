import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500" />
            <span className="text-xl font-bold tracking-tight">SOCIAL KIT</span>
          </div>
          <nav className="hidden gap-8 text-sm text-slate-400 sm:flex">
            <span className="cursor-default text-white">Accueil</span>
            <span className="cursor-default hover:text-white">Modèles</span>
            <Link href="/tarifs" className="hover:text-white">Tarifs</Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-slate-300 hover:text-white">
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-emerald-400">
          Create. Customize. Publish.
        </p>
        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Créez vos affiches et sites vitrines
          <br />
          <span className="text-emerald-400">sans être designer.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
          SOCIAL KIT permet aux commerçants, entrepreneurs et petites entreprises
          de créer des supports professionnels en quelques minutes. Choisissez un
          modèle, personnalisez, téléchargez.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/templates"
            className="rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Créer une affiche
          </Link>
          <Link
            href="/site/nouveau"
            className="rounded-xl border border-slate-700 px-8 py-4 text-base font-medium text-slate-300 transition hover:border-emerald-500 hover:text-white"
          >
            Créer un site vitrine
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Modèles prédéfinis',
              desc: 'Des affiches publicitaires prêtes à personnaliser pour votre activité.',
            },
            {
              title: 'Aperçu en direct',
              desc: 'Chaque modification s\'affiche instantanément. Aucune surprise.',
            },
            {
              title: 'Téléchargement immédiat',
              desc: 'Exportez votre affiche en PNG ou PDF après paiement.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-600">
        SOCIAL KIT — Bénin, Afrique francophone
      </footer>
    </main>
  )
}
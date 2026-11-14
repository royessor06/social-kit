import Link from 'next/link'
import { PLANS } from '@/lib/plans'

const planOrder = ['FREE', 'STARTER', 'BUSINESS', 'PREMIUM'] as const

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">SOCIAL KIT</Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white">← Accueil</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Offres
          </p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            Une formule pour chaque étape
          </h1>
          <p className="mt-4 text-slate-400">
            Les abonnements seront bientôt disponibles. En attendant, profitez de la création d’affiches gratuite.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {planOrder.map((key) => {
            const plan = PLANS[key]
            const paid = key !== 'FREE'
            return (
              <article
                key={key}
                className={`flex flex-col rounded-2xl border p-6 ${
                  key === 'BUSINESS'
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="mt-3 text-2xl font-extrabold">{plan.price}</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
                  <li>• {plan.posterPayment}</li>
                  <li>
                    • {plan.maxSites === 0
                      ? 'Aucun site vitrine inclus'
                      : `${plan.maxSites} site${plan.maxSites > 1 ? 's' : ''} vitrine${plan.maxSites > 1 ? 's' : ''}`}
                  </li>
                  {key === 'FREE' && <li>• Création de compte gratuite</li>}
                  {key === 'PREMIUM' && <li>• Jusqu’à 5 sites publiés</li>}
                  {plan.premiumTemplates && <li>• Accès aux futurs modèles premium</li>}
                </ul>
                {paid ? (
                  <span
                    aria-disabled="true"
                    className="mt-8 rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold text-slate-500"
                  >
                    Bientôt disponible
                  </span>
                ) : (
                  <Link
                    href="/register"
                    className="mt-8 rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                  >
                    Commencer gratuitement
                  </Link>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

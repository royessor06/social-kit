import Link from 'next/link'
import { Suspense } from 'react'
import { PLANS, type PlanKey } from '@/lib/plans'

export default function SubscriptionPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Chargement…
        </main>
      }
    >
      <SubscriptionPaymentContent searchParams={searchParams} />
    </Suspense>
  )
}

async function SubscriptionPaymentContent({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan: requestedPlan } = await searchParams
  const planKey: PlanKey | null =
    requestedPlan && Object.prototype.hasOwnProperty.call(PLANS, requestedPlan)
      ? requestedPlan as PlanKey
      : null
  const plan = planKey ? PLANS[planKey] : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Abonnements
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          {plan ? `Offre ${plan.name}` : 'Offre introuvable'}
        </h1>
        <p className="mt-4 text-slate-400">
          {plan
            ? 'Le paiement des abonnements sera bientôt disponible. Votre offre ne sera pas modifiée avant la confirmation du paiement.'
            : 'Sélectionnez une formule disponible sur la page des tarifs.'}
        </p>
        <Link
          href="/tarifs"
          className="mt-8 inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Voir les tarifs
        </Link>
      </section>
    </main>
  )
}

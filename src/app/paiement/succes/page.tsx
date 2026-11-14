import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DownloadPosterButton } from './DownloadPosterButton'

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    creationId?: string
    templateId?: string
    format?: string
  }>
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Vérification du paiement…
        </main>
      }
    >
      <PaymentResult searchParams={searchParams} />
    </Suspense>
  )
}

async function PaymentResult({
  searchParams,
}: {
  searchParams: Promise<{
    creationId?: string
    templateId?: string
    format?: string
  }>
}) {
  const { creationId, templateId, format } = await searchParams
  const session = await auth()
  const posterFormat = format === 'pdf' ? 'pdf' : 'png'
  const creation =
    creationId && templateId
      ? await prisma.posterCreation.findFirst({
          where: {
            id: creationId,
            templateId,
            ...(session?.user?.id ? { userId: session.user.id } : {}),
          },
          select: { paymentStatus: true, paid: true },
        })
      : null
  const isPaid = Boolean(creation?.paid && creation.paymentStatus === 'PAID')

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            isPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-300'
          }`}
        >
          {isPaid ? '✓' : '…'}
        </div>
        <h1 className="mt-5 text-3xl font-bold">
          {isPaid ? 'Paiement confirmé' : 'Paiement en attente'}
        </h1>
        <p className="mt-3 text-slate-400">
          {isPaid
            ? 'Votre affiche est prête à être téléchargée.'
            : creation
              ? 'La confirmation du paiement est en cours. Actualisez cette page dans quelques instants.'
              : 'Cette demande de paiement est introuvable ou ne correspond pas à votre compte.'}
        </p>
        <div className="mt-8">
          {isPaid && creationId && templateId ? (
            <DownloadPosterButton
              creationId={creationId}
              templateId={templateId}
              format={posterFormat}
            />
          ) : (
            <Link
              href="/templates"
              className="inline-flex rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-emerald-500 hover:text-white"
            >
              Retour aux modèles
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}

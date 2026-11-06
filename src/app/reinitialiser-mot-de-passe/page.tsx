import Link from 'next/link'
import { Suspense } from 'react'
import { ResetPasswordForm } from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <Link href="/" className="text-sm font-bold tracking-wide text-emerald-400">
          SOCIAL KIT
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Créer un nouveau mot de passe</h1>
        <p className="mb-8 mt-2 text-slate-400">
          Choisissez un mot de passe sécurisé pour votre compte.
        </p>
        <Suspense fallback={<p className="text-sm text-slate-400">Chargement…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  )
}

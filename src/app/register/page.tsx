import Link from 'next/link'
import { RegisterForm } from './RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <Link href="/" className="text-sm font-bold tracking-wide text-emerald-400">
          SOCIAL KIT
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Créer un compte</h1>
        <p className="mb-8 mt-2 text-slate-400">Retrouvez vos créations dans votre espace.</p>
        <RegisterForm />
      </section>
    </main>
  )
}

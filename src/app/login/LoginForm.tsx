'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Adresse e-mail ou mot de passe incorrect.')
      setIsSubmitting(false)
      return
    }
    router.replace('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block text-sm text-slate-300">
        Adresse e-mail
        <input
          required
          autoComplete="email"
          type="email"
          name="email"
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <label className="block text-sm text-slate-300">
        Mot de passe
        <input
          required
          autoComplete="current-password"
          type="password"
          name="password"
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
      <p className="text-center text-sm text-slate-400">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-emerald-400 hover:text-emerald-300">
          Créer un compte
        </Link>
      </p>
    </form>
  )
}

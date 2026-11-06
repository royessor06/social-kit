'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(result.error ?? 'La création du compte a échoué.')
      setIsSubmitting(false)
      return
    }

    const login = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
    if (login?.error) {
      setError('Compte créé, mais la connexion a échoué. Connectez-vous.')
      setIsSubmitting(false)
      return
    }
    router.replace('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block text-sm text-slate-300">
        Nom
        <input
          required
          maxLength={80}
          autoComplete="name"
          name="name"
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </label>
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
        Mot de passe (8 caractères minimum)
        <input
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
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
        {isSubmitting ? 'Création…' : 'Créer mon compte'}
      </button>
      <p className="text-center text-sm text-slate-400">
        Déjà inscrit ?{' '}
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
          Se connecter
        </Link>
      </p>
    </form>
  )
}

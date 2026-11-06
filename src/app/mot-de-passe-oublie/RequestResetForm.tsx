'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

export function RequestResetForm() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.get('email') }),
      })
      const result = (await response.json()) as { message?: string; error?: string }
      if (!response.ok) {
        setError(result.error ?? 'La demande n’a pas pu être traitée.')
      } else {
        setMessage(result.message ?? 'Vérifiez votre boîte e-mail.')
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
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
      {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {isSubmitting ? 'Envoi…' : 'Recevoir un lien'}
      </button>
      <p className="text-center text-sm text-slate-400">
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}

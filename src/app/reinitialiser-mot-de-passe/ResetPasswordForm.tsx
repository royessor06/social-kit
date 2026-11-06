'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
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
      const response = await fetch('/api/auth/password-reset/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.get('password'),
        }),
      })
      const result = (await response.json()) as { message?: string; error?: string }
      if (!response.ok) {
        setError(result.error ?? 'La réinitialisation a échoué.')
      } else {
        setMessage(result.message ?? 'Mot de passe modifié.')
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!token && (
        <p role="alert" className="text-sm text-red-300">
          Le lien est incomplet. Demandez un nouveau lien de réinitialisation.
        </p>
      )}
      <label className="block text-sm text-slate-300">
        Nouveau mot de passe (8 caractères minimum)
        <input
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          type="password"
          name="password"
          disabled={!token}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
      </label>
      {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button
        disabled={isSubmitting || !token}
        className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {isSubmitting ? 'Modification…' : 'Modifier mon mot de passe'}
      </button>
      <p className="text-center text-sm text-slate-400">
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}

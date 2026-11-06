'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminToggleButton({
  endpoint,
  field,
  value,
  activeLabel,
  inactiveLabel,
}: {
  endpoint: string
  field: 'active' | 'suspended'
  value: boolean
  activeLabel: string
  inactiveLabel: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function toggle() {
    setPending(true)
    setError('')
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !value }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(result.error ?? 'La modification a échoué')
      }
      router.refresh()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'La modification a échoué'
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className={`rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 ${
          value
            ? 'border border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-300'
            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
        }`}
      >
        {pending ? 'Enregistrement…' : value ? activeLabel : inactiveLabel}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  )
}

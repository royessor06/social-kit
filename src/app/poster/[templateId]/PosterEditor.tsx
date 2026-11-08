'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  FedaCheckoutButton,
  type FedaPayResponse,
  useFedaPayScript,
} from '@gajonedev/fedapay-react'

type VariableMeta = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'image'
  default: string
}

type CheckoutSession = {
  creationId: string
  transactionId: number
  amount: number
  publicKey: string
  mode: 'sandbox' | 'live'
}

export default function PosterEditor() {
  const params = useParams()
  const templateId = params.templateId as string

  const [variables, setVariables] = useState<VariableMeta[]>([])
  const [form, setForm] = useState<Record<string, string>>({})
  const [previewHtml, setPreviewHtml] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [format, setFormat] = useState<'png' | 'pdf'>('png')
  const { isLoaded: fedapayScriptLoaded, error: fedapayScriptError } =
    useFedaPayScript()

  // Charger les variables du template
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/poster/template/${templateId}`)
      if (!res.ok) return
      const data = await res.json()
      setVariables(data.variables)
      
      const initial: Record<string, string> = {}
      data.variables.forEach((v: VariableMeta) => {
        initial[v.key] = v.default
      })
      setForm(initial)
      setLoading(false)
    }
    load()
  }, [templateId])

  // Aperçu live
  useEffect(() => {
    if (Object.keys(form).length === 0) return
    const fetchPreview = async () => {
      const res = await fetch('/api/poster/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form, templateId }),
      })
      if (res.ok) setPreviewHtml(await res.text())
    }
    const timeout = setTimeout(fetchPreview, 150)
    return () => clearTimeout(timeout)
  }, [form, templateId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      alert("Erreur lors de l'upload")
      return
    }
    const { url } = await res.json()
    setForm((current) => ({ ...current, [key]: url }))
  }

  const handlePreparePayment = async () => {
    setIsPaying(true)
    setPaymentError('')
    try {
      const payRes = await fetch('/api/poster/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form, templateId, format }),
      })
      const result = (await payRes.json()) as {
        creationId?: string
        transactionId?: number
        amount?: number
        publicKey?: string
        mode?: 'sandbox' | 'live'
        error?: string
      }
      if (
        !payRes.ok ||
        !result.creationId ||
        !result.transactionId ||
        !result.amount ||
        !result.publicKey ||
        !result.mode
      ) {
        throw new Error(result.error ?? 'Le paiement a échoué')
      }
      setCheckout({
        creationId: result.creationId,
        transactionId: result.transactionId,
        amount: result.amount,
        publicKey: result.publicKey,
        mode: result.mode,
      })
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'Le paiement a échoué. Réessayez.'
      )
    } finally {
      setIsPaying(false)
    }
  }

  const handleCheckoutComplete = useCallback(async (response: FedaPayResponse) => {
    if (!checkout) return
    if (response.reason.toLowerCase().includes('dismiss')) {
      setPaymentError('La fenêtre de paiement a été fermée. Vous pouvez réessayer.')
      return
    }

    setIsPaying(true)
    setPaymentError('')
    try {
      const confirmation = await fetch('/api/poster/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creationId: checkout.creationId }),
      })
      const result = (await confirmation.json()) as { paid?: boolean; error?: string }
      if (!confirmation.ok || !result.paid) {
        throw new Error(result.error ?? 'Le paiement n’a pas encore été confirmé.')
      }

      const successUrl = new URL('/paiement/succes', window.location.origin)
      successUrl.searchParams.set('creationId', checkout.creationId)
      successUrl.searchParams.set('templateId', templateId)
      successUrl.searchParams.set('format', format)
      window.location.assign(successUrl.toString())
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : 'La vérification du paiement a échoué. Réessayez.'
      )
    } finally {
      setIsPaying(false)
    }
  }, [checkout, format, templateId])

  const checkoutOptions = useMemo(
    () =>
      checkout
        ? {
            public_key: checkout.publicKey,
            environment: checkout.mode,
            locale: 'fr' as const,
            transaction: {
              id: checkout.transactionId,
              amount: checkout.amount,
              description: 'Affiche SOCIAL KIT',
              custom_metadata: { creationId: checkout.creationId },
            },
            currency: { iso: 'XOF' },
            onComplete: handleCheckoutComplete,
          }
        : null,
    [checkout, handleCheckoutComplete]
  )

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Chargement du modèle…
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="w-96 overflow-y-auto border-r border-slate-800 p-6">
        <h2 className="mb-6 text-xl font-bold">Personnalisation</h2>
        <div className="space-y-4">
          {variables.map((v) => (
            <div key={v.key}>
              <label className="mb-1 block text-sm text-slate-400">
                {v.label}
              </label>

              {v.type === 'text' && (
                <input
                  type="text"
                  name={v.key}
                  value={form[v.key] || ''}
                  disabled={Boolean(checkout)}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              )}

              {v.type === 'textarea' && (
                <textarea
                  name={v.key}
                  value={form[v.key] || ''}
                  disabled={Boolean(checkout)}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              )}

              {v.type === 'color' && (
                <input
                  type="color"
                  name={v.key}
                  value={form[v.key] || '#000000'}
                  disabled={Boolean(checkout)}
                  onChange={handleChange}
                  className="h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
                />
              )}

              {v.type === 'image' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={Boolean(checkout)}
                    onChange={(e) => handleImageUpload(v.key, e)}
                    className="w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
                  />
                  {form[v.key] && (
                    <img
                      src={form[v.key]}
                      alt="Aperçu"
                      className="mt-2 h-20 w-20 rounded-lg border border-slate-700 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm text-slate-400">Format</label>
          <div className="flex gap-2">
            <button
              disabled={Boolean(checkout)}
              onClick={() => setFormat('png')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                format === 'png'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              PNG
            </button>
            <button
              disabled={Boolean(checkout)}
              onClick={() => setFormat('pdf')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                format === 'pdf'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              PDF
            </button>
          </div>
        </div>

        {checkout && checkoutOptions ? (
          <FedaCheckoutButton
            options={checkoutOptions}
            disabled={isPaying || !fedapayScriptLoaded || Boolean(fedapayScriptError)}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {isPaying
              ? 'Vérification du paiement…'
              : fedapayScriptError
                ? 'Paiement momentanément indisponible'
                : !fedapayScriptLoaded
                  ? 'Chargement de FedaPay…'
                  : `Payer ${checkout.amount} XOF`}
          </FedaCheckoutButton>
        ) : (
          <button
            onClick={handlePreparePayment}
            disabled={isPaying}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {isPaying ? 'Préparation…' : `Continuer vers le paiement (${format.toUpperCase()})`}
          </button>
        )}
        {paymentError && (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {paymentError}
          </p>
        )}
        {checkout && fedapayScriptError && (
          <p role="alert" className="mt-3 text-sm text-red-300">
            Le module de paiement FedaPay n’a pas pu être chargé. Actualisez la page pour réessayer.
          </p>
        )}
      </aside>

      <main className="flex flex-1 items-center justify-center bg-slate-900 p-8">
        {previewHtml ? (
          <div className="relative h-[540px] w-[540px] overflow-hidden rounded-xl border border-slate-700 shadow-2xl">
            <iframe
              srcDoc={previewHtml}
              className="absolute left-0 top-0 h-[1080px] w-[1080px] origin-top-left"
              style={{ transform: 'scale(0.5)' }}
              title="Aperçu de l'affiche"
              sandbox="allow-same-origin"
            />
          </div>
        ) : (
          <p className="text-slate-500">Chargement de l&apos;aperçu…</p>
        )}
      </main>
    </div>
  )
}
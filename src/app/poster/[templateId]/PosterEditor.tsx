'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

type VariableMeta = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'image'
  default: string
}

export default function PosterEditor() {
  const params = useParams()
  const templateId = params.templateId as string

  const [variables, setVariables] = useState<VariableMeta[]>([])
  const [form, setForm] = useState<Record<string, string>>({})
  const [previewHtml, setPreviewHtml] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [format, setFormat] = useState<'png' | 'pdf'>('png')

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

  const handlePayAndExport = async () => {
    setIsPaying(true)
    try {
      const payRes = await fetch('/api/poster/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form, templateId, format }),
      })
      const result = (await payRes.json()) as {
        payment_url?: string
        error?: string
      }
      if (!payRes.ok || !result.payment_url) {
        throw new Error(result.error ?? 'Le paiement a échoué')
      }
      window.location.href = result.payment_url
    } catch (error) {
      setIsPaying(false)
      alert(
        error instanceof Error
          ? error.message
          : 'Le paiement a échoué. Réessayez.'
      )
    }
  }

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
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              )}

              {v.type === 'textarea' && (
                <textarea
                  name={v.key}
                  value={form[v.key] || ''}
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
                  onChange={handleChange}
                  className="h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
                />
              )}

              {v.type === 'image' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
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

        <button
          onClick={handlePayAndExport}
          disabled={isPaying}
          className="mt-6 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPaying ? 'Traitement…' : `Payer et télécharger (${format.toUpperCase()})`}
        </button>
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
'use client'

import Image from 'next/image'
import Link from 'next/link'
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
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadingKey, setUploadingKey] = useState('')
  const [templateError, setTemplateError] = useState('')
  const [loading, setLoading] = useState(true)
  const [format, setFormat] = useState<'png' | 'pdf'>('png')

  // Charger les variables du template
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch(`/api/poster/template/${templateId}`)
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null
          if (active) {
            setTemplateError(payload?.error ?? 'Ce modèle est introuvable ou indisponible.')
          }
          return
        }
        const data = (await res.json()) as { variables?: VariableMeta[] }
        const loadedVars = Array.isArray(data.variables) ? data.variables : []
        const initial: Record<string, string> = {}
        loadedVars.forEach((v) => {
          initial[v.key] = v.default
        })
        if (active) {
          setVariables(loadedVars)
          setForm(initial)
          setTemplateError('')
        }
      } catch {
        if (active) {
          setTemplateError('Impossible de charger ce modèle pour le moment.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [templateId])

  // Aperçu live
  useEffect(() => {
    if (Object.keys(form).length === 0) return
    const controller = new AbortController()
    const fetchPreview = async () => {
      try {
        const res = await fetch('/api/poster/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: form, templateId }),
          signal: controller.signal,
        })
        if (res.ok) setPreviewHtml(await res.text())
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    const timeout = setTimeout(fetchPreview, 150)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
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

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (file.type && !allowedTypes.includes(file.type)) {
      setUploadError('Formats acceptés : PNG, JPEG et WebP.')
      e.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setUploadingKey(key)
    setUploadError('')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = (await res.json().catch(() => null)) as {
        url?: string
        error?: string
      } | null
      if (!res.ok || !result?.url) {
        throw new Error(result?.error ?? "Erreur lors de l'envoi de l'image.")
      }
      setForm((current) => ({ ...current, [key]: result.url as string }))
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'image."
      )
    } finally {
      setUploadingKey('')
      e.target.value = ''
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportError('')
    try {
      const createRes = await fetch('/api/poster/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form, templateId, format }),
      })
      const creation = (await createRes.json()) as {
        creationId?: string
        error?: string
      }
      if (!createRes.ok || !creation.creationId) {
        throw new Error(creation.error ?? 'Impossible de préparer cette affiche.')
      }

      const exportRes = await fetch('/api/poster/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creationId: creation.creationId, templateId, format }),
      })
      if (!exportRes.ok) {
        const result = (await exportRes.json()) as { error?: string }
        throw new Error(result.error ?? 'Le téléchargement a échoué.')
      }

      const url = URL.createObjectURL(await exportRes.blob())
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `affiche-${creation.creationId}.${format}`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : 'Le téléchargement a échoué. Réessayez.'
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Chargement du modèle…
      </main>
    )
  }

  if (templateError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-xl font-bold">Modèle indisponible</h1>
          <p role="alert" className="mt-3 text-sm text-red-300">
            {templateError}
          </p>
          <Link
            href="/templates"
            className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Retour aux modèles
          </Link>
        </section>
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
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleImageUpload(v.key, e)}
                    disabled={uploadingKey === v.key}
                    className="w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 disabled:opacity-50"
                  />
                  {uploadingKey === v.key && (
                    <p className="mt-1 text-xs text-slate-400">Envoi de l’image…</p>
                  )}
                  {form[v.key] && (
                    <Image
                      src={form[v.key]}
                      alt="Aperçu"
                      width={80}
                      height={80}
                      referrerPolicy="no-referrer"
                      className="mt-2 h-20 w-20 rounded-lg border border-slate-700 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {uploadError && (
          <p role="alert" className="mt-4 rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
            {uploadError}
          </p>
        )}

        <div className="mt-6">
          <label className="mb-2 block text-sm text-slate-400">Format</label>
          <div className="flex gap-2">
            <button
              type="button"
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
              type="button"
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
          type="button"
          onClick={handleExport}
          disabled={isExporting || Boolean(uploadingKey)}
          className="mt-6 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isExporting ? 'Préparation…' : 'Télécharger l’affiche'}
        </button>
        {exportError && (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {exportError}
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
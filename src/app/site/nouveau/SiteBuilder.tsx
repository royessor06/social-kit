'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { TemplateVariableMeta } from '@/lib/template'

type SiteTemplateOption = {
  id: string
  name: string
  category: string
  variables: TemplateVariableMeta[]
}

type SiteBuilderProps = {
  templates: SiteTemplateOption[]
  editSite?: {
    slug: string
    templateId: string
    formData: Record<string, string>
  }
}

function defaultValues(template: SiteTemplateOption) {
  return Object.fromEntries(
    template.variables.map((variable) => [variable.key, variable.default])
  )
}

export function SiteBuilder({ templates, editSite }: SiteBuilderProps) {
  const [templateId, setTemplateId] = useState(
    editSite?.templateId ?? templates[0]?.id ?? ''
  )
  const [form, setForm] = useState<Record<string, string>>(() =>
    editSite?.formData ?? (templates[0] ? defaultValues(templates[0]) : {})
  )
  const [previewHtml, setPreviewHtml] = useState('')
  const [error, setError] = useState('')
  const [uploadingKey, setUploadingKey] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const selectedTemplate = templates.find((template) => template.id === templateId)

  useEffect(() => {
    if (!selectedTemplate || Object.keys(form).length === 0) return

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/site/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId, formData: form }),
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Impossible de générer l’aperçu')
        }
        setPreviewHtml(await response.text())
        setError('')
      } catch (previewError) {
        if (previewError instanceof Error && previewError.name === 'AbortError') return
        setError('L’aperçu n’a pas pu être actualisé. Vérifiez vos champs et réessayez.')
      }
    }, 200)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [form, selectedTemplate, templateId])

  const handleTemplateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextTemplate = templates.find((template) => template.id === event.target.value)
    if (!nextTemplate) return

    setTemplateId(nextTemplate.id)
    setForm(defaultValues(nextTemplate))
    setPreviewHtml('')
    setError('')
  }

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleImageUpload = async (
    key: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append('file', file)
    setUploadingKey(key)
    setError('')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })
      const result = (await response.json()) as { url?: string; error?: string }
      const uploadedUrl = result.url
      if (!response.ok || !uploadedUrl) {
        throw new Error(result.error ?? 'L’envoi de l’image a échoué')
      }
      setForm((current) => ({ ...current, [key]: uploadedUrl }))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'L’envoi de l’image a échoué'
      )
    } finally {
      setUploadingKey('')
      event.target.value = ''
    }
  }

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTemplate) return

    setIsPublishing(true)
    setError('')
    try {
      const response = await fetch(
        editSite ? '/api/site/update' : '/api/site/publish',
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editSite ? { slug: editSite.slug } : {}),
          templateId,
          formData: form,
        }),
        }
      )
      const result = (await response.json()) as {
        url?: string
        error?: string
      }
      if (!response.ok || !result.url) {
        throw new Error(result.error ?? 'La publication a échoué')
      }
      window.location.assign(result.url)
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : 'La publication a échoué'
      )
      setIsPublishing(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Module B · Sites vitrines
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Créez votre site</h1>
        <p className="mt-2 text-slate-400">
          Choisissez un modèle, personnalisez-le et publiez votre adresse web.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <form
          onSubmit={handlePublish}
          className="max-h-[calc(100vh-190px)] space-y-5 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <div>
            <label htmlFor="site-template" className="mb-2 block text-sm font-medium">
              Modèle
            </label>
            <select
              id="site-template"
              value={templateId}
              onChange={handleTemplateChange}
              disabled={Boolean(editSite)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.category} · {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate?.variables.map((variable) => (
            <div key={variable.key}>
              <label
                htmlFor={`site-${variable.key}`}
                className="mb-1.5 block text-sm text-slate-300"
              >
                {variable.label}
              </label>
              {variable.type === 'textarea' ? (
                <textarea
                  id={`site-${variable.key}`}
                  name={variable.key}
                  rows={3}
                  maxLength={5000}
                  value={form[variable.key] ?? ''}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              ) : variable.type === 'color' ? (
                <input
                  id={`site-${variable.key}`}
                  name={variable.key}
                  type="color"
                  value={form[variable.key] ?? '#000000'}
                  onChange={handleFieldChange}
                  className="h-11 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-1"
                />
              ) : variable.type === 'image' ? (
                <div>
                  <input
                    id={`site-${variable.key}`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => handleImageUpload(variable.key, event)}
                    disabled={uploadingKey === variable.key}
                    className="w-full text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-white"
                  />
                  {uploadingKey === variable.key && (
                    <p className="mt-1 text-xs text-slate-400">Envoi de l’image…</p>
                  )}
                  {form[variable.key] && (
                    <p className="mt-1 text-xs text-emerald-400">Image ajoutée</p>
                  )}
                </div>
              ) : (
                <input
                  id={`site-${variable.key}`}
                  name={variable.key}
                  type="text"
                  maxLength={5000}
                  value={form[variable.key] ?? ''}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              )}
            </div>
          ))}

          {error && (
            <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPublishing || Boolean(uploadingKey)}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing
              ? editSite
                ? 'Enregistrement…'
                : 'Publication…'
              : editSite
                ? 'Enregistrer les modifications'
                : 'Publier mon site'}
          </button>
          <p className="text-center text-xs text-slate-500">
            {editSite
              ? 'Les modifications seront visibles immédiatement sur votre site.'
              : 'Votre site sera accessible publiquement après publication.'}
          </p>
        </form>

        <div className="min-h-[65vh] overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl">
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              title="Aperçu du site vitrine"
              sandbox=""
              className="h-[75vh] min-h-[600px] w-full border-0"
            />
          ) : (
            <div className="flex h-[75vh] min-h-[600px] items-center justify-center text-slate-500">
              Préparation de l’aperçu…
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

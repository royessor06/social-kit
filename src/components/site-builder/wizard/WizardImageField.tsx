'use client'

import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useId, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui'

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export function WizardImageField({
  label,
  hint,
  value,
  error,
  onChange,
  onUploadingChange,
  previewAlt = 'Aperçu de l’image importée',
  aspect = 'landscape',
}: {
  label: string
  hint?: string
  value: string
  error?: string
  onChange: (nextUrl: string) => void
  onUploadingChange?: (uploading: boolean) => void
  previewAlt?: string
  aspect?: 'square' | 'landscape'
}) {
  const inputId = useId()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const setUploadingState = (state: boolean) => {
    setIsUploading(state)
    onUploadingChange?.(state)
  }

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.has(file.type)) {
      setUploadError('Formats acceptés uniquement : PNG, JPEG ou WebP.')
      event.target.value = ''
      return
    }
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      setUploadError('L’image ne doit pas dépasser 5 Mo.')
      event.target.value = ''
      return
    }

    setUploadError('')
    setUploadingState(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !result.url) {
        throw new Error(result.error ?? 'L’envoi de l’image a échoué.')
      }
      onChange(result.url)
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'L’envoi de l’image a échoué.'
      )
    } finally {
      setUploadingState(false)
      event.target.value = ''
    }
  }

  const displayedError = uploadError || error

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
        {label}
      </label>

      {value ? (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 sm:flex-row sm:items-center">
          <div
            className={
              aspect === 'square'
                ? 'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-900'
                : 'relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-900'
            }
          >
            <Image
              src={value}
              alt={previewAlt}
              fill
              sizes="160px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-emerald-300">
                Image importée avec succès
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                PNG, JPEG ou WebP · max 5 Mo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor={inputId}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-400/70 hover:text-white"
              >
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Remplacer</span>
              </label>
              <Button
                variant="danger"
                size="sm"
                iconLeft={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => {
                  setUploadError('')
                  onChange('')
                }}
                disabled={isUploading}
              >
                Retirer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center transition-colors hover:border-emerald-400/60 hover:bg-slate-950"
        >
          {isUploading ? (
            <>
              <Loader2
                className="h-5 w-5 animate-spin text-emerald-400"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-slate-200">
                Envoi de l’image en cours…
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-200">
                Choisir une image sur votre appareil
              </span>
              <span className="text-xs text-slate-400">
                Formats PNG, JPEG ou WebP · 5 Mo maximum
              </span>
            </>
          )}
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="sr-only"
      />

      {hint && !displayedError && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {displayedError && (
        <p role="alert" className="text-xs text-red-300">
          {displayedError}
        </p>
      )}
    </div>
  )
}

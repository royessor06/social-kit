'use client'

import { useState } from 'react'

export function PosterDownloadButtons({
  creationId,
  templateId,
}: {
  creationId: string
  templateId: string
}) {
  const [downloading, setDownloading] = useState('')
  const [error, setError] = useState('')

  async function download(format: 'png' | 'pdf') {
    setDownloading(format)
    setError('')
    try {
      const response = await fetch('/api/poster/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creationId, templateId, format }),
      })
      if (!response.ok) {
        const result = (await response.json()) as { error?: string }
        throw new Error(result.error ?? 'Le téléchargement a échoué')
      }

      const url = URL.createObjectURL(await response.blob())
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `affiche-${creationId}.${format}`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'Le téléchargement a échoué'
      )
    } finally {
      setDownloading('')
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        {(['png', 'pdf'] as const).map((format) => (
          <button
            key={format}
            type="button"
            disabled={Boolean(downloading)}
            onClick={() => download(format)}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-50"
          >
            {downloading === format ? 'Préparation…' : `Télécharger ${format.toUpperCase()}`}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  )
}

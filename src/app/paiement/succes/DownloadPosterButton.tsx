'use client'

import { useState } from 'react'

export function DownloadPosterButton({
  creationId,
  templateId,
  format,
}: {
  creationId: string
  templateId: string
  format: 'png' | 'pdf'
}) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  async function download() {
    setDownloading(true)
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
      anchor.download = `affiche.${format}`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'Le téléchargement a échoué'
      )
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={downloading}
        className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {downloading ? 'Préparation…' : 'Télécharger mon affiche'}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  )
}

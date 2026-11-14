'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'

export function WizardHeader({
  templateName,
  categoryLabel,
  onExit,
  disabled = false,
}: {
  templateName: string
  categoryLabel: string
  onExit: () => void
  disabled?: boolean
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
          >
            SOCIAL KIT
          </Link>
          <span className="hidden text-slate-700 sm:inline" aria-hidden="true">
            /
          </span>
          <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
            <span className="truncate font-medium text-slate-200">
              {templateName}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="truncate text-slate-400">{categoryLabel}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          iconLeft={<ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onExit}
          disabled={disabled}
        >
          Retour aux modèles
        </Button>
      </div>
    </header>
  )
}

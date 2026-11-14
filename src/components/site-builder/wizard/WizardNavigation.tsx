'use client'

import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import type { WizardStepId } from '@/lib/site-builder/wizard'

export function WizardNavigation({
  currentStep,
  totalSteps = 6,
  isGenerating = false,
  isBusy = false,
  onPrevious,
  onNext,
  onGenerate,
}: {
  currentStep: WizardStepId
  totalSteps?: number
  isGenerating?: boolean
  isBusy?: boolean
  onPrevious: () => void
  onNext: () => void
  onGenerate: () => void
}) {
  const isFirstStep = currentStep === 1
  const isFinalStep = currentStep === totalSteps

  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {!isFirstStep && (
          <Button
            variant="outline"
            size="md"
            iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
            onClick={onPrevious}
            disabled={isGenerating || isBusy}
          >
            Précédent
          </Button>
        )}
        <p className="text-xs text-slate-400">
          <span className="text-emerald-400" aria-hidden="true">
            *
          </span>{' '}
          Champs obligatoires
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        {isFinalStep ? (
          <Button
            variant="primary"
            size="lg"
            loading={isGenerating}
            disabled={isBusy}
            iconLeft={<Sparkles className="h-4 w-4" aria-hidden="true" />}
            onClick={onGenerate}
          >
            {isGenerating ? 'Préparation de votre site…' : 'Générer mon site web'}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            disabled={isGenerating || isBusy}
            iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            onClick={onNext}
          >
            Continuer
          </Button>
        )}
      </div>
    </div>
  )
}

'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { WIZARD_STEPS, type WizardStepId } from '@/lib/site-builder/wizard'

export function WizardProgress({
  currentStep,
  maxVisitedStep,
  onSelectStep,
  stepErrorMap = {},
}: {
  currentStep: WizardStepId
  maxVisitedStep: WizardStepId
  onSelectStep: (step: WizardStepId) => void
  stepErrorMap?: Partial<Record<WizardStepId, boolean>>
}) {
  const activeStepMeta =
    WIZARD_STEPS.find((step) => step.id === currentStep) ?? WIZARD_STEPS[0]
  const progressPercent = Math.round((currentStep / WIZARD_STEPS.length) * 100)

  return (
    <div className="border-b border-slate-800/80 bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400 tabular-nums">
              Étape {activeStepMeta.id} sur {WIZARD_STEPS.length}
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {activeStepMeta.title}
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">
              {activeStepMeta.description}
            </p>
          </div>

          <div className="w-full lg:max-w-xs">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400 tabular-nums">
              <span>Progression</span>
              <span>{progressPercent}%</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progression de l’assistant : étape ${currentStep} sur ${WIZARD_STEPS.length}`}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <nav
          aria-label="Étapes de création"
          className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6"
        >
          {WIZARD_STEPS.map((step) => {
            const isCurrent = step.id === currentStep
            const isCompleted = step.id < currentStep
            const canNavigate = step.id <= maxVisitedStep && step.id !== currentStep
            const hasError = Boolean(stepErrorMap[step.id])

            return (
              <button
                key={step.id}
                type="button"
                disabled={!canNavigate}
                onClick={() => {
                  if (canNavigate) onSelectStep(step.id)
                }}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors whitespace-nowrap',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400',
                  isCurrent
                    ? 'border-emerald-400/70 bg-emerald-400/12 text-white'
                    : hasError
                      ? 'border-red-800/80 bg-red-950/40 text-red-200 hover:border-red-600'
                      : isCompleted
                        ? 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700'
                        : canNavigate
                          ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                          : 'cursor-default border-slate-800/60 bg-slate-950/60 text-slate-500'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums',
                    isCurrent
                      ? 'bg-emerald-400 text-slate-950'
                      : hasError
                        ? 'bg-red-900/80 text-red-100'
                        : isCompleted
                          ? 'bg-slate-800 text-emerald-300'
                          : 'bg-slate-900 text-slate-500'
                  )}
                >
                  {isCompleted && !hasError ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    step.id
                  )}
                </span>
                <span className="truncate font-medium">{step.shortTitle}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

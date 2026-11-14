'use client'

import { useCallback, useRef, useState } from 'react'
import { Alert, Button } from '@/components/ui'
import type { ResolvedSiteTemplate } from '@/lib/site-builder/templates'
import {
  createInitialWizardState,
  validateAllWizardSteps,
  validateWizardStep,
  type WizardFieldErrors,
  type WizardFormData,
  type WizardRetainedDraftData,
  type WizardStepId,
} from '@/lib/site-builder/wizard'
import { WizardHeader } from './WizardHeader'
import { WizardNavigation } from './WizardNavigation'
import { WizardProgress } from './WizardProgress'
import { BrandIdentityStep } from './steps/BrandIdentityStep'
import { BusinessInformationStep } from './steps/BusinessInformationStep'
import { ContactInformationStep } from './steps/ContactInformationStep'
import { HeroContentStep } from './steps/HeroContentStep'
import { ProductsServicesStep } from './steps/ProductsServicesStep'
import { ReviewStep } from './steps/ReviewStep'

export type WizardCompletionPayload = {
  templateId: string
  formData: Record<string, string>
  wizardData: WizardFormData
  retainedFields: WizardRetainedDraftData
  unappliedLabels: string[]
}

export function SiteWizard({
  template,
  isAuthenticated,
  initialData,
  onExit,
  onComplete,
}: {
  template: ResolvedSiteTemplate
  isAuthenticated: boolean
  initialData?: WizardFormData
  onExit: () => void
  onComplete: (payload: WizardCompletionPayload) => void
}) {
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1)
  const [maxVisitedStep, setMaxVisitedStep] = useState<WizardStepId>(
    initialData ? 6 : 1
  )
  const [wizardData, setWizardData] = useState<WizardFormData>(
    () => initialData ?? createInitialWizardState(template)
  )
  const [errors, setErrors] = useState<WizardFieldErrors>({})
  const [stepErrorMap, setStepErrorMap] = useState<
    Partial<Record<WizardStepId, boolean>>
  >({})
  const [globalError, setGlobalError] = useState('')
  const [uploadingCount, setUploadingCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasEnteredContent = Boolean(
    wizardData.businessName.trim() ||
      wizardData.slogan.trim() ||
      wizardData.shortDescription.trim() ||
      wizardData.heroTitle.trim() ||
      wizardData.heroImageUrl ||
      wizardData.logoUrl ||
      wizardData.items.length > 0 ||
      wizardData.phone.trim() ||
      wizardData.whatsapp.trim()
  )

  const handlePatch = useCallback((patch: Partial<WizardFormData>) => {
    setWizardData((current) => ({ ...current, ...patch }))
    setGlobalError('')
    setConfirmExit(false)

    const patchedKeys = Object.keys(patch)
    if (patchedKeys.length > 0) {
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors }
        let changed = false
        for (const key of Object.keys(nextErrors)) {
          if (
            patchedKeys.some(
              (patchedKey) =>
                key === patchedKey || key.startsWith(`${patchedKey}.`)
            )
          ) {
            delete nextErrors[key]
            changed = true
          }
        }
        return changed ? nextErrors : currentErrors
      })
    }
  }, [])

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setUploadingCount((count) => Math.max(0, count + (uploading ? 1 : -1)))
  }, [])

  const goToStep = (targetStep: WizardStepId) => {
    setGlobalError('')
    setErrors({})
    setCurrentStep(targetStep)
    scrollToTop()
  }

  const handleNext = () => {
    if (uploadingCount > 0) {
      setGlobalError('Patientez quelques secondes pendant l’envoi de votre image.')
      return
    }

    const stepErrors = validateWizardStep(currentStep, wizardData, template)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      setStepErrorMap((current) => ({ ...current, [currentStep]: true }))
      setGlobalError(
        'Vérifiez les champs indiqués ci-dessous avant de continuer.'
      )
      scrollToTop()
      return
    }

    setErrors({})
    setStepErrorMap((current) => ({ ...current, [currentStep]: false }))
    setGlobalError('')

    const nextStep = Math.min(6, currentStep + 1) as WizardStepId
    setCurrentStep(nextStep)
    setMaxVisitedStep((prev) => (nextStep > prev ? nextStep : prev))
    scrollToTop()
  }

  const handlePrevious = () => {
    setErrors({})
    setGlobalError('')
    const previousStep = Math.max(1, currentStep - 1) as WizardStepId
    setCurrentStep(previousStep)
    scrollToTop()
  }

  const handleRequestExit = () => {
    if (hasEnteredContent && !confirmExit) {
      setConfirmExit(true)
      scrollToTop()
      return
    }
    onExit()
  }

  const handleGenerate = async () => {
    if (isGenerating || uploadingCount > 0) return

    const validation = validateAllWizardSteps(wizardData, template)
    if (!validation.valid) {
      const firstBadStep = (
        [1, 2, 3, 4, 5] as const
      ).find((stepId) => Boolean(validation.stepErrors[stepId]))

      const nextErrorMap: Partial<Record<WizardStepId, boolean>> = {}
      for (const stepId of [1, 2, 3, 4, 5] as const) {
        nextErrorMap[stepId] = Boolean(validation.stepErrors[stepId])
      }
      setStepErrorMap(nextErrorMap)

      if (firstBadStep) {
        setCurrentStep(firstBadStep)
        setErrors(validation.stepErrors[firstBadStep] ?? {})
      } else {
        setErrors(validation.errors)
      }
      setGlobalError(
        'Certaines informations demandées sont incomplètes ou invalides.'
      )
      scrollToTop()
      return
    }

    setIsGenerating(true)
    setGlobalError('')

    try {
      const response = await fetch('/api/site/wizard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          wizardData,
        }),
      })

      const result = (await response.json()) as {
        templateId?: string
        formData?: Record<string, string>
        retainedFields?: WizardRetainedDraftData
        unappliedLabels?: string[]
        error?: string
        errors?: WizardFieldErrors
        stepErrors?: Partial<Record<WizardStepId, WizardFieldErrors>>
      }

      if (!response.ok || !result.formData || !result.templateId) {
        if (result.stepErrors) {
          const nextErrorMap: Partial<Record<WizardStepId, boolean>> = {}
          for (const stepId of [1, 2, 3, 4, 5] as const) {
            nextErrorMap[stepId] = Boolean(result.stepErrors[stepId])
          }
          setStepErrorMap(nextErrorMap)

          const firstBadStep = ([1, 2, 3, 4, 5] as const).find((stepId) =>
            Boolean(result.stepErrors?.[stepId])
          )
          if (firstBadStep) {
            setCurrentStep(firstBadStep)
            setErrors(result.stepErrors[firstBadStep] ?? {})
          }
        } else if (result.errors) {
          setErrors(result.errors)
        }
        throw new Error(
          result.error ?? 'Impossible de préparer la configuration du site.'
        )
      }

      onComplete({
        templateId: result.templateId,
        formData: result.formData,
        wizardData,
        retainedFields: result.retainedFields ?? {},
        unappliedLabels: result.unappliedLabels ?? [],
      })
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue pendant la préparation de votre site.'
      )
      setIsGenerating(false)
      scrollToTop()
    }
  }

  return (
    <div ref={topRef} className="min-h-screen bg-slate-950 text-white">
      <WizardHeader
        templateName={template.name}
        categoryLabel={template.categoryLabel}
        onExit={handleRequestExit}
        disabled={isGenerating}
      />

      <WizardProgress
        currentStep={currentStep}
        maxVisitedStep={maxVisitedStep}
        stepErrorMap={stepErrorMap}
        onSelectStep={goToStep}
      />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {confirmExit && (
          <div className="mb-6">
            <Alert
              variant="warning"
              title="Quitter l’assistant de création ?"
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmExit(false)}
                  >
                    Continuer l’assistant
                  </Button>
                  <Button variant="danger" size="sm" onClick={onExit}>
                    Quitter vers les modèles
                  </Button>
                </div>
              }
            >
              Vos réponses saisies dans cet assistant ne sont pas enregistrées sur votre
              compte tant que vous n’avez pas généré et publié votre site.
            </Alert>
          </div>
        )}

        {globalError && (
          <div className="mb-6">
            <Alert variant="error">{globalError}</Alert>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8">
          {currentStep === 1 && (
            <BusinessInformationStep
              template={template}
              data={wizardData}
              errors={errors}
              onChange={handlePatch}
            />
          )}

          {currentStep === 2 && (
            <BrandIdentityStep
              template={template}
              data={wizardData}
              errors={errors}
              onChange={handlePatch}
              onUploadingChange={handleUploadingChange}
            />
          )}

          {currentStep === 3 && (
            <HeroContentStep
              template={template}
              data={wizardData}
              errors={errors}
              onChange={handlePatch}
              onUploadingChange={handleUploadingChange}
            />
          )}

          {currentStep === 4 && (
            <ProductsServicesStep
              template={template}
              data={wizardData}
              errors={errors}
              onChange={handlePatch}
              onUploadingChange={handleUploadingChange}
            />
          )}

          {currentStep === 5 && (
            <ContactInformationStep
              template={template}
              data={wizardData}
              errors={errors}
              onChange={handlePatch}
            />
          )}

          {currentStep === 6 && (
            <ReviewStep
              template={template}
              data={wizardData}
              isAuthenticated={isAuthenticated}
              onEditStep={goToStep}
            />
          )}

          <WizardNavigation
            currentStep={currentStep}
            isGenerating={isGenerating}
            isBusy={uploadingCount > 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onGenerate={handleGenerate}
          />
        </div>
      </section>
    </div>
  )
}

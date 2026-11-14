'use client'

import { Monitor, Pencil, Smartphone } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, LoadingState } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { ResolvedSiteTemplate } from '@/lib/site-builder/templates'
import {
  WIZARD_MOODS,
  WIZARD_TYPOGRAPHY_PRESETS,
  getWizardTemplateGuidance,
  transformWizardData,
  type WizardFormData,
  type WizardStepId,
} from '@/lib/site-builder/wizard'

function ReviewSection({
  title,
  stepId,
  onEditStep,
  children,
}: {
  title: string
  stepId?: WizardStepId
  onEditStep: (step: WizardStepId) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {stepId && (
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => onEditStep(stepId)}
          >
            Modifier
          </Button>
        )}
      </div>
      <div className="mt-3.5 text-sm text-slate-300">{children}</div>
    </div>
  )
}

export function ReviewStep({
  template,
  data,
  isAuthenticated,
  onEditStep,
}: {
  template: ResolvedSiteTemplate
  data: WizardFormData
  isAuthenticated: boolean
  onEditStep: (step: WizardStepId) => void
}) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(true)
  const [previewError, setPreviewError] = useState('')

  const guidance = useMemo(() => getWizardTemplateGuidance(template), [template])
  const { templateFormData, unappliedLabels } = useMemo(
    () => transformWizardData(data, template),
    [data, template]
  )
  const activeMood =
    WIZARD_MOODS.find((mood) => mood.id === data.mood)?.label ?? data.mood
  const activeTypography =
    WIZARD_TYPOGRAPHY_PRESETS.find((preset) => preset.id === data.typographyId)
      ?.label ?? data.typographyId

  const activeItems = data.items.filter((item) => item.name.trim().length > 0)
  const activeSocials = (
    [
      ['Facebook', data.socialLinks.facebook],
      ['Instagram', data.socialLinks.instagram],
      ['LinkedIn', data.socialLinks.linkedin],
      ['Site web', data.socialLinks.website],
    ] as const
  ).filter(([, url]) => Boolean(url.trim()))

  useEffect(() => {
    const controller = new AbortController()

    async function loadPreview() {
      setPreviewLoading(true)
      setPreviewError('')
      try {
        const response = await fetch('/api/site/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: template.id,
            formData: templateFormData,
          }),
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Aperçu momentanément indisponible')
        }
        setPreviewHtml(await response.text())
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setPreviewError(
          'L’aperçu en direct n’a pas pu être chargé (vérifiez la base de données), mais vous pouvez poursuivre.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setPreviewLoading(false)
        }
      }
    }

    void loadPreview()
    return () => controller.abort()
  }, [template.id, templateFormData])

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_480px]">
      <div className="space-y-4">
        <Alert variant="info">
          Cliquer sur <strong>« Générer mon site web »</strong> prépare votre site dans
          l’éditeur avec vos informations compatibles préremplies.{' '}
          <strong>Votre site ne sera pas publié automatiquement</strong> : vous
          garderez le contrôle total avant de le mettre en ligne.
        </Alert>

        {unappliedLabels.length > 0 && (
          <Alert variant="info" title="Options non appliquées par ce modèle v1">
            Les éléments suivants restent conservés dans votre session de l’assistant
            si vous revenez en arrière, mais ne sont pas encore affichés par le modèle{' '}
            <strong>{template.name}</strong> ni enregistrés en base à la publication :{' '}
            <span className="text-slate-100">{unappliedLabels.join(' · ')}</span>.
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert variant="warning">
            Vous n’êtes pas actuellement connecté(e). Vous pouvez préparer et prévisualiser
            votre site maintenant ; une connexion à votre compte SOCIAL KIT vous sera
            demandée au moment de la publication finale.
          </Alert>
        )}

        <ReviewSection title="Modèle sélectionné" onEditStep={onEditStep}>
          <p className="font-medium text-white">
            {template.name}{' '}
            <span className="font-normal text-slate-400">
              · {template.categoryLabel} · {template.defaultTheme.styleName}
            </span>
          </p>
        </ReviewSection>

        <ReviewSection
          title="1. Identité de l’entreprise"
          stepId={1}
          onEditStep={onEditStep}
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Nom de l’entreprise</dt>
              <dd className="font-medium text-white">
                {data.businessName.trim() || 'Non renseigné'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Secteur · Type</dt>
              <dd>
                <span>{data.sector.trim() || 'Non renseigné'}</span>
                {data.activityType.trim() && (
                  <span className="text-slate-400">
                    {' · '}
                    {data.activityType.trim()} (non appliqué sur ce modèle v1)
                  </span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Slogan</dt>
              <dd>{data.slogan.trim() || 'Non renseigné'}</dd>
            </div>
            {data.shortDescription.trim() && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Description</dt>
                <dd className="leading-relaxed text-slate-300">
                  {data.shortDescription.trim()}
                </dd>
              </div>
            )}
          </dl>
        </ReviewSection>

        <ReviewSection
          title="2. Identité visuelle"
          stepId={2}
          onEditStep={onEditStep}
        >
          <div className="flex flex-wrap items-center gap-4">
            {data.logoUrl ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                <Image
                  src={data.logoUrl}
                  alt="Logo"
                  fill
                  sizes="48px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span
                  className="inline-block h-3.5 w-3.5 rounded-sm border border-white/20"
                  style={{ backgroundColor: data.primaryColor }}
                  aria-hidden="true"
                />
                <span className="font-mono">{data.primaryColor}</span>
                {!template.capabilities.supportsSecondaryColor ? (
                  <span className="text-slate-400">
                    · Couleur secondaire fixe ({template.defaultTheme.palette.secondary})
                  </span>
                ) : (
                  <>
                    <span aria-hidden="true">·</span>
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-sm border border-white/20"
                      style={{ backgroundColor: data.secondaryColor }}
                      aria-hidden="true"
                    />
                    <span className="font-mono">{data.secondaryColor}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {activeTypography} · Ambiance {activeMood}
                {(!template.capabilities.supportsCustomTypography ||
                  !template.capabilities.supportsVisualMood) &&
                  ' (réglages fixes du modèle v1)'}
              </p>
              {data.logoUrl && !template.capabilities.supportsLogo && (
                <p className="text-xs text-slate-400">
                  Logo importé (conservé dans l’assistant, non affiché sur ce modèle v1)
                </p>
              )}
            </div>
          </div>
        </ReviewSection>

        <ReviewSection
          title="3. Présentation"
          stepId={3}
          onEditStep={onEditStep}
        >
          <dl className="space-y-2.5">
            <div>
              <dt className="text-xs text-slate-500">Titre principal</dt>
              <dd className="font-medium text-white">
                {data.heroTitle.trim() || 'Non renseigné'}
              </dd>
            </div>
            {(data.heroText.trim() || data.shortDescription.trim()) && (
              <div>
                <dt className="text-xs text-slate-500">Texte d’accroche</dt>
                <dd className="text-slate-300">
                  {data.heroText.trim() || data.shortDescription.trim()}
                </dd>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span>
                Bouton d’action :{' '}
                <strong className="text-slate-200">
                  {template.capabilities.supportsCustomCta
                    ? data.ctaLabel.trim() || guidance.defaultCtaLabel
                    : guidance.defaultCtaLabel}
                </strong>
                {!template.capabilities.supportsCustomCta && ' (fixe sur ce modèle v1)'}
              </span>
              {data.heroImageUrl ? (
                <span className="text-emerald-300">Photo principale importée</span>
              ) : (
                <span>Sans photo principale</span>
              )}
            </div>
          </dl>
        </ReviewSection>

        <ReviewSection
          title={`4. ${guidance.sectionHeadingLabel}`}
          stepId={4}
          onEditStep={onEditStep}
        >
          {activeItems.length === 0 ? (
            <p className="text-xs text-slate-400">
              Aucun élément ajouté pour le moment (vous pourrez en ajouter ensuite dans
              l’éditeur).
            </p>
          ) : (
            <ul className="space-y-2.5">
              {activeItems.map((item, idx) => (
                <li
                  key={item.id}
                  className="border-b border-slate-800/70 pb-2 last:border-0 last:pb-0"
                >
                  <p className="font-medium text-white">
                    <span className="mr-2 tabular-nums text-emerald-400">
                      0{idx + 1}
                    </span>
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ReviewSection>

        <ReviewSection
          title="5. Coordonnées et contact"
          stepId={5}
          onEditStep={onEditStep}
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Téléphone</dt>
              <dd>{data.phone.trim() || 'Non renseigné'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">WhatsApp</dt>
              <dd>
                {data.whatsapp.trim() ? (
                  <>
                    <span>{data.whatsapp.trim()}</span>
                    {!template.capabilities.supportsWhatsApp && (
                      <span className="block text-xs text-slate-400">
                        Conservé dans l’assistant, non affiché sur ce modèle v1
                      </span>
                    )}
                  </>
                ) : (
                  'Non renseigné'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Adresse</dt>
              <dd>
                {[data.address.trim(), data.city.trim()].filter(Boolean).join(', ') ||
                  'Non renseignée'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Horaires</dt>
              <dd className="whitespace-pre-line">
                {data.openingHours.trim() || 'Non renseignés'}
              </dd>
            </div>
            {data.email.trim() && (
              <div>
                <dt className="text-xs text-slate-500">E-mail</dt>
                <dd>
                  <span>{data.email.trim()}</span>
                  {!template.capabilities.supportsEmail && (
                    <span className="block text-xs text-slate-400">
                      Conservé dans l’assistant, non affiché sur ce modèle v1
                    </span>
                  )}
                </dd>
              </div>
            )}
            {activeSocials.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">
                  Réseaux & liens
                  {!template.capabilities.supportsSocialLinks &&
                    ' (conservés dans l’assistant, non affichés sur ce modèle v1)'}
                </dt>
                <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-300">
                  {activeSocials.map(([label, url]) => (
                    <span key={label}>
                      {label} : {url}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </ReviewSection>
      </div>

      <aside className="h-fit rounded-xl border border-slate-800 bg-slate-900/75 p-4">
        <div className="flex items-center justify-between gap-2 pb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Prévisualisation du site
          </p>
          <div
            role="group"
            aria-label="Format de prévisualisation"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1"
          >
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              aria-pressed={previewDevice === 'desktop'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                previewDevice === 'desktop'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ordinateur</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              aria-pressed={previewDevice === 'mobile'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                previewDevice === 'mobile'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
          {previewLoading ? (
            <LoadingState label="Rendu de votre aperçu…" className="min-h-[420px]" />
          ) : previewError ? (
            <div className="flex min-h-[300px] items-center justify-center p-4 text-center text-xs leading-5 text-slate-400">
              {previewError}
            </div>
          ) : (
            <div
              className={cn(
                'overflow-hidden rounded-lg bg-white transition-all duration-200',
                previewDevice === 'mobile' ? 'w-[360px] max-w-full' : 'w-full'
              )}
            >
              <iframe
                srcDoc={previewHtml}
                title="Aperçu du site généré"
                sandbox=""
                className="h-[520px] w-full border-0"
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

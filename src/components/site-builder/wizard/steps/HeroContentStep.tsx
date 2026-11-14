'use client'

import { Lightbulb } from 'lucide-react'
import { Alert, Input, Select, Textarea } from '@/components/ui'
import type { ResolvedSiteTemplate } from '@/lib/site-builder/templates'
import {
  getWizardTemplateGuidance,
  type WizardCtaDestination,
  type WizardFieldErrors,
  type WizardFormData,
} from '@/lib/site-builder/wizard'
import { WizardImageField } from '../WizardImageField'

const CTA_DESTINATION_OPTIONS: { value: WizardCtaDestination; label: string }[] = [
  { value: 'contact', label: 'Section Contact & Coordonnées' },
  { value: 'catalogue', label: 'Section Services / Produits' },
  { value: 'whatsapp', label: 'Conversation WhatsApp' },
  { value: 'telephone', label: 'Appel téléphonique' },
]

export function HeroContentStep({
  template,
  data,
  errors,
  onChange,
  onUploadingChange,
}: {
  template: ResolvedSiteTemplate
  data: WizardFormData
  errors: WizardFieldErrors
  onChange: (patch: Partial<WizardFormData>) => void
  onUploadingChange: (uploading: boolean) => void
}) {
  const guidance = getWizardTemplateGuidance(template)
  const supportsCustomCta = template.capabilities.supportsCustomCta

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Input
          label="Titre principal du site"
          required
          maxLength={140}
          value={data.heroTitle}
          placeholder={guidance.heroTitlePlaceholder}
          error={errors.heroTitle}
          hint="C’est le premier message que vos visiteurs lisent en haut de votre page."
          onChange={(event) => onChange({ heroTitle: event.target.value })}
        />

        <Textarea
          label="Texte de présentation"
          rows={4}
          maxLength={800}
          value={data.heroText}
          placeholder={guidance.heroTextPlaceholder}
          error={errors.heroText}
          hint="Si vous le laissez vide, votre description courte sera reprise automatiquement."
          onChange={(event) => onChange({ heroText: event.target.value })}
        />

        {template.capabilities.supportsHeroImage && (
          <WizardImageField
            label="Image principale ou photo de couverture (facultatif)"
            hint="Une photo réelle de votre établissement, vos produits ou votre équipe renforce immédiatement la confiance."
            value={data.heroImageUrl}
            error={errors.heroImageUrl}
            aspect="landscape"
            previewAlt="Image principale de votre site"
            onChange={(heroImageUrl) => onChange({ heroImageUrl })}
            onUploadingChange={onUploadingChange}
          />
        )}

        <div className="space-y-4 border-t border-slate-800 pt-5">
          {!supportsCustomCta && (
            <Alert variant="info">
              Le bouton d’action du modèle <strong>{template.name}</strong> («{' '}
              {guidance.defaultCtaLabel} ») est fixe dans cette version et ne peut pas
              encore être personnalisé.
            </Alert>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Texte du bouton d’action"
              maxLength={60}
              value={supportsCustomCta ? data.ctaLabel : guidance.defaultCtaLabel}
              placeholder={guidance.defaultCtaLabel}
              error={errors.ctaLabel}
              disabled={!supportsCustomCta}
              hint={
                supportsCustomCta
                  ? 'Ex. Réserver une table, Voir la sélection, Demander un devis.'
                  : 'Libellé fixe défini par ce modèle.'
              }
              onChange={(event) => onChange({ ctaLabel: event.target.value })}
            />

            <Select
              label="Destination du bouton"
              value={supportsCustomCta ? data.ctaDestination : guidance.defaultCtaDestination}
              disabled={!supportsCustomCta}
              hint={
                supportsCustomCta
                  ? 'Indique vers quelle action orienter le visiteur.'
                  : 'Destination fixe définie par ce modèle.'
              }
              onChange={(event) =>
                onChange({
                  ctaDestination: event.target.value as WizardCtaDestination,
                })
              }
            >
              {CTA_DESTINATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-slate-800 bg-slate-900/75 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Idées de titres pour « {template.name} »</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Cliquez sur une suggestion pour l’insérer dans votre titre principal, puis
          adaptez-la librement à votre entreprise.
        </p>

        <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
          {guidance.heroExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onChange({ heroTitle: example })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-left text-xs leading-5 text-slate-200 transition-colors hover:border-emerald-400/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              « {example} »
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}

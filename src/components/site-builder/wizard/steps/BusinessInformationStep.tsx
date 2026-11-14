'use client'

import { Lightbulb } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'
import { createSiteSlug } from '@/lib/site'
import type { ResolvedSiteTemplate } from '@/lib/site-builder/templates'
import {
  getWizardTemplateGuidance,
  type WizardFieldErrors,
  type WizardFormData,
} from '@/lib/site-builder/wizard'

export function BusinessInformationStep({
  template,
  data,
  errors,
  onChange,
}: {
  template: ResolvedSiteTemplate
  data: WizardFormData
  errors: WizardFieldErrors
  onChange: (patch: Partial<WizardFormData>) => void
}) {
  const guidance = getWizardTemplateGuidance(template)
  const slugPreview = data.businessName.trim()
    ? createSiteSlug(data.businessName.trim())
    : ''

  const applyExample = () => {
    onChange({
      businessName: guidance.businessExample.businessName,
      activityType: guidance.businessExample.activityType,
      slogan: guidance.businessExample.slogan,
      shortDescription: guidance.businessExample.shortDescription,
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Nom de l’entreprise"
            required
            maxLength={80}
            value={data.businessName}
            placeholder={guidance.namePlaceholder}
            error={errors.businessName}
            hint={
              slugPreview
                ? `Adresse web prévue : socialkit.app/${slugPreview}`
                : 'Utilisé pour le titre et l’adresse de votre site.'
            }
            onChange={(event) => onChange({ businessName: event.target.value })}
          />

          <Input
            label="Secteur d’activité"
            required
            maxLength={80}
            value={data.sector}
            placeholder={template.categoryLabel}
            error={errors.sector}
            hint="Prérempli selon le modèle choisi, modifiable librement."
            onChange={(event) => onChange({ sector: event.target.value })}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Type d’activité"
            maxLength={100}
            value={data.activityType}
            placeholder={guidance.activityTypePlaceholder}
            error={errors.activityType}
            hint="Précisez votre spécialité pour vos clients."
            onChange={(event) => onChange({ activityType: event.target.value })}
          />

          <Input
            label="Slogan"
            maxLength={140}
            value={data.slogan}
            placeholder={guidance.sloganPlaceholder}
            error={errors.slogan}
            hint="Une phrase courte qui résume votre promesse."
            onChange={(event) => onChange({ slogan: event.target.value })}
          />
        </div>

        <Textarea
          label="Description courte de l’entreprise"
          rows={4}
          maxLength={500}
          value={data.shortDescription}
          placeholder={guidance.descriptionPlaceholder}
          error={errors.shortDescription}
          hint="Expliquez en 2 à 3 phrases ce que vous proposez et à qui vous vous adressez."
          onChange={(event) => onChange({ shortDescription: event.target.value })}
        />
      </div>

      <aside className="h-fit rounded-xl border border-slate-800 bg-slate-900/75 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Exemple de saisie</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Besoin d’inspiration ? Cliquez ci-dessous pour tester avec un exemple adapté
          au secteur « {template.categoryLabel} », puis remplacez par vos vraies informations.
        </p>

        <dl className="mt-4 space-y-2.5 border-t border-slate-800 pt-4 text-xs">
          <div>
            <dt className="text-slate-500">Nom</dt>
            <dd className="font-medium text-slate-200">
              {guidance.businessExample.businessName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Secteur · Type</dt>
            <dd className="text-slate-300">
              {template.categoryLabel} · {guidance.businessExample.activityType}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Slogan</dt>
            <dd className="text-slate-300">{guidance.businessExample.slogan}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Description</dt>
            <dd className="leading-5 text-slate-400">
              {guidance.businessExample.shortDescription}
            </dd>
          </div>
        </dl>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="mt-4"
          onClick={applyExample}
        >
          Remplir avec cet exemple
        </Button>
      </aside>
    </div>
  )
}

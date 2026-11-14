'use client'

import { Check, Palette } from 'lucide-react'
import Image from 'next/image'
import { Alert, Input } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { ResolvedSiteTemplate } from '@/lib/site-builder/templates'
import {
  WIZARD_MOODS,
  WIZARD_PALETTE_PRESETS,
  WIZARD_TYPOGRAPHY_PRESETS,
  isValidHexColor,
  type WizardFieldErrors,
  type WizardFormData,
} from '@/lib/site-builder/wizard'
import { WizardImageField } from '../WizardImageField'

export function BrandIdentityStep({
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
  const activeTypography =
    WIZARD_TYPOGRAPHY_PRESETS.find((preset) => preset.id === data.typographyId) ??
    WIZARD_TYPOGRAPHY_PRESETS[0]
  const activeMood =
    WIZARD_MOODS.find((mood) => mood.id === data.mood) ?? WIZARD_MOODS[0]
  const safePrimary = isValidHexColor(data.primaryColor)
    ? data.primaryColor
    : template.defaultTheme.palette.primary
  const safeSecondary = isValidHexColor(data.secondaryColor)
    ? data.secondaryColor
    : template.defaultTheme.palette.secondary

  const {
    supportsLogo,
    supportsSecondaryColor,
    supportsCustomTypography,
    supportsVisualMood,
  } = template.capabilities

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-8">
        <div>
          <WizardImageField
            label="Logo de votre entreprise (facultatif)"
            hint={
              supportsLogo
                ? 'Affiché dans l’en-tête de votre site.'
                : 'Conservé dans l’assistant ; ce modèle v1 utilise un titre typographique en en-tête.'
            }
            value={data.logoUrl}
            error={errors.logoUrl}
            aspect="square"
            previewAlt="Logo de votre entreprise"
            onChange={(logoUrl) => onChange({ logoUrl })}
            onUploadingChange={onUploadingChange}
          />
          {data.logoUrl && !supportsLogo && (
            <Alert variant="info" className="mt-3">
              Votre logo est conservé dans la session de l’assistant. Le modèle{' '}
              <strong>{template.name}</strong> utilise actuellement un titre typographique
              en en-tête et n’affiche pas encore de logo image.
            </Alert>
          )}
        </div>

        {(!supportsSecondaryColor ||
          !supportsCustomTypography ||
          !supportsVisualMood) && (
          <Alert variant="info">
            Sur le modèle <strong>{template.name}</strong>, seule la{' '}
            <strong>couleur principale</strong> est appliquée au rendu HTML actuel. Les
            réglages visuels fixes du modèle (couleur secondaire, typographie et ambiance)
            sont désactivés pour éviter toute confusion et ne sont pas modifiés en base.
          </Alert>
        )}

        <div className="border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <Palette className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>Palettes prédéfinies selon votre secteur</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {supportsSecondaryColor
              ? 'Sélectionnez une harmonie prête à l’emploi ou ajustez vos propres couleurs ci-dessous.'
              : 'Sélectionnez une teinte principale prête à l’emploi ou ajustez-la manuellement ci-dessous.'}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {WIZARD_PALETTE_PRESETS.map((preset) => {
              const isSelected = supportsSecondaryColor
                ? data.primaryColor.toLowerCase() === preset.primary.toLowerCase() &&
                  data.secondaryColor.toLowerCase() === preset.secondary.toLowerCase()
                : data.primaryColor.toLowerCase() === preset.primary.toLowerCase()

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      primaryColor: preset.primary,
                      ...(supportsSecondaryColor
                        ? { secondaryColor: preset.secondary }
                        : {}),
                      ...(supportsVisualMood ? { mood: preset.mood } : {}),
                    })
                  }
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400',
                    isSelected
                      ? 'border-emerald-400/70 bg-emerald-400/10'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {preset.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{preset.sectorHint}</p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span
                        className="h-4 w-7 rounded border border-white/15"
                        style={{ backgroundColor: preset.primary }}
                        aria-hidden="true"
                      />
                      {supportsSecondaryColor && (
                        <span
                          className="h-4 w-7 rounded border border-white/15"
                          style={{ backgroundColor: preset.secondary }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-emerald-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-primary-color"
                className="block text-sm font-medium text-slate-200"
              >
                Couleur principale <span className="text-emerald-400">*</span>
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  id="wizard-primary-color-picker"
                  type="color"
                  aria-label="Sélecteur visuel de couleur principale"
                  value={safePrimary}
                  onChange={(event) => onChange({ primaryColor: event.target.value })}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-slate-700 bg-slate-950 p-1"
                />
                <Input
                  id="wizard-primary-color"
                  value={data.primaryColor}
                  maxLength={7}
                  placeholder="#a34d32"
                  error={errors.primaryColor}
                  onChange={(event) => onChange({ primaryColor: event.target.value })}
                  className="font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="wizard-secondary-color"
                className="block text-sm font-medium text-slate-200"
              >
                Couleur secondaire{' '}
                {supportsSecondaryColor ? (
                  <span className="text-emerald-400">*</span>
                ) : (
                  <span className="text-xs font-normal text-slate-400">
                    (fixe sur ce modèle v1)
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  id="wizard-secondary-color-picker"
                  type="color"
                  aria-label="Sélecteur visuel de couleur secondaire"
                  value={safeSecondary}
                  disabled={!supportsSecondaryColor}
                  onChange={(event) => onChange({ secondaryColor: event.target.value })}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-slate-700 bg-slate-950 p-1 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Input
                  id="wizard-secondary-color"
                  value={
                    supportsSecondaryColor
                      ? data.secondaryColor
                      : template.defaultTheme.palette.secondary
                  }
                  maxLength={7}
                  placeholder="#29251f"
                  disabled={!supportsSecondaryColor}
                  error={errors.secondaryColor}
                  onChange={(event) => onChange({ secondaryColor: event.target.value })}
                  className="font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-sm font-medium text-slate-200">Typographie</p>
            {!supportsCustomTypography && (
              <span className="text-xs text-slate-400">
                (fixe sur ce modèle v1)
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {supportsCustomTypography
              ? 'Choisissez le style d’écriture qui reflète le mieux votre activité.'
              : 'La police de caractères est définie par le modèle actif dans cette version.'}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {WIZARD_TYPOGRAPHY_PRESETS.map((preset) => {
              const isSelected = data.typographyId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={!supportsCustomTypography}
                  onClick={() => onChange({ typographyId: preset.id })}
                  aria-pressed={isSelected}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400',
                    !supportsCustomTypography && 'cursor-not-allowed opacity-60',
                    isSelected
                      ? 'border-emerald-400/70 bg-emerald-400/10'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  )}
                >
                  <p
                    className="text-base font-semibold text-white"
                    style={{ fontFamily: preset.headingFont }}
                  >
                    {preset.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {preset.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-sm font-medium text-slate-200">Ambiance visuelle</p>
            {!supportsVisualMood && (
              <span className="text-xs text-slate-400">
                (fixe sur ce modèle v1)
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {WIZARD_MOODS.map((mood) => {
              const isSelected = data.mood === mood.id
              return (
                <button
                  key={mood.id}
                  type="button"
                  disabled={!supportsVisualMood}
                  onClick={() => onChange({ mood: mood.id })}
                  aria-pressed={isSelected}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400',
                    !supportsVisualMood && 'cursor-not-allowed opacity-60',
                    isSelected
                      ? 'border-emerald-400/70 bg-emerald-400/10'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  )}
                >
                  <p className="text-sm font-semibold text-white">{mood.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{mood.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-slate-800 bg-slate-900/75 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Aperçu de votre identité
        </p>

        <div
          className="mt-4 overflow-hidden rounded-xl border border-slate-700/80"
          style={{ backgroundColor: template.defaultTheme.palette.background }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'rgba(15, 23, 42, 0.1)' }}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {data.logoUrl ? (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
                  <Image
                    src={data.logoUrl}
                    alt="Aperçu du logo"
                    fill
                    sizes="32px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <span
                className="truncate text-sm font-bold"
                style={{
                  color: safePrimary,
                  fontFamily: activeTypography.headingFont,
                }}
              >
                {data.businessName.trim() || 'Votre entreprise'}
              </span>
            </div>
            <span
              className="text-[11px] font-medium"
              style={{ color: safeSecondary }}
            >
              {activeMood.label}
            </span>
          </div>

          <div className="p-4">
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: safePrimary }}
            >
              {data.slogan.trim() || data.sector || template.categoryLabel}
            </p>
            <p
              className="mt-2 text-lg font-bold leading-snug"
              style={{
                color: safeSecondary,
                fontFamily: activeTypography.headingFont,
              }}
            >
              {data.heroTitle.trim() || 'Votre titre d’accroche ici'}
            </p>
            <p
              className="mt-1.5 text-xs leading-relaxed opacity-80"
              style={{
                color: safeSecondary,
                fontFamily: activeTypography.bodyFont,
              }}
            >
              {data.shortDescription.trim() ||
                'Vos visiteurs découvriront immédiatement votre univers et votre couleur principale.'}
            </p>
            <span
              className="mt-3 inline-block rounded px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: safePrimary }}
            >
              {data.ctaLabel.trim() || 'Nous contacter'}
            </span>
          </div>
        </div>

        <dl className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <dt>Typographie</dt>
            <dd className="font-medium text-slate-200">{activeTypography.label}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Ambiance</dt>
            <dd className="font-medium text-slate-200">{activeMood.label}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Palette</dt>
            <dd className="font-mono text-slate-200">
              {safePrimary} · {safeSecondary}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}

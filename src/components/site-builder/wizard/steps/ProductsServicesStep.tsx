'use client'

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Alert, Button, EmptyState, Input, Textarea } from '@/components/ui'
import type { ResolvedSiteTemplate } from '@/lib/site-builder/templates'
import {
  getWizardTemplateGuidance,
  type WizardCatalogItem,
  type WizardFieldErrors,
  type WizardFormData,
} from '@/lib/site-builder/wizard'
import { WizardImageField } from '../WizardImageField'

function generateItemId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function ProductsServicesStep({
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
  const items = data.items
  const maxFeatured = template.capabilities.maxFeaturedItems

  const addItem = (preset?: { name: string; description: string }) => {
    const nextItem: WizardCatalogItem = {
      id: generateItemId(),
      name: preset?.name ?? '',
      description: preset?.description ?? '',
    }
    onChange({ items: [...items, nextItem] })
  }

  const updateItem = (index: number, patch: Partial<WizardCatalogItem>) => {
    const next = items.map((item, idx) =>
      idx === index ? { ...item, ...patch } : item
    )
    onChange({ items: next })
  }

  const removeItem = (index: number) => {
    onChange({ items: items.filter((_, idx) => idx !== index) })
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange({ items: next })
  }

  if (!template.capabilities.supportsCatalogItems) {
    return (
      <Alert variant="info" title="Section non utilisée par ce modèle">
        Le modèle sélectionné ne comporte pas de bloc liste de services ou produits.
        Vous pouvez passer directement à l’étape suivante.
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {guidance.sectionHeadingLabel}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Ajoutez vos {guidance.itemNounPlural}. Tous ces éléments sont facultatifs :
            vous pouvez en saisir 1, 3 ou continuer sans tout remplir maintenant.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}
          onClick={() => addItem()}
          disabled={items.length >= 12}
        >
          {guidance.addItemButtonLabel}
        </Button>
      </div>

      {items.length > maxFeatured && (
        <Alert variant="info">
          Le modèle <strong>{template.name}</strong> met actuellement en avant les{' '}
          <strong className="tabular-nums">{maxFeatured}</strong> premiers éléments sur
          la page vitrine. Vous pouvez réorganiser leur ordre ci-dessous.
        </Alert>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={`Aucun ${guidance.itemNounSingular} ajouté pour l’instant`}
          description={`Ajoutez uniquement vos vrais ${guidance.itemNounPlural}, ou passez à l’étape suivante si vous souhaitez les rédiger plus tard.`}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}
                onClick={() => addItem()}
              >
                {guidance.addItemButtonLabel}
              </Button>
              <Button
                variant="outline"
                onClick={() => addItem(guidance.itemExample)}
              >
                Partir d’un exemple modifiable
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const nameError = errors[`items.${index}.name`]
            const descError = errors[`items.${index}.description`]
            const imageError = errors[`items.${index}.imageUrl`]
            const isHighlighted = index < maxFeatured

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/75 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold tabular-nums text-emerald-400">
                      #{index + 1}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{guidance.itemNounSingular}</span>
                    {!isHighlighted && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">
                          Hors top {maxFeatured} affiché sur ce modèle
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      aria-label={`Monter l’élément ${index + 1}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label={`Descendre l’élément ${index + 1}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <Button
                      variant="danger"
                      size="sm"
                      iconLeft={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => removeItem(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label={`Nom du ${guidance.itemNounSingular}`}
                    required
                    maxLength={100}
                    value={item.name}
                    placeholder={`Ex. ${guidance.itemExample.name}`}
                    error={nameError}
                    onChange={(event) =>
                      updateItem(index, { name: event.target.value })
                    }
                  />

                  <Textarea
                    label="Description courte"
                    rows={2}
                    maxLength={400}
                    value={item.description}
                    placeholder={`Ex. ${guidance.itemExample.description}`}
                    error={descError}
                    onChange={(event) =>
                      updateItem(index, { description: event.target.value })
                    }
                  />
                </div>

                {template.capabilities.supportsCatalogItemImages && (
                  <div className="mt-4 border-t border-slate-800/80 pt-4">
                    <WizardImageField
                      label="Image de l’élément (facultatif)"
                      value={item.imageUrl ?? ''}
                      error={imageError}
                      aspect="square"
                      previewAlt={item.name || `Image élément ${index + 1}`}
                      onChange={(imageUrl) => updateItem(index, { imageUrl })}
                      onUploadingChange={onUploadingChange}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

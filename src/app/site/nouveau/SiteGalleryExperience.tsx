'use client'

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  LayoutTemplate,
  RefreshCw,
  Search,
  Wand2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AppHeader, type AppHeaderProps } from '@/components/layout/AppHeader'
import { SiteWizard } from '@/components/site-builder/wizard'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardFooter,
  EmptyState,
  Input,
} from '@/components/ui'
import { cn } from '@/lib/cn'
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_SECTION_LABELS,
  type ResolvedSiteTemplate,
  type TemplateCategoryId,
} from '@/lib/site-builder/templates'
import type { WizardFormData } from '@/lib/site-builder/wizard'
import { SiteBuilder } from './SiteBuilder'
import { SiteTemplatePreviewModal } from './SiteTemplatePreviewModal'

export function SiteGalleryExperience({
  templates,
  initialTemplateId,
  headerUser,
  loadError,
}: {
  templates: ResolvedSiteTemplate[]
  initialTemplateId?: string
  headerUser?: AppHeaderProps['user']
  loadError?: string
}) {
  const router = useRouter()
  const validInitialId =
    initialTemplateId && templates.some((t) => t.id === initialTemplateId)
      ? initialTemplateId
      : ''

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(validInitialId)
  const [stage, setStage] = useState<'gallery' | 'wizard' | 'builder'>(
    validInitialId ? 'wizard' : 'gallery'
  )
  const [wizardDraftByTemplate, setWizardDraftByTemplate] = useState<
    Record<string, WizardFormData>
  >({})
  const [unappliedLabelsByTemplate, setUnappliedLabelsByTemplate] = useState<
    Record<string, string[]>
  >({})
  const [generatedFormData, setGeneratedFormData] = useState<
    Record<string, string> | undefined
  >(undefined)
  const [previewTemplate, setPreviewTemplate] = useState<ResolvedSiteTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | TemplateCategoryId>('all')

  const countsByCategory = useMemo(() => {
    const counts = new Map<TemplateCategoryId, number>()
    for (const category of TEMPLATE_CATEGORIES) {
      counts.set(category.id, 0)
    }
    for (const template of templates) {
      counts.set(template.categoryId, (counts.get(template.categoryId) ?? 0) + 1)
    }
    return counts
  }, [templates])

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return templates.filter((template) => {
      const matchesCategory =
        selectedCategory === 'all' || template.categoryId === selectedCategory
      if (!matchesCategory) return false

      if (!normalizedQuery) return true
      return (
        template.name.toLowerCase().includes(normalizedQuery) ||
        template.shortDescription.toLowerCase().includes(normalizedQuery) ||
        template.categoryLabel.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [searchQuery, selectedCategory, templates])

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  )

  const openWizardForTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    setGeneratedFormData(undefined)
    setStage('wizard')
  }

  if (selectedTemplate && stage === 'wizard') {
    return (
      <SiteWizard
        key={selectedTemplate.id}
        template={selectedTemplate}
        isAuthenticated={Boolean(headerUser)}
        initialData={wizardDraftByTemplate[selectedTemplate.id]}
        onExit={() => {
          setSelectedTemplateId('')
          setStage('gallery')
        }}
        onComplete={({ templateId, formData, wizardData, unappliedLabels }) => {
          setWizardDraftByTemplate((current) => ({
            ...current,
            [templateId]: wizardData,
          }))
          setUnappliedLabelsByTemplate((current) => ({
            ...current,
            [templateId]: unappliedLabels,
          }))
          setGeneratedFormData(formData)
          setSelectedTemplateId(templateId)
          setStage('builder')
        }}
      />
    )
  }

  if (selectedTemplate && stage === 'builder') {
    return (
      <div>
        <AppHeader activeNav="sites" user={headerUser} />

        <div className="border-b border-slate-800/80 bg-slate-900/40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                onClick={() => {
                  setSelectedTemplateId('')
                  setStage('gallery')
                }}
              >
                Changer de modèle
              </Button>
              <span className="text-slate-600" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-white">{selectedTemplate.name}</span>
              <span className="hidden text-slate-400 sm:inline">
                · {selectedTemplate.categoryLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Wand2 className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => setStage('wizard')}
              >
                Revenir à l’assistant
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => setPreviewTemplate(selectedTemplate)}
              >
                Aperçu du modèle
              </Button>
            </div>
          </div>
        </div>

        <SiteBuilder
          key={`${selectedTemplate.id}-${generatedFormData ? 'wizard' : 'direct'}`}
          initialTemplateId={selectedTemplate.id}
          initialFormData={generatedFormData}
          unappliedWizardLabels={unappliedLabelsByTemplate[selectedTemplate.id]}
          templates={templates.map((template) => ({
            id: template.id,
            name: template.name,
            category: template.categoryLabel,
            variables: template.variables,
          }))}
        />

        <SiteTemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(templateId) => openWizardForTemplate(templateId)}
        />
      </div>
    )
  }

  return (
    <>
      <AppHeader activeNav="sites" user={headerUser} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Création de site vitrine
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Choisissez un modèle adapté à votre activité
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-400">
          Explorez nos modèles professionnels, prévisualisez leur rendu sur ordinateur et
          mobile, puis personnalisez celui qui vous convient gratuitement.
        </p>
      </div>

      {loadError ? (
        <div className="mt-8">
          <Alert
            variant="error"
            title="Impossible de charger la galerie de modèles"
            action={
              <Button
                variant="outline"
                size="sm"
                iconLeft={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => router.refresh()}
              >
                Réessayer
              </Button>
            }
          >
            {loadError}
          </Alert>
        </div>
      ) : templates.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<LayoutTemplate className="h-5 w-5" />}
            title="Aucun modèle de site disponible"
            description="Aucun modèle actif n’est actuellement chargé en base de données. Exécutez le seed ou activez un modèle depuis l’administration."
            action={
              <Button
                variant="outline"
                iconLeft={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
                onClick={() => router.refresh()}
              >
                Actualiser la page
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-5 border-b border-slate-800/80 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher un modèle par nom ou secteur…"
                  aria-label="Rechercher un modèle"
                  leadingIcon={<Search className="h-4 w-4" />}
                  className={searchQuery ? 'pr-9' : undefined}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Effacer la recherche"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <p className="text-sm tabular-nums text-slate-400">
                {filteredTemplates.length} modèle{filteredTemplates.length > 1 ? 's' : ''} affiché
                {filteredTemplates.length > 1 ? 's' : ''} sur {templates.length}
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filtrer par catégorie d’activité"
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                  selectedCategory === 'all'
                    ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                )}
              >
                <span>Toutes les catégories</span>
                <span className="tabular-nums text-slate-400">({templates.length})</span>
              </button>

              {TEMPLATE_CATEGORIES.map((category) => {
                const count = countsByCategory.get(category.id) ?? 0
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                      isSelected
                        ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                        : count > 0
                          ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                          : 'border-slate-800/60 bg-slate-900/40 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    )}
                  >
                    <span>{category.label}</span>
                    <span className="tabular-nums opacity-75">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={<LayoutTemplate className="h-5 w-5" />}
                title="Aucun modèle ne correspond à votre sélection"
                description={
                  selectedCategory !== 'all' && (countsByCategory.get(selectedCategory) ?? 0) === 0
                    ? 'Cette catégorie est prête pour de prochains modèles. Explorez les modèles déjà disponibles ou réinitialisez les filtres.'
                    : 'Essayez un autre mot-clé ou affichez toutes les catégories disponibles.'
                }
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                  >
                    Voir tous les modèles
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  interactive
                  className="flex flex-col overflow-hidden"
                >
                  <div className="group relative h-56 overflow-hidden border-b border-slate-800 bg-slate-950">
                    {template.previewHtml ? (
                      <div className="pointer-events-none h-full w-full overflow-hidden bg-white">
                        <iframe
                          srcDoc={template.previewHtml}
                          title={`Miniature de ${template.name}`}
                          sandbox=""
                          tabIndex={-1}
                          className="h-[800px] w-[1280px] origin-top-left border-0"
                          style={{ transform: 'scale(0.32)' }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        Aperçu du modèle
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-950/75 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        iconLeft={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                        onClick={() => setPreviewTemplate(template)}
                      >
                        Aperçu
                      </Button>
                    </div>
                  </div>

                  <CardContent className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-emerald-300">
                        {template.categoryLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{template.defaultTheme.styleName}</span>
                    </div>

                    <h2 className="mt-2 text-lg font-semibold text-white">
                      {template.name}
                    </h2>

                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                      {template.shortDescription}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                      <span className="truncate">
                        {template.supportedSections
                          .slice(0, 4)
                          .map((section) => TEMPLATE_SECTION_LABELS[section])
                          .join(' · ')}
                      </span>
                      <span
                        className="flex shrink-0 items-center gap-1"
                        title="Palette par défaut"
                      >
                        <span
                          className="h-3 w-3 rounded-sm border border-white/20"
                          style={{ backgroundColor: template.defaultTheme.palette.primary }}
                          aria-hidden="true"
                        />
                        <span
                          className="h-3 w-3 rounded-sm border border-white/20"
                          style={{ backgroundColor: template.defaultTheme.palette.background }}
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      iconLeft={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => setPreviewTemplate(template)}
                    >
                      Prévisualiser
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      iconRight={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => openWizardForTemplate(template.id)}
                    >
                      Utiliser ce modèle
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <SiteTemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(templateId) => openWizardForTemplate(templateId)}
      />
    </section>
    </>
  )
}

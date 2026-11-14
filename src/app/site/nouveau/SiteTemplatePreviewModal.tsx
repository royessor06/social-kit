'use client'

import { ArrowRight, Monitor, Smartphone, Tablet } from 'lucide-react'
import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { cn } from '@/lib/cn'
import {
  TEMPLATE_SECTION_LABELS,
  type ResolvedSiteTemplate,
} from '@/lib/site-builder/templates'

type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

const DEVICE_OPTIONS: {
  id: PreviewDevice
  label: string
  widthClass: string
  Icon: typeof Monitor
}[] = [
  { id: 'desktop', label: 'Ordinateur', widthClass: 'w-full', Icon: Monitor },
  { id: 'tablet', label: 'Tablette', widthClass: 'w-[768px] max-w-full', Icon: Tablet },
  { id: 'mobile', label: 'Mobile', widthClass: 'w-[375px] max-w-full', Icon: Smartphone },
]

export function SiteTemplatePreviewModal({
  template,
  onClose,
  onSelect,
}: {
  template: ResolvedSiteTemplate | null
  onClose: () => void
  onSelect: (templateId: string) => void
}) {
  const [device, setDevice] = useState<PreviewDevice>('desktop')

  if (!template) return null

  const currentDevice =
    DEVICE_OPTIONS.find((option) => option.id === device) ?? DEVICE_OPTIONS[0]

  return (
    <Modal
      open={Boolean(template)}
      onClose={onClose}
      size="full"
      title={template.name}
      description={`${template.categoryLabel} · ${template.defaultTheme.styleName}`}
      headerActions={
        <div
          role="group"
          aria-label="Taille d’aperçu"
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1"
        >
          {DEVICE_OPTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              aria-pressed={device === id}
              aria-label={label}
              title={label}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap sm:px-2.5',
                device === id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            variant="primary"
            iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            onClick={() => {
              onSelect(template.id)
              onClose()
            }}
          >
            Utiliser ce modèle
          </Button>
        </>
      }
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-h-[58vh] items-start justify-center overflow-x-auto bg-slate-950 p-4 sm:p-6">
          <div
            className={cn(
              'overflow-hidden rounded-xl border border-slate-800 bg-white shadow-2xl transition-all duration-200',
              currentDevice.widthClass
            )}
          >
            {template.previewHtml ? (
              <iframe
                srcDoc={template.previewHtml}
                title={`Aperçu complet du modèle ${template.name}`}
                sandbox=""
                className="h-[68vh] min-h-[520px] w-full border-0"
              />
            ) : (
              <div className="flex h-[520px] items-center justify-center p-6 text-center text-sm text-slate-500">
                Aperçu indisponible pour ce modèle.
              </div>
            )}
          </div>
        </div>

        <aside className="border-t border-slate-800 bg-slate-900/70 p-5 lg:border-l lg:border-t-0">
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-semibold text-white">À propos de ce modèle</h3>
              <p className="mt-2 leading-6 text-slate-400">
                {template.shortDescription}
              </p>
              <p className="mt-2 leading-6 text-slate-500">
                {template.previewSummary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Sections incluses</h3>
              <ul className="mt-2.5 space-y-1.5 text-slate-300">
                {template.supportedSections.map((section) => (
                  <li key={section} className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    <span>{TEMPLATE_SECTION_LABELS[section]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white">Style & palette</h3>
              <p className="mt-1.5 text-xs text-slate-400">
                {template.defaultTheme.typography.styleLabel}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[
                  { label: 'Principale', color: template.defaultTheme.palette.primary },
                  { label: 'Secondaire', color: template.defaultTheme.palette.secondary },
                  { label: 'Fond', color: template.defaultTheme.palette.background },
                ].map((swatch) => (
                  <div
                    key={swatch.label}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-300"
                  >
                    <span
                      className="h-3 w-3 rounded-sm border border-white/15"
                      style={{ backgroundColor: swatch.color }}
                      aria-hidden="true"
                    />
                    <span>{swatch.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  )
}

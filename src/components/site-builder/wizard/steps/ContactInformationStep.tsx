'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { Alert, Input, Textarea } from '@/components/ui'
import type { ResolvedSiteTemplate } from '@/lib/site-builder/templates'
import {
  isValidPhoneNumber,
  normalizeWhatsAppDigits,
  type WizardFieldErrors,
  type WizardFormData,
} from '@/lib/site-builder/wizard'

export function ContactInformationStep({
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
  const whatsappDigits =
    data.whatsapp.trim() && isValidPhoneNumber(data.whatsapp)
      ? normalizeWhatsAppDigits(data.whatsapp)
      : ''

  const hasLimitedContactChannels =
    !template.capabilities.supportsWhatsApp ||
    !template.capabilities.supportsEmail ||
    !template.capabilities.supportsSocialLinks

  const updateSocial = (
    key: keyof WizardFormData['socialLinks'],
    value: string
  ) => {
    onChange({
      socialLinks: {
        ...data.socialLinks,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8">
      {hasLimitedContactChannels && (
        <Alert variant="info">
          Le modèle <strong>{template.name}</strong> affiche actuellement sur la page
          publiée votre <strong>téléphone</strong>, votre <strong>adresse</strong> et
          vos <strong>horaires</strong>. Les champs WhatsApp, e-mail et réseaux sociaux
          restent saisis séparément dans votre session de travail sans être affichés ni
          enregistrés par ce modèle v1.
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Numéro de téléphone"
          type="tel"
          maxLength={24}
          value={data.phone}
          placeholder="Ex. +229 97 00 00 00"
          error={errors.phone}
          leadingIcon={<Phone className="h-4 w-4" />}
          hint="Affiché dans le bloc Contact du site."
          onChange={(event) => onChange({ phone: event.target.value })}
        />

        <Input
          label="Numéro WhatsApp (facultatif)"
          type="tel"
          maxLength={24}
          value={data.whatsapp}
          placeholder="Ex. +229 97 00 00 00"
          error={errors.whatsapp}
          leadingIcon={<MessageCircle className="h-4 w-4" />}
          hint={
            !template.capabilities.supportsWhatsApp
              ? whatsappDigits
                ? `Format valide (wa.me/${whatsappDigits}) — conservé dans l’assistant, non affiché sur ce modèle v1.`
                : 'Conservé séparément dans l’assistant (non affiché sur ce modèle v1).'
              : whatsappDigits
                ? `Lien WhatsApp prêt : wa.me/${whatsappDigits}`
                : 'Ajoutez l’indicatif pays pour permettre aux clients de vous écrire directement.'
          }
          onChange={(event) => onChange({ whatsapp: event.target.value })}
        />
      </div>

      <div className="grid gap-5 border-t border-slate-800 pt-6 sm:grid-cols-2">
        <Input
          label="Adresse physique ou quartier"
          maxLength={200}
          value={data.address}
          placeholder="Ex. Quartier Haie Vive, Rue 12"
          error={errors.address}
          onChange={(event) => onChange({ address: event.target.value })}
        />

        <Input
          label="Ville"
          maxLength={100}
          value={data.city}
          placeholder="Ex. Cotonou"
          error={errors.city}
          onChange={(event) => onChange({ city: event.target.value })}
        />
      </div>

      <div className="grid gap-5 border-t border-slate-800 pt-6 sm:grid-cols-2">
        {template.capabilities.supportsOpeningHours ? (
          <Textarea
            label="Horaires d’ouverture"
            rows={3}
            maxLength={300}
            value={data.openingHours}
            placeholder="Ex. Lundi - Samedi : 09h00 - 20h00"
            error={errors.openingHours}
            hint="Aidez vos clients à savoir quand vous joindre ou vous rendre visite."
            onChange={(event) => onChange({ openingHours: event.target.value })}
          />
        ) : (
          <Input
            label="Disponibilité"
            maxLength={200}
            value={data.openingHours}
            placeholder="Ex. Lun - Ven · 8h00 - 18h00"
            error={errors.openingHours}
            onChange={(event) => onChange({ openingHours: event.target.value })}
          />
        )}

        <Input
          label="Adresse e-mail professionnelle (facultatif)"
          type="email"
          maxLength={160}
          value={data.email}
          placeholder="Ex. contact@monentreprise.com"
          error={errors.email}
          hint="Les champs laissés vides ne créeront aucun lien vide sur votre site."
          onChange={(event) => onChange({ email: event.target.value })}
        />
      </div>

      <div className="border-t border-slate-800 pt-6">
        <h2 className="text-sm font-medium text-slate-200">
          Réseaux sociaux et lien web (facultatif)
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Renseignez uniquement les comptes actifs que vous souhaitez partager.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Facebook"
            type="url"
            maxLength={300}
            value={data.socialLinks.facebook}
            placeholder="https://facebook.com/votre-page"
            error={errors['socialLinks.facebook']}
            onChange={(event) => updateSocial('facebook', event.target.value)}
          />
          <Input
            label="Instagram"
            type="url"
            maxLength={300}
            value={data.socialLinks.instagram}
            placeholder="https://instagram.com/votre-compte"
            error={errors['socialLinks.instagram']}
            onChange={(event) => updateSocial('instagram', event.target.value)}
          />
          <Input
            label="LinkedIn"
            type="url"
            maxLength={300}
            value={data.socialLinks.linkedin}
            placeholder="https://linkedin.com/company/votre-entreprise"
            error={errors['socialLinks.linkedin']}
            onChange={(event) => updateSocial('linkedin', event.target.value)}
          />
          <Input
            label="Autre site web"
            type="url"
            maxLength={300}
            value={data.socialLinks.website}
            placeholder="https://votre-site.com"
            error={errors['socialLinks.website']}
            onChange={(event) => updateSocial('website', event.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

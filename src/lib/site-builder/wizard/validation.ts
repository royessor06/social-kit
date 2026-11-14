import { createSiteSlug, RESERVED_SITE_SLUGS } from '../../site'
import type { ResolvedSiteTemplate } from '../templates'
import type {
  WizardFieldErrors,
  WizardFormData,
  WizardStepId,
  WizardValidationResult,
} from './types'

const HEX_COLOR_RE = /^#[\da-f]{6}$/i
const LOCAL_UPLOAD_RE = /^\/uploads\/([a-zA-Z0-9_-]+\.(?:png|jpe?g|webp))$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_CHARS_RE = /^[+\d\s().-]{6,24}$/

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value.trim())
}

export function isValidUploadedImageUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  if (LOCAL_UPLOAD_RE.test(trimmed)) return true
  try {
    const parsed = new URL(trimmed)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.public.blob.vercel-storage.com') &&
      LOCAL_UPLOAD_RE.test(parsed.pathname)
    )
  } catch {
    return false
  }
}

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  try {
    const parsed = new URL(trimmed)
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes('.')
    )
  } catch {
    return false
  }
}

export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  if (!PHONE_CHARS_RE.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 6 && digits.length <= 15
}

export function normalizeWhatsAppDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  return trimmed.length <= 160 && EMAIL_RE.test(trimmed)
}

export function validateWizardStep(
  step: WizardStepId,
  data: WizardFormData,
  template: ResolvedSiteTemplate
): WizardFieldErrors {
  const errors: WizardFieldErrors = {}

  if (step === 1) {
    const businessName = data.businessName.trim()
    if (!businessName) {
      errors.businessName = 'Le nom de votre entreprise est requis.'
    } else if (businessName.length < 2) {
      errors.businessName = 'Le nom doit contenir au moins 2 caractères.'
    } else if (businessName.length > 80) {
      errors.businessName = 'Le nom ne doit pas dépasser 80 caractères.'
    } else {
      const slug = createSiteSlug(businessName)
      if (!slug) {
        errors.businessName =
          'Utilisez au moins quelques lettres ou chiffres pour créer votre adresse web.'
      } else if (RESERVED_SITE_SLUGS.has(slug)) {
        errors.businessName =
          'Ce nom est réservé par la plateforme. Choisissez un autre nom commercial.'
      }
    }

    if (!data.sector.trim()) {
      errors.sector = 'Précisez votre secteur d’activité.'
    } else if (data.sector.trim().length > 80) {
      errors.sector = 'Le secteur ne doit pas dépasser 80 caractères.'
    }

    if (data.activityType.trim().length > 100) {
      errors.activityType = 'Le type d’activité ne doit pas dépasser 100 caractères.'
    }

    if (data.slogan.trim().length > 140) {
      errors.slogan = 'Le slogan ne doit pas dépasser 140 caractères.'
    }

    if (data.shortDescription.trim().length > 500) {
      errors.shortDescription = 'La description ne doit pas dépasser 500 caractères.'
    }
  }

  if (step === 2) {
    if (!isValidHexColor(data.primaryColor)) {
      errors.primaryColor =
        'Saisissez une couleur principale valide au format hexadécimal (ex. #a34d32).'
    }
    if (!isValidHexColor(data.secondaryColor)) {
      errors.secondaryColor =
        'Saisissez une couleur secondaire valide au format hexadécimal (ex. #29251f).'
    }
    if (!isValidUploadedImageUrl(data.logoUrl)) {
      errors.logoUrl =
        'Le logo doit provenir d’un téléversement valide (PNG, JPEG ou WebP).'
    }
  }

  if (step === 3) {
    const heroTitle = data.heroTitle.trim()
    if (!heroTitle) {
      errors.heroTitle = 'Le titre principal de votre site est requis.'
    } else if (heroTitle.length > 140) {
      errors.heroTitle = 'Le titre principal ne doit pas dépasser 140 caractères.'
    }

    if (data.heroText.trim().length > 800) {
      errors.heroText = 'Le texte de présentation ne doit pas dépasser 800 caractères.'
    }

    if (!isValidUploadedImageUrl(data.heroImageUrl)) {
      errors.heroImageUrl =
        'L’image principale doit provenir d’un téléversement valide (PNG, JPEG ou WebP).'
    }

    if (data.ctaLabel.trim().length > 60) {
      errors.ctaLabel = 'Le texte du bouton ne doit pas dépasser 60 caractères.'
    }
  }

  if (step === 4 && template.capabilities.supportsCatalogItems) {
    data.items.forEach((item, index) => {
      const hasName = Boolean(item.name.trim())
      const hasDesc = Boolean(item.description.trim())
      const hasImage = Boolean(item.imageUrl?.trim())

      if ((hasDesc || hasImage) && !hasName) {
        errors[`items.${index}.name`] =
          'Ajoutez un nom pour cet élément ou supprimez la ligne.'
      }
      if (item.name.trim().length > 100) {
        errors[`items.${index}.name`] = 'Le nom ne doit pas dépasser 100 caractères.'
      }
      if (item.description.trim().length > 400) {
        errors[`items.${index}.description`] =
          'La description ne doit pas dépasser 400 caractères.'
      }
      if (item.imageUrl && !isValidUploadedImageUrl(item.imageUrl)) {
        errors[`items.${index}.imageUrl`] =
          'L’image doit provenir d’un téléversement valide.'
      }
    })
  }

  if (step === 5) {
    if (!isValidPhoneNumber(data.phone)) {
      errors.phone =
        'Numéro de téléphone invalide (6 à 15 chiffres, ex. +229 97 00 00 00).'
    }
    if (!isValidPhoneNumber(data.whatsapp)) {
      errors.whatsapp =
        'Numéro WhatsApp invalide (indiquez l’indicatif pays, ex. +229 97 00 00 00).'
    }
    if (!isValidEmail(data.email)) {
      errors.email = 'Adresse e-mail invalide (ex. contact@entreprise.com).'
    }
    if (data.address.trim().length > 200) {
      errors.address = 'L’adresse ne doit pas dépasser 200 caractères.'
    }
    if (data.city.trim().length > 100) {
      errors.city = 'La ville ne doit pas dépasser 100 caractères.'
    }
    if (data.openingHours.trim().length > 300) {
      errors.openingHours = 'Les horaires ne doivent pas dépasser 300 caractères.'
    }

    const socialFields: Array<keyof WizardFormData['socialLinks']> = [
      'facebook',
      'instagram',
      'linkedin',
      'website',
    ]
    for (const key of socialFields) {
      if (!isValidHttpUrl(data.socialLinks[key])) {
        errors[`socialLinks.${key}`] =
          'Entrez une URL complète commençant par https:// ou http://'
      }
    }
  }

  return errors
}

export function validateAllWizardSteps(
  data: WizardFormData,
  template: ResolvedSiteTemplate
): WizardValidationResult {
  const stepErrors: Partial<Record<WizardStepId, WizardFieldErrors>> = {}
  const combinedErrors: WizardFieldErrors = {}

  for (const stepId of [1, 2, 3, 4, 5] as const) {
    const errors = validateWizardStep(stepId, data, template)
    if (Object.keys(errors).length > 0) {
      stepErrors[stepId] = errors
      Object.assign(combinedErrors, errors)
    }
  }

  return {
    valid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors,
    stepErrors,
  }
}

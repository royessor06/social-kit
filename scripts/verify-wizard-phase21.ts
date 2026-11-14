import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  SITE_TEMPLATE_DEFINITIONS,
  resolveSiteTemplate,
} from '../src/lib/site-builder/templates'
import {
  createInitialWizardState,
  transformWizardData,
  validateAllWizardSteps,
  type WizardFormData,
} from '../src/lib/site-builder/wizard'
import { renderPosterHtml } from '../src/lib/template'

function loadResolvedTemplates() {
  return SITE_TEMPLATE_DEFINITIONS.map((def) => {
    const htmlContent = readFileSync(
      join(process.cwd(), 'src', 'templates', 'sites', def.templateFile),
      'utf8'
    )
    return {
      def,
      htmlContent,
      resolved: resolveSiteTemplate(
        {
          id: def.id,
          name: def.name,
          category: def.legacyDbCategory,
          variables: def.variables,
          active: true,
        },
        ''
      ),
    }
  })
}

async function main() {
  const templates = loadResolvedTemplates()
  assert.equal(templates.length, 3, 'Les 3 templates principaux doivent être chargés')

  // 1. Vérification des capacités déclarées dans le Template Registry
  for (const { resolved } of templates) {
    assert.equal(resolved.capabilities.supportsHeroImage, true)
    assert.equal(resolved.capabilities.supportsOpeningHours, true)
    assert.equal(resolved.capabilities.supportsCatalogItems, true)
    assert.equal(resolved.capabilities.maxFeaturedItems, 3)

    assert.equal(resolved.capabilities.supportsLogo, false)
    assert.equal(resolved.capabilities.supportsSecondaryColor, false)
    assert.equal(resolved.capabilities.supportsCustomTypography, false)
    assert.equal(resolved.capabilities.supportsVisualMood, false)
    assert.equal(resolved.capabilities.supportsCustomCta, false)
    assert.equal(resolved.capabilities.supportsCatalogItemImages, false)
    assert.equal(resolved.capabilities.supportsWhatsApp, false)
    assert.equal(resolved.capabilities.supportsEmail, false)
    assert.equal(resolved.capabilities.supportsSocialLinks, false)
  }

  // 2. Séparation stricte des coordonnées (horaires, téléphone, adresse) et conservation des champs non appliqués
  const restaurant = templates.find((t) => t.def.id === 'restaurant')!
  const baseData: WizardFormData = {
    ...createInitialWizardState(restaurant.resolved),
    businessName: 'Chez <Salim> & Co',
    sector: 'Restaurants & alimentation',
    activityType: 'Grillades',
    slogan: 'Saveurs authentiques',
    shortDescription: 'Une table conviviale au cœur de la ville.',
    logoUrl: '/uploads/logo-demo.png',
    primaryColor: '#a34d32',
    heroTitle: 'Cuisine du marché & grillades',
    heroText: 'Des plats faits maison chaque matin.',
    items: [
      { id: '1', name: 'Poulet braisé', description: 'Servi avec alloco' },
      { id: '2', name: 'Poisson grillé', description: '' },
      { id: '3', name: 'Jus de bissap', description: 'Frais et peu sucré' },
      { id: '4', name: 'Menu du dimanche', description: 'Formule famille' },
    ],
    phone: '',
    whatsapp: '+229 97 11 22 33',
    address: 'Rue 12, Haie Vive',
    city: 'Cotonou',
    openingHours: 'Mar - Dim : 11h00 - 23h00',
    email: 'contact@chezsalim.bj',
    socialLinks: {
      facebook: 'https://facebook.com/chezsalim',
      instagram: 'https://instagram.com/chezsalim',
      linkedin: '',
      website: '',
    },
  }

  const validation = validateAllWizardSteps(baseData, restaurant.resolved)
  assert.equal(validation.valid, true, 'Les données valides doivent passer la validation')

  const transformed = transformWizardData(baseData, restaurant.resolved)

  // Aucune clé inventée hors template.variables
  const expectedKeys = new Set(restaurant.resolved.variables.map((v) => v.key))
  for (const key of Object.keys(transformed.templateFormData)) {
    assert.equal(expectedKeys.has(key), true, `Clé inattendue dans formData: ${key}`)
  }
  assert.equal(Object.keys(transformed.templateFormData).length, expectedKeys.size)

  // Séparation stricte des coordonnées
  assert.equal(
    transformed.templateFormData.telephone,
    '',
    'telephone ne doit jamais reprendre WhatsApp en fallback'
  )
  assert.equal(
    transformed.templateFormData.horaires,
    'Mar - Dim : 11h00 - 23h00',
    'horaires ne doit contenir ni WhatsApp ni e-mail'
  )
  assert.equal(transformed.templateFormData.horaires.includes('WhatsApp'), false)
  assert.equal(transformed.templateFormData.horaires.includes('contact@chezsalim.bj'), false)
  assert.equal(transformed.templateFormData.adresse, 'Rue 12, Haie Vive, Cotonou')

  // Conservation séparée des données non appliquées dans retainedFields
  assert.equal(transformed.retainedFields.whatsapp, '+229 97 11 22 33')
  assert.equal(transformed.retainedFields.email, 'contact@chezsalim.bj')
  assert.equal(transformed.retainedFields.logoUrl, '/uploads/logo-demo.png')
  assert.equal(transformed.retainedFields.activityType, 'Grillades')
  assert.equal(
    transformed.retainedFields.shortDescription,
    'Une table conviviale au cœur de la ville.'
  )
  assert.equal(transformed.retainedFields.socialLinks?.facebook, 'https://facebook.com/chezsalim')
  assert.equal(transformed.retainedFields.socialLinks?.instagram, 'https://instagram.com/chezsalim')
  assert.equal(transformed.retainedFields.extraCatalogItems?.length, 1)
  assert.equal(transformed.retainedFields.extraCatalogItems?.[0]?.name, 'Menu du dimanche')

  assert.ok(transformed.unappliedLabels.includes('WhatsApp'))
  assert.ok(transformed.unappliedLabels.includes('Adresse e-mail'))
  assert.ok(transformed.unappliedLabels.includes('Liens réseaux sociaux'))
  assert.ok(transformed.unappliedLabels.includes('Logo'))
  assert.ok(transformed.unappliedLabels.includes('Éléments supplémentaires (au-delà de 3)'))

  // Vérification téléphone renseigné distinct de WhatsApp
  const withPhone = transformWizardData(
    { ...baseData, phone: '+229 21 00 00 01' },
    restaurant.resolved
  )
  assert.equal(withPhone.templateFormData.telephone, '+229 21 00 00 01')

  // Vérification sans options non supportées personnalisées : unappliedLabels vide
  const cleanMinimal = transformWizardData(
    {
      ...createInitialWizardState(restaurant.resolved),
      businessName: 'Table Simple',
      heroTitle: 'Bienvenue',
      items: [{ id: '1', name: 'Plat du jour', description: 'Fait maison' }],
    },
    restaurant.resolved
  )
  assert.deepEqual(cleanMinimal.unappliedLabels, [])

  // 3. Vérification du rendu HTML/CSS pour 0, 1, 2 et 3 éléments sur les 3 templates
  for (const { def, htmlContent, resolved } of templates) {
    for (const count of [0, 1, 2, 3] as const) {
      const items = Array.from({ length: count }, (_, idx) => ({
        id: `item-${idx + 1}`,
        name: `Offre ${idx + 1} <test>`,
        description: idx === 1 ? '' : `Description ${idx + 1}`,
      }))

      const wizardInput: WizardFormData = {
        ...createInitialWizardState(resolved),
        businessName: 'Atelier <Test>',
        heroTitle: 'Titre principal',
        heroText: 'Accroche claire',
        items,
        phone: '',
        address: '',
        city: '',
        openingHours: 'Lun - Ven · 9h - 18h',
      }

      const { templateFormData } = transformWizardData(wizardInput, resolved)
      const html = await renderPosterHtml(htmlContent, templateFormData, def.variables)

      // CSP et échappement XSS
      assert.ok(html.includes("script-src 'none'"), `${def.id}: CSP manquante`)
      assert.equal(html.includes('<test>'), false, `${def.id}: HTML non échappé`)

      // CSS anti-cartes vides, grille auto-fit et masquage section à 0 élément
      assert.ok(
        html.includes(':has(h3:empty):has(p:empty) { display: none; }'),
        `${def.id}: règle CSS de masquage de carte vide manquante`
      )
      assert.ok(
        html.includes('repeat(auto-fit, minmax(260px, 1fr))'),
        `${def.id}: grille responsive auto-fit manquante`
      )
      assert.ok(
        html.includes('body:not(:has('),
        `${def.id}: règle CSS de masquage de section vide manquante`
      )
      assert.ok(
        html.includes('a[href="tel:"]:empty { display: none; }'),
        `${def.id}: règle CSS de masquage de lien tel vide manquante`
      )
      assert.ok(
        html.includes('footer:has(.footer-addr:empty) .footer-sep { display: none; }'),
        `${def.id}: règle CSS de masquage du séparateur footer vide manquante`
      )

      if (def.id === 'boutique') {
        assert.ok(html.includes('class="cta cta-selection" href="#selection"'))
        assert.ok(html.includes('class="cta cta-contact" href="#contact"'))
      }

      // Vérifier que les slots non remplis produisent exactement <h3></h3><p></p> (pour :empty)
      const emptyCardMatches = html.match(/<h3><\/h3><p><\/p>/g) ?? []
      assert.equal(
        emptyCardMatches.length,
        3 - count,
        `${def.id} (${count} éléments): attendu ${3 - count} slots vides, reçu ${emptyCardMatches.length}`
      )

      // Vérifier que le lien tel vide correspond bien à a[href="tel:"]:empty
      assert.ok(html.includes('href="tel:"></a>'), `${def.id}: lien tel vide mal formé`)
      assert.ok(
        html.includes('<span class="footer-addr"></span>'),
        `${def.id}: adresse footer vide mal formée`
      )
    }
  }

  console.log('Vérification Phase 2.1 réussie : 3 templates, séparation coordonnées, champs conservés et rendu 0/1/2/3 éléments validés.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

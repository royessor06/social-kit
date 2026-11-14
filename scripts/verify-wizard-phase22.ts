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
  validateWizardStep,
  type WizardFormData,
} from '../src/lib/site-builder/wizard'
import { renderPosterHtml } from '../src/lib/template'

async function runPhase22UnitAndIntegrationTests() {
  console.log('--- Lancement des tests unitaires et d’intégration Phase 2.2 ---')

  const restaurantDef = SITE_TEMPLATE_DEFINITIONS.find((t) => t.id === 'restaurant')!
  const boutiqueDef = SITE_TEMPLATE_DEFINITIONS.find((t) => t.id === 'boutique')!
  const serviceDef = SITE_TEMPLATE_DEFINITIONS.find((t) => t.id === 'service')!

  const restaurantHtml = readFileSync(
    join(process.cwd(), 'src', 'templates', 'sites', restaurantDef.templateFile),
    'utf8'
  )
  const boutiqueHtml = readFileSync(
    join(process.cwd(), 'src', 'templates', 'sites', boutiqueDef.templateFile),
    'utf8'
  )
  const serviceHtml = readFileSync(
    join(process.cwd(), 'src', 'templates', 'sites', serviceDef.templateFile),
    'utf8'
  )

  const resolvedRestaurant = resolveSiteTemplate(
    {
      id: restaurantDef.id,
      name: restaurantDef.name,
      category: restaurantDef.legacyDbCategory,
      variables: restaurantDef.variables,
      active: true,
    },
    ''
  )

  // Test 1: Validation de l'étape 1 du Wizard (Nom d'entreprise, réservations, longueur)
  const initState = createInitialWizardState(resolvedRestaurant)
  const emptyStep1Errors = validateWizardStep(1, initState, resolvedRestaurant)
  assert.ok(emptyStep1Errors.businessName, 'Nom d’entreprise obligatoire à l’étape 1')

  const invalidSlugState: WizardFormData = {
    ...initState,
    businessName: 'admin', // Nom réservé
    sector: 'Restauration',
    heroTitle: 'Titre valide',
  }
  const reservedErrors = validateWizardStep(1, invalidSlugState, resolvedRestaurant)
  assert.ok(
    reservedErrors.businessName?.includes('réservé'),
    'Les slugs réservés doivent être rejetés'
  )

  const validStep1State: WizardFormData = {
    ...invalidSlugState,
    businessName: 'Le Bon Goût Cotonou',
  }
  const validStep1Errors = validateWizardStep(1, validStep1State, resolvedRestaurant)
  assert.equal(Object.keys(validStep1Errors).length, 0, 'Les informations valides de l’étape 1 doivent passer')

  // Test 2: Validation de l'étape 2 (Couleurs hexadécimales et logo)
  const invalidColorState: WizardFormData = {
    ...validStep1State,
    primaryColor: 'not-a-hex',
    secondaryColor: '#12345g',
  }
  const colorErrors = validateWizardStep(2, invalidColorState, resolvedRestaurant)
  assert.ok(colorErrors.primaryColor, 'Couleur principale invalide rejetée')
  assert.ok(colorErrors.secondaryColor, 'Couleur secondaire invalide rejetée')

  const validColorState: WizardFormData = {
    ...invalidColorState,
    primaryColor: '#a34d32',
    secondaryColor: '#29251f',
    logoUrl: '/uploads/logo-valid.png',
  }
  assert.equal(Object.keys(validateWizardStep(2, validColorState, resolvedRestaurant)).length, 0)

  // Test 3: Validation de l'étape 5 (Téléphone, WhatsApp, e-mail, réseaux sociaux)
  const invalidContactState: WizardFormData = {
    ...validColorState,
    phone: '123', // trop court
    whatsapp: 'abc', // non numérique
    email: 'bad-email',
    socialLinks: {
      facebook: 'not-a-url',
      instagram: '',
      linkedin: '',
      website: '',
    },
  }
  const contactErrors = validateWizardStep(5, invalidContactState, resolvedRestaurant)
  assert.ok(contactErrors.phone, 'Téléphone court rejeté')
  assert.ok(contactErrors.whatsapp, 'WhatsApp non numérique rejeté')
  assert.ok(contactErrors.email, 'Email invalide rejeté')
  assert.ok(contactErrors['socialLinks.facebook'], 'URL Facebook invalide rejetée')

  const validContactState: WizardFormData = {
    ...invalidContactState,
    phone: '+229 97 00 00 00',
    whatsapp: '+229 97 11 22 33',
    email: 'contact@bongout.bj',
    socialLinks: {
      facebook: 'https://facebook.com/bongout',
      instagram: 'https://instagram.com/bongout',
      linkedin: '',
      website: 'https://bongout.bj',
    },
  }
  assert.equal(Object.keys(validateWizardStep(5, validContactState, resolvedRestaurant)).length, 0)

  // Test 4: Transformation et séparation des coordonnées (horaires, téléphone, adresse, retainedFields)
  const fullTestData: WizardFormData = {
    ...validContactState,
    activityType: 'Grillades & Bar',
    slogan: 'Le feu de bois authentique',
    shortDescription: 'Spécialités locales braisées sur place.',
    heroTitle: 'Goûtez la différence',
    heroText: 'Commandez en ligne ou venez sur place.',
    items: [
      { id: '1', name: 'Poulet braisé', description: 'Épicé à point' },
      { id: '2', name: 'Poisson capitaine', description: 'Frais du jour' },
      { id: '3', name: 'Alloco croustillant', description: 'Chaud et doré' },
    ],
    address: 'Avenue Steinmetz',
    city: 'Cotonou',
    openingHours: 'Lun - Dim : 10h - 23h',
  }

  const { templateFormData, retainedFields, unappliedLabels } = transformWizardData(
    fullTestData,
    resolvedRestaurant
  )

  assert.equal(templateFormData.telephone, '+229 97 00 00 00', 'Téléphone strictement préservé')
  assert.equal(templateFormData.adresse, 'Avenue Steinmetz, Cotonou', 'Adresse combinée proprement')
  assert.equal(templateFormData.horaires, 'Lun - Dim : 10h - 23h', 'Horaires strictement préservés sans WhatsApp ni email')
  assert.equal(templateFormData.horaires.includes('WhatsApp'), false)
  assert.equal(templateFormData.horaires.includes('contact@bongout.bj'), false)

  assert.equal(retainedFields.whatsapp, '+229 97 11 22 33')
  assert.equal(retainedFields.email, 'contact@bongout.bj')
  assert.equal(retainedFields.logoUrl, '/uploads/logo-valid.png')
  assert.equal(retainedFields.activityType, 'Grillades & Bar')
  assert.ok(unappliedLabels.includes('WhatsApp'))
  assert.ok(unappliedLabels.includes('Adresse e-mail'))
  assert.ok(unappliedLabels.includes('Logo'))

  // Test 5: Rendu HTML et gestion des éléments 0, 1, 2, 3 sur les 3 templates
  for (const { def, htmlContent, resolved } of [
    { def: restaurantDef, htmlContent: restaurantHtml, resolved: resolvedRestaurant },
    {
      def: boutiqueDef,
      htmlContent: boutiqueHtml,
      resolved: resolveSiteTemplate(
        {
          id: boutiqueDef.id,
          name: boutiqueDef.name,
          category: boutiqueDef.legacyDbCategory,
          variables: boutiqueDef.variables,
          active: true,
        },
        ''
      ),
    },
    {
      def: serviceDef,
      htmlContent: serviceHtml,
      resolved: resolveSiteTemplate(
        {
          id: serviceDef.id,
          name: serviceDef.name,
          category: serviceDef.legacyDbCategory,
          variables: serviceDef.variables,
          active: true,
        },
        ''
      ),
    },
  ]) {
    for (const count of [0, 1, 2, 3] as const) {
      const items = Array.from({ length: count }, (_, idx) => ({
        id: `item-${idx + 1}`,
        name: `Prestation ${idx + 1}`,
        description: `Description ${idx + 1}`,
      }))

      const inputData: WizardFormData = {
        ...fullTestData,
        items,
        phone: count === 0 ? '' : '+229 97 00 00 00',
        address: count === 0 ? '' : 'Quartier Haie Vive',
      }

      const { templateFormData: formData } = transformWizardData(inputData, resolved)
      const rendered = await renderPosterHtml(htmlContent, formData, def.variables)

      assert.ok(rendered.includes("script-src 'none'"), `${def.id}: CSP absente`)
      assert.ok(rendered.includes('repeat(auto-fit, minmax(260px, 1fr))'), `${def.id}: grille auto-fit absente`)
      assert.ok(rendered.includes(':has(h3:empty):has(p:empty) { display: none; }'), `${def.id}: règle carte vide absente`)

      const emptyCards = rendered.match(/<h3><\/h3><p><\/p>/g) ?? []
      assert.equal(
        emptyCards.length,
        3 - count,
        `${def.id} (${count} items): attendu ${3 - count} cartes vides masquées, reçu ${emptyCards.length}`
      )
    }
  }

  console.log('--- Tous les tests unitaires et d’intégration Phase 2.2 ont réussi avec succès ---')
}

runPhase22UnitAndIntegrationTests().catch((err) => {
  console.error('Échec des tests Phase 2.2 :', err)
  process.exit(1)
})

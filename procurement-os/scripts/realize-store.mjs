/* Replace seeded reference records with harvested real data.

   Suppliers become real legal entities from GLEIF (name, LEI, registered
   address), each screened against the real OFAC + UN lists at import. They are
   imported at state S0 with no admission checks passed: being a real registered
   company is not the same as being an approved supplier, and this script does
   not pretend otherwise.

   Country profiles gain the real FX rate and World Bank indicators. Their eight
   risk factors are desk judgements and stay labelled as such — they are inputs
   to a scoring model, not observations, and inventing a data source for them
   would be worse than saying so.

   Run: node scripts/realize-store.mjs
*/

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { loadStore, saveStore } from '../lib/data/store.mjs'
import { screenParty, dataset } from '../lib/engines/sanctions.mjs'

const ROOT = process.cwd()
const MAX_PER_COUNTRY = 4

async function readJson(name) {
  try {
    return JSON.parse(await readFile(join(ROOT, 'data', 'real', name), 'utf8'))
  } catch (error) {
    return null
  }
}

const CHECK_DEFINITIONS = [
  ['registration', 'Company registration & legal entity'],
  ['ubo', 'Ultimate beneficial ownership & directors'],
  ['contacts', 'Independent contact verification'],
  ['factory', 'Factory / manufacturer identity'],
  ['products', 'Exact products offered verified'],
  ['quality', 'Quality management system certificate'],
  ['regulatory', 'Product registration for destination market'],
  ['free_sale', 'Certificate of free sale'],
  ['origin', 'Certificate of origin'],
  ['references', 'Trade references checked'],
  ['capacity', 'Production and lead-time capacity'],
  ['financial', 'Financial standing and credit'],
  ['bank', 'Bank account verified against legal name'],
  ['sanctions', 'Sanctions and debarment screening'],
  ['conflict', 'Conflict of interest declared'],
]

function unassessed() {
  return CHECK_DEFINITIONS.map(([id, label]) => ({
    id,
    label,
    passed: false,
    evidence: null,
    note: 'Not assessed. Imported from the legal-entity registry; admission has not been performed.',
  }))
}

function supplierFromEntity(entity, index, sanctions, listed) {
  const checks = unassessed()
  /* Two checks are genuinely evidenced by the import itself: the GLEIF record
     establishes the legal entity, and the screening was actually run. Nothing
     else is asserted - ownership, contacts and bank ownership were not
     verified, so those checks stay unassessed and the supplier stays S0. */
  const registration = checks.find((c) => c.id === 'registration')
  if (entity.lei && registration) {
    registration.passed = true
    registration.evidence = 'GLEIF LEI ' + entity.lei + ' (registry status ' + (entity.status || 'unknown') + ')'
    registration.note = 'Legal-entity record retrieved from the GLEIF registry. Ownership, contacts and bank details were not verified.'
    registration.source = entity.source_url
    registration.recordedAt = new Date().toISOString()
  }
  const screening = checks.find((c) => c.id === 'sanctions')
  if (screening) {
    screening.passed = sanctions.status === 'clear'
    screening.evidence =
      sanctions.status === 'clear'
        ? 'Screened ' + new Date().toISOString().slice(0, 10) + ' against OFAC SDN and UN consolidated (' + listed + ' listed entries); no match above threshold.'
        : null
    screening.note = sanctions.reason
    screening.source = 'OFAC SDN + UN consolidated'
    screening.recordedAt = new Date().toISOString()
  }

  return {
    id: 'SUP-' + String(entity.lei || index).slice(-8).toUpperCase(),
    legalName: entity.name,
    lei: entity.lei,
    country: entity.country,
    city: entity.city,
    registeredAddress: entity.address,
    registeredAs: entity.registered_as || null,
    registryStatus: entity.status || null,
    roles: ['supplier'],
    state: 'S0',
    sectorCodes: [],
    products: [],
    notes:
      'Real legal entity from the GLEIF LEI registry (' + entity.lei + '), screened on import against the OFAC SDN and UN consolidated lists. '
      + 'Only the registry record and the screening are evidenced; no admission checks beyond those have been performed, so the supplier is S0 and cannot be used for a bid until qualified.',
    beneficiary: null,
    performance: null,
    checks,
    sanctionsStatus: sanctions.status,
    sanctionsReason: sanctions.reason,
    sanctionsCheckedAt: new Date().toISOString(),
    screeningMatches: (sanctions.matches ?? []).slice(0, 5).map((match) => ({
      source: match.entry.source,
      reference: match.entry.id,
      name: match.entry.name,
      similarity: match.similarity,
      status: sanctions.status,
    })),
    source: { registry: 'GLEIF', url: entity.source_url, importedAt: new Date().toISOString() },
  }
}

async function main() {
  const entities = await readJson('entities.json')
  const fx = await readJson('fx.json')
  const countryRisk = await readJson('country-risk.json')

  if (!entities || !Array.isArray(entities.entries) || entities.entries.length === 0) {
    console.error('No data/real/entities.json. Run `npm run harvest` first.')
    process.exit(1)
  }

  const loaded = dataset()
  if (!loaded.available) {
    console.error('No sanctions dataset; refusing to import suppliers that cannot be screened.')
    process.exit(1)
  }

  const store = loadStore()
  const previous = store.suppliers ?? []

  /* Old id -> country, so opportunity links survive the swap. */
  const oldCountry = new Map(previous.map((supplier) => [supplier.id, supplier.country]))

  const chosen = []
  const perCountry = {}
  for (const entity of entities.entries) {
    const used = perCountry[entity.country] ?? 0
    if (used >= MAX_PER_COUNTRY) continue
    perCountry[entity.country] = used + 1
    chosen.push(entity)
  }

  const suppliers = chosen.map((entity, index) => {
    const screening = screenParty({ legalName: entity.name, country: entity.country })
    return supplierFromEntity(entity, index, screening, loaded.counts.total)
  })

  /* Re-point each opportunity at a real supplier in the same country, keeping
     the old link when no entity exists for that country so nothing silently
     disappears. */
  const byCountry = new Map()
  for (const supplier of suppliers) {
    if (!byCountry.has(supplier.country)) byCountry.set(supplier.country, [])
    byCountry.get(supplier.country).push(supplier.id)
  }

  let relinked = 0
  let orphaned = 0
  for (const opportunity of store.opportunities ?? []) {
    const ids = opportunity.links?.supplierIds ?? []
    if (!ids.length) continue
    const countries = ids.map((id) => oldCountry.get(id)).filter(Boolean)
    if (!countries.length) continue
    const replacement = countries.map((code) => (byCountry.get(code) ?? [])[0]).filter(Boolean)
    if (replacement.length) {
      opportunity.links.supplierIds = [...new Set(replacement)]
      opportunity.supplierLinkNote = 'Re-pointed to a real GLEIF entity in the same country; supplier is S0 and unqualified.'
      relinked += 1
    } else {
      /* No entity was imported for that country. A dangling id would silently
         point at a supplier that does not exist, so the link is cleared and the
         gap is recorded instead. */
      opportunity.links.supplierIds = []
      opportunity.supplierLinkNote =
        'Supplier link cleared: no real GLEIF entity was imported for ' + [...new Set(countries)].join(', ') + '. The opportunity has no qualified supplier.'
      orphaned += 1
    }
  }

  /* Operational records (contracts, POs, shipments, invoices, payments,
     screenings, approvals, correspondence) referenced the synthetic supplier
     ids. Re-point them by country so the realised store has no dangling
     references. Names are rewritten too, otherwise the beneficiary and
     three-way-match controls would fire on a record that is merely stale. */
  const oldById = new Map(previous.map((supplier) => [supplier.id, supplier]))
  const newIds = new Set(suppliers.map((supplier) => supplier.id))
  const replacementFor = new Map()
  for (const supplier of previous) {
    if (newIds.has(supplier.id)) continue
    const replacement = (byCountry.get(supplier.country) ?? [])[0]
    if (replacement) replacementFor.set(supplier.id, replacement)
  }
  const newById = new Map(suppliers.map((supplier) => [supplier.id, supplier]))
  const remapId = (id) => replacementFor.get(id) ?? id
  const newName = (id) => newById.get(remapId(id))?.legalName ?? null

  let rewritten = 0
  const noteRewrite = (record, before, after) => {
    if (before && after && before !== after) rewritten += 1
  }

  for (const contract of store.contracts ?? []) {
    const before = contract.supplierId
    contract.supplierId = remapId(contract.supplierId)
    noteRewrite(contract, before, contract.supplierId)
  }

  for (const po of store.purchaseOrders ?? []) {
    const before = po.supplierId
    po.supplierId = remapId(po.supplierId)
    const name = newName(po.supplierId)
    if (name && po.supplierId !== before) po.beneficiaryName = name
    noteRewrite(po, before, po.supplierId)
  }

  for (const shipment of store.shipments ?? []) {
    const before = shipment.supplierId
    shipment.supplierId = remapId(shipment.supplierId)
    const name = newName(shipment.supplierId)
    if (name && shipment.supplierId !== before) shipment.exporterOfRecord = name
    noteRewrite(shipment, before, shipment.supplierId)
  }

  for (const invoice of store.invoices ?? []) {
    const before = invoice.supplierId
    invoice.supplierId = remapId(invoice.supplierId)
    const name = newName(invoice.supplierId)
    if (name && invoice.supplierId !== before) invoice.beneficiaryName = name
    noteRewrite(invoice, before, invoice.supplierId)
  }

  for (const payment of store.payments ?? []) {
    const before = payment.supplierId
    payment.supplierId = remapId(payment.supplierId)
    const name = newName(payment.supplierId)
    if (name && payment.supplierId !== before) payment.beneficiaryName = name
    noteRewrite(payment, before, payment.supplierId)
  }

  for (const screening of store.screenings ?? []) {
    const before = screening.supplierId
    screening.supplierId = remapId(screening.supplierId)
    const name = newName(screening.supplierId)
    if (name && screening.supplierId !== before) screening.party = name
    noteRewrite(screening, before, screening.supplierId)
  }

  for (const message of store.communications ?? []) {
    if (!message.supplierId) continue
    const before = message.supplierId
    const remapped = remapId(before)
    if (newIds.has(remapped)) {
      message.supplierId = remapped
      noteRewrite(message, before, remapped)
    } else {
      message.supplierId = null
      message.supplierLinkNote = 'Supplier record removed: no real GLEIF entity was imported for that country.'
      rewritten += 1
    }
  }

  for (const approval of store.approvals ?? []) {
    const before = approval.subjectId
    approval.subjectId = remapId(approval.subjectId)
    if (approval.subjectId !== before) {
      const old = oldById.get(before)
      const name = newName(approval.subjectId)
      if (old && name) approval.subjectLabel = String(approval.subjectLabel ?? '').split(old.legalName).join(name)
      rewritten += 1
    }
  }

  for (const exception of store.exceptions ?? []) {
    const before = exception.subjectId
    exception.subjectId = remapId(exception.subjectId)
    noteRewrite(exception, before, exception.subjectId)
  }

  /* Evidence-vault documents are held against a legal-entity name. */
  const nameMap = new Map()
  for (const [oldId, newId] of replacementFor) {
    const old = oldById.get(oldId)
    const name = newById.get(newId)?.legalName
    if (old?.legalName && name) nameMap.set(old.legalName, name)
  }
  for (const document of store.documents ?? []) {
    for (const field of ['legalEntity', 'holderName']) {
      if (document[field] && nameMap.has(document[field])) {
        document[field] = nameMap.get(document[field])
        rewritten += 1
      }
    }
  }

  /* Real FX and World Bank indicators onto the country profile. */
  let enriched = 0
  if (fx || countryRisk) {
    for (const country of store.countries ?? []) {
      const iso3 = { NG: 'NGA', KE: 'KEN', ZA: 'ZAF', GH: 'GHA', DE: 'DEU', NL: 'NLD', GB: 'GBR', CN: 'CHN', IN: 'IND', AE: 'ARE', US: 'USA', TR: 'TUR' }[country.code]
      /* FX rates are keyed by currency, not by country. */
      const currency = { NG: 'NGN', KE: 'KES', ZA: 'ZAR', GH: 'GHS', DE: 'EUR', NL: 'EUR', GB: 'GBP', CN: 'CNY', IN: 'INR', AE: 'AED', US: 'USD', TR: 'TRY' }[country.code]
      const rates = fx && fx.rates ? fx.rates : {}
      if (currency && rates[currency]) {
        country.fx = { currency, perUsd: rates[currency], asOf: fx.as_of, provider: fx.provider }
        enriched += 1
      }
      const indicators = countryRisk && countryRisk.indicators && countryRisk.indicators[iso3]
      if (indicators) {
        country.indicators = {
          source: 'World Bank Open Data',
          gdpPerCapitaUsd: indicators.gdp_per_capita_usd ?? null,
          population: indicators.population ?? null,
          tradePctGdp: indicators.trade_pct_gdp ?? null,
          unemploymentPct: indicators.unemployment_pct ?? null,
          healthSpendPctGdp: indicators.health_spend_pct_gdp ?? null,
        }
      }
      country.factorNote = 'The eight risk factors are desk judgements used by the scoring model; they are not observations. FX and indicators below are real.'
    }
  }

  store.suppliers = suppliers
  store.meta = {
    ...(store.meta ?? {}),
    referenceData: {
      suppliers: { source: 'GLEIF', importedAt: new Date().toISOString(), count: suppliers.length },
      sanctions: { source: 'OFAC SDN + UN consolidated', generatedAt: loaded.generatedAt, entries: loaded.counts.total },
      fx: fx ? { source: fx.provider, asOf: fx.as_of } : null,
      worldBank: countryRisk ? { generatedAt: countryRisk.generated_at } : null,
    },
  }

  saveStore(store)

  const flagged = suppliers.filter((supplier) => supplier.sanctionsStatus !== 'clear')
  console.log('suppliers imported   ' + suppliers.length + ' from GLEIF across ' + Object.keys(perCountry).length + ' countries')
  console.log('screened             ' + suppliers.length + ' against ' + loaded.counts.total + ' listed entries')
  console.log('potential matches    ' + flagged.length + (flagged.length ? ': ' + flagged.map((s) => s.legalName).join(', ') : ''))
  console.log('opportunities linked ' + relinked + (orphaned ? ', ' + orphaned + ' link(s) cleared (no entity in that country)' : ''))
  console.log('operational records  ' + rewritten + ' supplier reference(s) re-pointed to real entities')
  console.log('countries enriched   ' + enriched + ' with FX, ' + (store.countries ?? []).filter((c) => c.indicators).length + ' with World Bank indicators')
}

main().catch((error) => {
  console.error('realize failed: ' + error.message)
  process.exit(1)
})

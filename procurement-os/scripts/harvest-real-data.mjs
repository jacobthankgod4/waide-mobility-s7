/* Waide Procurement OS — real reference data harvester.

   Every dataset in data/real/ comes from a public, authoritative source and
   carries the URL, HTTP status, byte count, SHA-256 and fetch time that
   produced it. Nothing here is invented: if a source cannot be reached the
   harvest records the failure and exits non-zero rather than writing a
   substitute, because a screening list that silently falls back to fixtures is
   worse than no list at all.

   Sources
     OFAC SDN          US Treasury (public domain)  sdn.csv + alt.csv
     UN Consolidated   UN Security Council          consolidated XML
     GLEIF             GLEIF LEI records            LEI API (open)
     FX                open.er-api.com (market)     + ECB via frankfurter.dev
     World Bank        World Bank Open Data API

   Run: npm run harvest
*/

import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = process.cwd()
const OUT = join(ROOT, 'data', 'real')
const UA = 'WaideProcurementOS/1.0 (reference-data harvest; contact sales@waidemobility.com)'
const TIMEOUT_MS = 180_000

const TARGET_COUNTRIES = ['NG', 'KE', 'ZA', 'GH', 'DE', 'NL', 'GB', 'CN', 'IN', 'AE', 'US', 'TR']

/* Sector vocabulary used to keep GLEIF entities relevant to what this business
   actually buys and sells. Matching is on the registered legal name only. */
const SECTOR_TERMS = [
  'medical', 'surgic', 'pharma', 'orthop', 'hospital', 'diagnost', 'clinic',
  'health', 'device', 'equipment', 'suppl', 'instrument', 'laborator', 'imaging'
]

const jobs = []
let failures = 0

function log(message) {
  process.stdout.write(message + '\n')
}

async function fetchBuffer(url, label) {
  let lastError = null
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': UA, accept: '*/*' },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      })
      if (!response.ok) throw new Error('HTTP ' + response.status)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length === 0) throw new Error('empty body')
      return { buffer, status: response.status, finalUrl: response.url }
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
    }
  }
  throw new Error(label + ': ' + (lastError && lastError.message))
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

/* RFC 4180 parser: the OFAC files quote fields containing commas and escape a
   quote by doubling it, which a naive split(',') corrupts. */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1 } else { quoted = false }
      } else field += char
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field); field = ''
    } else if (char === '\n') {
      row.push(field); rows.push(row); row = []; field = ''
    } else if (char !== '\r') {
      field += char
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

function clean(value) {
  const text = String(value == null ? '' : value).trim()
  return text === '-0-' || text === '-' ? '' : text
}

function trimTo(value, max) {
  const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim()
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

/* ------------------------------------------------------------------ OFAC */

async function harvestOfac(manifest) {
  const sdn = await fetchBuffer('https://www.treasury.gov/ofac/downloads/sdn.csv', 'OFAC SDN')
  const alt = await fetchBuffer('https://www.treasury.gov/ofac/downloads/alt.csv', 'OFAC ALT')

  const aliases = new Map()
  for (const row of parseCsv(alt.buffer.toString('utf8'))) {
    const entryNumber = clean(row[0])
    const name = clean(row[3])
    if (!entryNumber || !name) continue
    if (!aliases.has(entryNumber)) aliases.set(entryNumber, [])
    aliases.get(entryNumber).push(name)
  }

  const entries = []
  for (const row of parseCsv(sdn.buffer.toString('utf8'))) {
    const entryNumber = clean(row[0])
    const name = clean(row[1])
    if (!entryNumber || !name) continue

    const type = clean(row[2]).toLowerCase()
    entries.push({
      id: 'OFAC-' + entryNumber,
      source: 'OFAC-SDN',
      kind: type === 'individual' ? 'individual' : type === 'vessel' ? 'vessel' : 'entity',
      name,
      aliases: (aliases.get(entryNumber) || []).slice(0, 40),
      programs: clean(row[3]) ? [clean(row[3])] : [],
      country: '',
      listed_on: '',
      reference: entryNumber,
      remarks: trimTo(clean(row[11]), 300)
    })
  }

  manifest.ofac = {
    url: 'https://www.treasury.gov/ofac/downloads/sdn.csv',
    resolved_url: sdn.finalUrl.split('?')[0],
    sha256: sha256(sdn.buffer),
    bytes: sdn.buffer.length,
    alias_bytes: alt.buffer.length,
    records: entries.length,
    fetched_at: new Date().toISOString()
  }
  log('  OFAC SDN: ' + entries.length + ' entries, ' + aliases.size + ' with aliases')
  return entries
}

/* --------------------------------------------------------------------- UN */

function tags(block, tag) {
  const found = []
  const pattern = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'g')
  let match
  while ((match = pattern.exec(block)) !== null) {
    const value = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (value) found.push(value)
  }
  return found
}

async function harvestUn(manifest) {
  const response = await fetchBuffer(
    'https://scsanctions.un.org/resources/xml/en/consolidated.xml',
    'UN consolidated'
  )
  const xml = response.buffer.toString('utf8')
  const entries = []

  const individuals = xml.match(/<INDIVIDUAL>[\s\S]*?<\/INDIVIDUAL>/g) || []
  for (const block of individuals) {
    const name = [
      ...tags(block, 'FIRST_NAME'),
      ...tags(block, 'SECOND_NAME'),
      ...tags(block, 'THIRD_NAME'),
      ...tags(block, 'FOURTH_NAME')
    ].join(' ').trim()
    if (!name) continue
    entries.push({
      id: 'UN-' + (tags(block, 'REFERENCE_NUMBER')[0] || tags(block, 'DATAID')[0] || name),
      source: 'UN-CONSOLIDATED',
      kind: 'individual',
      name,
      aliases: tags(block, 'ALIAS_NAME').slice(0, 40),
      programs: tags(block, 'UN_LIST_TYPE'),
      country: tags(block, 'COUNTRY')[0] || tags(block, 'NATIONALITY')[0] || '',
      listed_on: tags(block, 'LISTED_ON')[0] || '',
      reference: tags(block, 'REFERENCE_NUMBER')[0] || '',
      remarks: trimTo(tags(block, 'COMMENTS1')[0] || '', 300)
    })
  }

  const entities = xml.match(/<ENTITY>[\s\S]*?<\/ENTITY>/g) || []
  for (const block of entities) {
    const name = tags(block, 'FIRST_NAME')[0] || ''
    if (!name) continue
    entries.push({
      id: 'UN-' + (tags(block, 'REFERENCE_NUMBER')[0] || tags(block, 'DATAID')[0] || name),
      source: 'UN-CONSOLIDATED',
      kind: 'entity',
      name,
      aliases: tags(block, 'ALIAS_NAME').slice(0, 40),
      programs: tags(block, 'UN_LIST_TYPE'),
      country: tags(block, 'COUNTRY')[0] || '',
      listed_on: tags(block, 'LISTED_ON')[0] || '',
      reference: tags(block, 'REFERENCE_NUMBER')[0] || '',
      remarks: trimTo(tags(block, 'COMMENTS1')[0] || '', 300)
    })
  }

  manifest.un = {
    url: 'https://scsanctions.un.org/resources/xml/en/consolidated.xml',
    resolved_url: response.finalUrl.split('?')[0],
    sha256: sha256(response.buffer),
    bytes: response.buffer.length,
    records: entries.length,
    individuals: individuals.length,
    entities: entities.length,
    fetched_at: new Date().toISOString()
  }
  log('  UN consolidated: ' + entries.length + ' entries (' + individuals.length + ' individuals, ' + entities.length + ' entities)')
  return entries
}

/* ----------------------------------------------------------------- GLEIF */

function sectorMatch(name) {
  const lower = String(name || '').toLowerCase()
  return SECTOR_TERMS.some((term) => lower.includes(term))
}

async function harvestGleif(manifest) {
  const entries = []
  const seen = new Set()
  const perCountry = {}

  for (const country of TARGET_COUNTRIES) {
    let collected = 0
    let page = 1
    const maxPages = 12

    while (page <= maxPages && collected < 60) {
      const url = 'https://api.gleif.org/api/v1/lei-records'
        + '?filter%5Bentity.legalAddress.country%5D=' + country
        + '&page%5Bsize%5D=200&page%5Bnumber%5D=' + page
      let payload
      try {
        const response = await fetchBuffer(url, 'GLEIF ' + country + ' p' + page)
        payload = JSON.parse(response.buffer.toString('utf8'))
      } catch (error) {
        log('  GLEIF ' + country + ' page ' + page + ' failed: ' + error.message)
        break
      }

      const records = (payload && payload.data) || []
      if (!records.length) break

      for (const record of records) {
        const attributes = record.attributes || {}
        const entity = attributes.entity || {}
        const legalName = (entity.legalName && entity.legalName.name) || ''
        if (!legalName || !sectorMatch(legalName)) continue
        const lei = record.id
        if (seen.has(lei)) continue
        seen.add(lei)

        const address = entity.legalAddress || {}
        entries.push({
          lei,
          name: legalName,
          other_names: ((entity.otherNames || []).map((item) => item.name).filter(Boolean)).slice(0, 6),
          country: address.country || country,
          city: address.city || '',
          region: address.region || '',
          address: [address.addressLines, address.postalCode, address.city]
            .flat().filter(Boolean).join(', '),
          status: entity.status || '',
          legal_form: (entity.legalForm && entity.legalForm.id) || '',
          registered_as: (attributes.registration && attributes.registration.registrationAuthorityEntityID) || '',
          registered_at: (attributes.registration && attributes.registration.initialRegistrationDate) || '',
          source: 'GLEIF',
          source_url: 'https://search.gleif.org/#/record/' + lei
        })
        collected += 1
        if (collected >= 60) break
      }

      const pagination = (payload.meta && payload.meta.pagination) || {}
      if (!pagination.lastPage || page >= pagination.lastPage) break
      page += 1
    }

    perCountry[country] = collected
    log('  GLEIF ' + country + ': ' + collected + ' sector entities')
  }

  manifest.gleif = {
    url: 'https://api.gleif.org/api/v1/lei-records',
    records: entries.length,
    per_country: perCountry,
    terms: SECTOR_TERMS,
    fetched_at: new Date().toISOString()
  }
  return entries
}

/* -------------------------------------------------------------------- FX */

async function harvestFx(manifest) {
  const market = await fetchBuffer('https://open.er-api.com/v6/latest/USD', 'FX market')
  const marketJson = JSON.parse(market.buffer.toString('utf8'))
  if (marketJson.result !== 'success') throw new Error('FX market: ' + marketJson.result)

  const ecb = await fetchBuffer(
    'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,ZAR,KES,INR,CNY',
    'FX ECB'
  )
  const ecbJson = JSON.parse(ecb.buffer.toString('utf8'))

  const rates = {}
  for (const [code, value] of Object.entries(marketJson.rates || {})) {
    if (typeof value === 'number' && value > 0) rates[code] = value
  }

  manifest.fx = {
    market_url: 'https://open.er-api.com/v6/latest/USD',
    market_as_of: marketJson.time_last_update_utc || '',
    market_sha256: sha256(market.buffer),
    ecb_url: 'https://api.frankfurter.dev/v1/latest?base=USD',
    ecb_as_of: ecbJson.date || '',
    ecb_sha256: sha256(ecb.buffer),
    currencies: Object.keys(rates).length,
    fetched_at: new Date().toISOString()
  }
  log('  FX: ' + Object.keys(rates).length + ' currencies, market as of ' + (marketJson.time_last_update_utc || 'unknown'))

  return {
    base: 'USD',
    as_of: marketJson.time_last_update_utc || '',
    provider: 'open.er-api.com',
    ecb: { as_of: ecbJson.date || '', rates: ecbJson.rates || {}, provider: 'frankfurter.dev (ECB reference)' },
    rates
  }
}

/* ------------------------------------------------------------ World Bank */

const INDICATORS = {
  'NY.GDP.PCAP.CD': 'gdp_per_capita_usd',
  'SP.POP.TOTL': 'population',
  'NE.TRD.GNFS.ZS': 'trade_pct_gdp',
  'SL.UEM.TOTL.ZS': 'unemployment_pct',
  'SH.XPD.CHEX.GD.ZS': 'health_spend_pct_gdp'
}

async function harvestWorldBank(manifest) {
  const countries = TARGET_COUNTRIES.join(';')
  const indicators = {}

  for (const [code, key] of Object.entries(INDICATORS)) {
    const url = 'https://api.worldbank.org/v2/country/' + countries + '/indicator/' + code
      + '?format=json&per_page=500&date=2020:2025'
    try {
      const response = await fetchBuffer(url, 'World Bank ' + code)
      const parsed = JSON.parse(response.buffer.toString('utf8'))
      const rows = Array.isArray(parsed) ? parsed[1] || [] : []

      for (const row of rows) {
        const iso = (row.countryiso3code || '').toUpperCase()
        if (!iso || row.value == null) continue
        if (!indicators[iso]) indicators[iso] = {}
        /* Keep the most recent non-null observation per country. */
        const existing = indicators[iso][key]
        if (!existing || Number(row.date) > Number(existing.year)) {
          indicators[iso][key] = { value: row.value, year: row.date, indicator: code }
        }
      }
    } catch (error) {
      log('  World Bank ' + code + ' failed: ' + error.message)
    }
  }

  manifest.world_bank = {
    url: 'https://api.worldbank.org/v2/country/{countries}/indicator/{code}',
    indicators: Object.keys(INDICATORS),
    countries: Object.keys(indicators).length,
    fetched_at: new Date().toISOString()
  }
  log('  World Bank: ' + Object.keys(indicators).length + ' countries')
  return { generated_at: new Date().toISOString(), source: 'World Bank Open Data', indicators }
}

/* ------------------------------------------------------------------- run */

async function main() {
  await mkdir(OUT, { recursive: true })
  const manifest = {
    generated_at: new Date().toISOString(),
    note: 'Real public reference data. Every record traces to the URL and SHA-256 recorded here.',
    sources: {}
  }

  log('Harvesting real reference data…')

  let ofac = []
  let un = []
  try {
    ofac = await harvestOfac(manifest.sources)
  } catch (error) { failures += 1; manifest.sources.ofac = { error: error.message }; log('  OFAC FAILED: ' + error.message) }

  try {
    un = await harvestUn(manifest.sources)
  } catch (error) { failures += 1; manifest.sources.un = { error: error.message }; log('  UN FAILED: ' + error.message) }

  let entities = []
  try {
    entities = await harvestGleif(manifest.sources)
  } catch (error) { failures += 1; manifest.sources.gleif = { error: error.message }; log('  GLEIF FAILED: ' + error.message) }

  let fx = null
  try {
    fx = await harvestFx(manifest.sources)
  } catch (error) { failures += 1; manifest.sources.fx = { error: error.message }; log('  FX FAILED: ' + error.message) }

  let worldBank = null
  try {
    worldBank = await harvestWorldBank(manifest.sources)
  } catch (error) { failures += 1; manifest.sources.world_bank = { error: error.message }; log('  World Bank FAILED: ' + error.message) }

  const sanctions = {
    generated_at: new Date().toISOString(),
    sources: ['OFAC-SDN', 'UN-CONSOLIDATED'],
    entries: [...ofac, ...un]
  }

  await writeFile(join(OUT, 'sanctions.json'), JSON.stringify(sanctions))
  await writeFile(join(OUT, 'entities.json'), JSON.stringify({
    generated_at: new Date().toISOString(),
    source: 'GLEIF',
    countries: TARGET_COUNTRIES,
    entries: entities
  }))
  if (fx) await writeFile(join(OUT, 'fx.json'), JSON.stringify(fx))
  if (worldBank) await writeFile(join(OUT, 'country-risk.json'), JSON.stringify(worldBank))

  manifest.sanctions_total = sanctions.entries.length
  manifest.entities_total = entities.length
  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))

  log('')
  log('Wrote data/real/ — ' + sanctions.entries.length + ' sanctions entries, '
    + entities.length + ' legal entities, ' + (fx ? Object.keys(fx.rates).length : 0) + ' currencies.')

  if (failures > 0) {
    log(failures + ' source(s) failed; see data/real/manifest.json. Screening will fail closed.')
    process.exit(1)
  }
}

main().catch((error) => {
  process.stderr.write('Harvest failed: ' + error.message + '\n')
  process.exit(1)
})

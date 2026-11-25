/* Requirement and commercial-term extraction.

   Every value carries the page and the line it came from, so a person can
   check it. A field that is not found stays null and is listed in `missing`:
   the bid gate treats a missing term as unknown, and unknown blocks a bid.
   Nothing here invents a value to fill a table. */

const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
const CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR', 'GHS', 'CNY', 'INR', 'AED', 'TRY']

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12
}

function isoDate(year, month, day) {
  const y = Number(year) < 100 ? 2000 + Number(year) : Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!(m >= 1 && m <= 12) || !(d >= 1 && d <= 31)) return null
  return String(y) + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0')
}

function findDate(line) {
  let match = /\b(\d{4})-(\d{2})-(\d{2})\b/.exec(line)
  if (match) return isoDate(match[1], match[2], match[3])

  match = /\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\b/.exec(line)
  if (match) {
    const first = Number(match[1])
    const second = Number(match[2])
    /* Day-first is the convention in the markets this business trades in. */
    const day = first > 12 ? first : second > 12 ? second : first
    const month = first > 12 ? second : second > 12 ? first : second
    return isoDate(match[3], month, day)
  }

  match = /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec)[a-z]*\.?,?\s+(\d{4})\b/i.exec(line)
  if (match) return isoDate(match[3], MONTHS[match[2].toLowerCase()], match[1])

  match = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/i.exec(line)
  if (match) return isoDate(match[3], MONTHS[match[1].toLowerCase()], match[2])

  return null
}

function toNumber(raw) {
  const cleaned = String(raw).replace(/[,\s]/g, '')
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

/* A line is scanned by several rules; each rule returns a candidate with the
   specificity of its match as the confidence. The most specific wins. */
function scanLines(pages, rules) {
  const results = []

  for (const page of pages) {
    page.lines.forEach((line, index) => {
      for (const rule of rules) {
        const match = rule.pattern.exec(line)
        if (!match) continue
        const value = rule.parse ? rule.parse(match, line) : match[0]
        if (value == null || value === '') continue
        results.push({
          field: rule.field,
          value,
          page: page.number,
          line: index + 1,
          snippet: line.length > 220 ? line.slice(0, 219) + '…' : line,
          method: rule.method || 'pattern',
          confidence: rule.confidence,
          rule: rule.id
        })
      }
    })
  }

  return results
}

function bestByField(candidates) {
  const chosen = {}
  for (const candidate of candidates) {
    const current = chosen[candidate.field]
    if (!current || candidate.confidence > current.confidence) chosen[candidate.field] = candidate
  }
  return chosen
}

export function extractRequirements(pages, text) {
  const candidates = []
  const lower = String(text || '').toLowerCase()

  /* ---- Incoterms 2020, with the named place when it is on the same line ----
     The word after the three-letter term is only a place if it reads like one:
     "FCA prices shall be…" must not record "prices" as a delivery point. */
  const NOT_A_PLACE = /\b(prices?|quotation|terms?|shall|will|and|or|the|of|to|in|on|at|is|are|be|incoterms?|rules?|edition|clause|section|basis|per|as|for|with|from|by|this|that|which|applicable|governed)\b/i

  candidates.push(...scanLines(pages, [{
    id: 'incoterm',
    field: 'incoterm',
    method: 'pattern',
    confidence: 0.85,
    pattern: new RegExp('\\b(' + INCOTERMS.join('|') + ')\\b(?:\\s+([A-Z][A-Za-z .,\'\\-/]{2,40}))?', 'i'),
    parse: (match) => {
      const rawPlace = match[2] ? match[2].replace(/\s+/g, ' ').trim().replace(/[.,;]$/, '') : null
      const place = rawPlace && !NOT_A_PLACE.test(rawPlace) ? rawPlace : null
      return {
        term: match[1].toUpperCase(),
        place,
        valid: INCOTERMS.includes(match[1].toUpperCase()),
        placeEvidence: rawPlace && !place ? 'word after term was not a place: "' + rawPlace + '"' : null
      }
    }
  }]))

  /* ---- HS / commodity codes ---- */
  candidates.push(...scanLines(pages, [
    {
      id: 'hs-dotted',
      field: 'hs_code',
      method: 'pattern',
      confidence: 0.9,
      pattern: /\bHS\s*(?:code|no\.?|number|tariff)?\s*[:#]?\s*(\d{4}[.\s]?\d{2}(?:[.\s]?\d{2})?)\b/i,
      parse: (match) => match[1].replace(/[.\s]/g, '')
    },
    {
      id: 'hs-plain',
      field: 'hs_code',
      method: 'pattern',
      confidence: 0.6,
      pattern: /\b(\d{4}\.\d{2}(?:\.\d{2})?)\b/,
      parse: (match) => match[1].replace(/\./g, '')
    }
  ]))

  /* ---- Quantities with a unit ---- */
  candidates.push(...scanLines(pages, [{
    id: 'quantity',
    field: 'quantity',
    method: 'pattern',
    confidence: 0.8,
    pattern: /\b(\d[\d,]*(?:\.\d+)?)\s*(units?|pcs|pieces?|sets?|boxes?|cartons?|kgs?|kilograms?|tonnes?|tons?|litres?|liters?|packs?|bottles?|vials?|pairs?|rolls?|kits?|machines?|vehicles?|beds?|chairs?|laptops?|computers?|printers?|bags?|metres?|meters?)\b/i,
    parse: (match) => ({
      amount: toNumber(match[1]),
      unit: match[2].toLowerCase().replace(/s$/, '')
    })
  }]))

  /* ---- Money ---- */
  candidates.push(...scanLines(pages, [{
    id: 'amount',
    field: 'amount',
    method: 'pattern',
    confidence: 0.75,
    pattern: new RegExp('\\b(' + CURRENCY_CODES.join('|') + ')\\s?([\\d,]+(?:\\.\\d{2})?)\\b|\\u20a6\\s?([\\d,]+(?:\\.\\d{2})?)'),
    parse: (match) => ({
      currency: match[1] ? match[1].toUpperCase() : 'NGN',
      value: toNumber(match[2] || match[3])
    })
  }]))

  /* ---- Dated terms: closing, delivery, validity, quotation date ----
     Tenders break a sentence over two lines ("…no later than" then
     "17 February 2025"), so the keyword is looked for in the previous line as
     well; the citation stays on the line that carries the date. */
  for (const page of pages) {
    page.lines.forEach((line, index) => {
      const date = findDate(line)
      if (!date) return
      const previous = index > 0 ? page.lines[index - 1] : ''
      const lowerLine = (previous + ' ' + line).toLowerCase()

      let field = null
      if (/clos(e|ing)|deadline|due date|submission|submit (by|before)|bid opening|no later than|not later than|latest by|received by|responses? (are )?due/.test(lowerLine)) field = 'closing_date'
      else if (/deliver|dispatch|shipment|arrival|lead time|eta\b/.test(lowerLine)) field = 'delivery_date'
      else if (/valid|expir|offer (is|remains)/.test(lowerLine)) field = 'validity_date'
      else if (/invoice date|date of issue|issued on|quotation date/.test(lowerLine)) field = 'issue_date'
      else if (/manufactur|production|expiry|best before/.test(lowerLine)) field = 'expiry_date'

      if (!field) return
      candidates.push({
        field,
        value: date,
        page: page.number,
        line: index + 1,
        snippet: line.length > 220 ? line.slice(0, 219) + '…' : line,
        method: 'dated-term',
        confidence: 0.8,
        rule: field
      })
    })
  }

  /* ---- Payment terms ----
     A line that names a mechanism (LC, advance, days) is worth more than a
     heading that merely says "Payment". */
  candidates.push(...scanLines(pages, [{
    id: 'payment-strong',
    field: 'payment_terms',
    method: 'pattern',
    confidence: 0.9,
    pattern: /\b(?:payment|paid|payable)\b[^.\n]{0,160}?\b(?:within\s+\d+\s+(?:calendar\s+)?days?|in advance|advance payment|letter of credit|\bLC\b|irrevocable|against (?:delivery|invoice)|net\s+\d+|100%\s+(?:in advance|against))[^.\n]{0,80}/i
  }, {
    id: 'payment-weak',
    field: 'payment_terms',
    method: 'pattern',
    confidence: 0.55,
    pattern: /\b(?:payment terms?|terms? of payment)\b[^.\n]{0,120}/i
  }]))

  /* ---- Bid / performance security ---- */
  candidates.push(...scanLines(pages, [{
    id: 'security',
    field: 'bid_security',
    method: 'pattern',
    confidence: 0.85,
    pattern: /(?:bid|tender|performance)\s+(?:security|bond|guarantee)[^.\n]{0,140}/i
  }]))

  /* ---- Validity in days ---- */
  candidates.push(...scanLines(pages, [{
    id: 'validity-days',
    field: 'validity_days',
    method: 'pattern',
    confidence: 0.85,
    pattern: /valid(?:ity)?\s*(?:for|of|:)?\s*(\d{2,3})\s*(?:calendar\s*)?days/i,
    parse: (match) => Number(match[1])
  }]))

  /* ---- Eligibility and certification requirements ---- */
  const eligibilityTerms = [
    'iso 13485', 'iso 9001', 'iso 14001', 'ce mark', 'ce marking', 'fda', 'nafdac', 'soncap',
    'manufacturer authorisation', "manufacturer's authorisation", 'letter of authorisation',
    'tax clearance', 'vat registration', 'business registration', 'cac', 'prequalification',
    'local content', 'iso certificate', 'free sale certificate', 'certificate of origin',
    'audited accounts', 'bank reference', 'experience of similar', 'minimum turnover'
  ]
  for (const page of pages) {
    page.lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase()
      const hits = eligibilityTerms.filter((term) => lowerLine.includes(term))
      if (!hits.length) return
      candidates.push({
        field: 'eligibility',
        value: hits,
        page: page.number,
        line: index + 1,
        snippet: line.length > 220 ? line.slice(0, 219) + '…' : line,
        method: 'vocabulary',
        confidence: 0.7 + Math.min(0.2, hits.length * 0.05),
        rule: 'eligibility'
      })
    })
  }

  /* ---- Delivery location ---- */
  candidates.push(...scanLines(pages, [{
    id: 'delivery-place',
    field: 'delivery_location',
    method: 'pattern',
    confidence: 0.7,
    pattern: /(?:deliver(?:y)?\s+(?:to|at|address)|place of delivery|consignee)[:\s]+([A-Z][^\n]{4,90})/i,
    parse: (match) => {
      const value = match[1].replace(/\s+/g, ' ').trim().replace(/[.,;]$/, '')
      /* An e-mail address or a salutation is not a delivery point. */
      if (/@|https?:|www\.|^Att\.?\b/i.test(value)) return null
      return value
    }
  }]))

  const chosen = bestByField(candidates)

  const single = (field) => (chosen[field] ? chosen[field].value : null)
  const cite = (field) => (chosen[field] ? {
    page: chosen[field].page,
    line: chosen[field].line,
    snippet: chosen[field].snippet,
    confidence: chosen[field].confidence,
    method: chosen[field].method
  } : null)

  const quantities = candidates.filter((candidate) => candidate.field === 'quantity')
  const amounts = candidates.filter((candidate) => candidate.field === 'amount')
  const eligibility = []
  const seenEligibility = new Set()
  for (const candidate of candidates.filter((item) => item.field === 'eligibility')) {
    for (const term of candidate.value) {
      if (seenEligibility.has(term)) continue
      seenEligibility.add(term)
      eligibility.push({ term, page: candidate.page, line: candidate.line, snippet: candidate.snippet })
    }
  }

  const fields = {
    incoterm: single('incoterm'),
    hs_code: single('hs_code'),
    quantity: single('quantity'),
    amount: single('amount'),
    closing_date: single('closing_date'),
    delivery_date: single('delivery_date'),
    validity_date: single('validity_date'),
    validity_days: single('validity_days'),
    issue_date: single('issue_date'),
    expiry_date: single('expiry_date'),
    payment_terms: single('payment_terms'),
    bid_security: single('bid_security'),
    delivery_location: single('delivery_location')
  }

  const citations = {}
  for (const field of Object.keys(fields)) citations[field] = cite(field)

  const missing = Object.entries(fields)
    .filter(([, value]) => value == null)
    .map(([field]) => field)

  /* Every quantity and price line is kept, not just the first: a quotation is
     a list, and the total only means something with its lines. */
  const lineItems = []
  for (const quantity of quantities) {
    const nearby = amounts.find((amount) => amount.page === quantity.page)
      || amounts.find((amount) => amount.page === quantity.page && amount.line > quantity.line)
    lineItems.push({
      quantity: quantity.value,
      amount: nearby ? nearby.value : null,
      page: quantity.page,
      line: quantity.line,
      snippet: quantity.snippet
    })
  }

  return {
    fields,
    citations,
    missing,
    eligibility,
    lineItems: lineItems.slice(0, 60),
    incotermsMentioned: [...new Set(candidates.filter((item) => item.field === 'incoterm').map((item) => item.value.term))],
    lowerTextLength: lower.length
  }
}

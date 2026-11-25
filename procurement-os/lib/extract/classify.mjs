/* Document classification.

   A keyword score decides what a document *is*, and the score margin decides
   how much to trust that. Low margin is reported as `type: 'unknown'` with
   candidates instead of a confident wrong answer, because a quotation filed as
   a certificate of origin would corrupt the evidence record. */

export const DOCUMENT_TYPES = {
  tender_notice: {
    label: 'Tender or request for quotation',
    terms: [
      ['invitation to bid', 5], ['request for quotation', 5], ['request for proposal', 5],
      ['tender', 4], ['bid security', 4], ['terms of reference', 3], ['specifications', 3],
      ['closing date', 3], ['submission', 2], ['lot ', 2], ['prequalification', 4],
      ['procuring entity', 4], ['eoi', 2], ['expression of interest', 4]
    ]
  },
  quotation: {
    label: 'Supplier quotation',
    terms: [
      ['quotation', 5], ['quote', 3], ['unit price', 4], ['offer', 2],
      ['validity', 3], ['payment terms', 3], ['delivery time', 3], ['total', 2],
      ['our best price', 5], ['proforma', 3]
    ]
  },
  invoice: {
    label: 'Invoice',
    terms: [
      ['tax invoice', 6], ['invoice no', 5], ['invoice number', 5], ['amount due', 4],
      ['vat', 3], ['iban', 3], ['swift', 2], ['bill to', 3], ['subtotal', 3]
    ]
  },
  packing_list: {
    label: 'Packing list',
    terms: [['packing list', 6], ['gross weight', 3], ['net weight', 3], ['carton', 2], ['dimensions', 2]]
  },
  bill_of_lading: {
    label: 'Bill of lading or airway bill',
    terms: [['bill of lading', 6], ['air waybill', 6], ['consignee', 3], ['shipper', 3], ['port of loading', 4], ['container no', 3]]
  },
  certificate_iso: {
    label: 'Quality management certificate',
    terms: [['iso 13485', 6], ['iso 9001', 6], ['iso 14001', 4], ['certificate', 3], ['certifying body', 4], ['scope of certification', 5], ['accredited', 2]]
  },
  certificate_free_sale: {
    label: 'Certificate of free sale',
    terms: [['free sale', 7], ['certificate of free sale', 7], ['freely sold', 4]]
  },
  certificate_origin: {
    label: 'Certificate of origin',
    terms: [['certificate of origin', 7], ['country of origin', 4], ['chamber of commerce', 3]]
  },
  insurance: {
    label: 'Insurance evidence',
    terms: [['insurance policy', 6], ['certificate of insurance', 6], ['sum insured', 4], ['marine insurance', 4]]
  },
  bank_guarantee: {
    label: 'Bank guarantee or bond',
    terms: [['bank guarantee', 7], ['performance bond', 6], ['advance payment guarantee', 6], ['irrevocable', 3]]
  },
  import_permit: {
    label: 'Import permit or regulatory certificate',
    terms: [['form m', 6], ['soncap', 6], ['nafdac', 6], ['import permit', 4], ['product certificate', 3]]
  },
  sanction_screening: {
    label: 'Sanctions screening result',
    terms: [['screening', 4], ['potential match', 6], ['false positive', 5], ['sanctions list', 6], ['ofac', 4], ['no match', 4]]
  },
  technical_spec: {
    label: 'Technical specification or datasheet',
    terms: [['datasheet', 5], ['technical specification', 5], ['model', 2], ['power supply', 2], ['operating temperature', 3]]
  }
}

function countTerm(haystack, term) {
  let count = 0
  let index = haystack.indexOf(term)
  while (index !== -1) {
    count += 1
    index = haystack.indexOf(term, index + term.length)
    if (count > 6) break
  }
  return count
}

export function classifyDocument(text) {
  const haystack = String(text || '').toLowerCase()
  const scores = []

  for (const [type, definition] of Object.entries(DOCUMENT_TYPES)) {
    let score = 0
    const hits = []
    for (const [term, weight] of definition.terms) {
      const count = countTerm(haystack, term)
      if (count > 0) {
        score += weight * Math.min(count, 3)
        hits.push(term)
      }
    }
    if (score > 0) scores.push({ type, label: definition.label, score, hits: hits.slice(0, 6) })
  }

  scores.sort((a, b) => b.score - a.score)
  if (!scores.length) {
    return { type: 'unknown', label: 'Unrecognised document', confidence: 0, candidates: [] }
  }

  const top = scores[0]
  const second = scores[1] ? scores[1].score : 0
  const margin = top.score === 0 ? 0 : (top.score - second) / top.score
  const strength = Math.min(1, top.score / 14)
  const confidence = Math.round((0.6 * margin + 0.4 * strength) * 100) / 100

  return {
    type: confidence < 0.35 ? 'unknown' : top.type,
    label: confidence < 0.35 ? 'Unrecognised document' : top.label,
    confidence,
    candidates: scores.slice(0, 3),
    evidence: top.hits
  }
}

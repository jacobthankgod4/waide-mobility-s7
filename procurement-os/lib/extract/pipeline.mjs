/* Document extraction pipeline.

   One entry point turns bytes into a record the rest of the system can act on:
   what the document is, what it requires, where each claim came from, and what
   could not be read. It fails closed — an unreadable or unrecognised document
   reports `readable: false` with a reason, and never returns an empty set of
   requirements that would look like "nothing to comply with". */

import { createHash } from 'node:crypto'
import { detectType, OCR_TYPES, isSupported } from './detect.mjs'
import { extractPdf } from './pdf.mjs'
import { extractDocx, extractXlsx, extractCsv, extractText, extractHtml, extractEmail } from './office.mjs'
import { ocrImage, closeOcr } from './ocr.mjs'
import { classifyDocument } from './classify.mjs'
import { extractRequirements } from './requirements.mjs'

function emptyPages() {
  return { pages: [], pageCount: 0, textCharacters: 0, scannedPages: [], likelyScanned: false }
}

export async function extractDocument({ buffer, filename = 'document', ocr = true }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { readable: false, reason: 'empty_file', filename, requirements: null }
  }

  const detected = detectType(buffer, filename)
  const warnings = []
  let extracted = emptyPages()
  let ocrConfidence = null

  if (!isSupported(detected.type)) {
    return {
      readable: false,
      reason: detected.type === 'unknown' ? 'unknown_type' : 'unsupported_type',
      type: detected.type,
      detectedBy: detected.by,
      filename,
      bytes: buffer.length,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      requirements: null,
      warnings: ['No reader handles ' + detected.type + '; nothing was extracted.']
    }
  }

  if (detected.type === 'pdf') extracted = await extractPdf(buffer)
  else if (detected.type === 'docx') extracted = await extractDocx(buffer)
  else if (detected.type === 'xlsx') extracted = await extractXlsx(buffer)
  else if (detected.type === 'csv') extracted = extractCsv(buffer)
  else if (detected.type === 'html') extracted = extractHtml(buffer)
  else if (detected.type === 'email') extracted = extractEmail(buffer)
  else if (detected.type === 'text') extracted = extractText(buffer)
  else if (OCR_TYPES.has(detected.type)) {
    if (!ocr) {
      warnings.push('Image document; OCR disabled, so it was not read.')
    } else {
      const result = await ocrImage(buffer)
      ocrConfidence = result.confidence
      const pages = result.lines.length
        ? [{ number: 1, lines: result.lines, characters: result.lines.join(' ').length, scanned: false, width: null, height: null }]
        : []
      extracted = {
        pages,
        pageCount: pages.length ? 1 : 0,
        textCharacters: result.lines.join(' ').length,
        scannedPages: [],
        likelyScanned: false
      }
      if (!result.lines.length) warnings.push('OCR produced no text; the image may be blank or too low resolution.')
    }
  }

  if (detected.type === 'pdf' && extracted.likelyScanned) {
    warnings.push(
      'PDF has no usable text layer (' + extracted.textCharacters + ' characters across '
      + extracted.pageCount + ' pages). Treat as unreadable until an OCR copy or the source image is supplied.'
    )
  }

  const text = extracted.pages
    .flatMap((page) => page.lines)
    .join('\n')

  const readable = text.trim().length > 30
  const classification = classifyDocument(text)
  const requirements = extractRequirements(extracted.pages, text)

  const requiredMissing = requirements.missing.filter((field) => [
    'incoterm', 'hs_code', 'quantity', 'closing_date'
  ].includes(field))

  return {
    readable,
    type: detected.type,
    detectedBy: detected.by,
    filename,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    pageCount: extracted.pageCount,
    textCharacters: extracted.textCharacters,
    scannedPages: extracted.scannedPages || [],
    ocrConfidence,
    documentType: classification,
    requirements,
    /* What a bid gate cares about: a readable document that still lacks the
       commercial terms needed to price it is a hold, not a pass. */
    completeness: {
      criticalFieldsMissing: requiredMissing,
      complete: readable && classification.type !== 'unknown' && requiredMissing.length === 0
    },
    text,
    pages: extracted.pages,
    warnings,
    extractedAt: new Date().toISOString()
  }
}

export { closeOcr }

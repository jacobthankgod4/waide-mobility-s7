/* CLI: extract a document and print what the pipeline found.

   Usage: node scripts/extract-cli.mjs <file> [--json] [--text]
*/

import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { extractDocument, closeOcr } from '../lib/extract/pipeline.mjs'

const args = process.argv.slice(2)
const file = args.find((arg) => !arg.startsWith('--'))
const asJson = args.includes('--json')
const asText = args.includes('--text')

if (!file) {
  process.stderr.write('usage: node scripts/extract-cli.mjs <file> [--json] [--text]\n')
  process.exit(2)
}

try {
  const buffer = await readFile(file)
  const result = await extractDocument({ buffer, filename: basename(file) })

  if (asText) {
    process.stdout.write(result.text || '')
    process.exit(0)
  }

  if (asJson) {
    const { pages, text, ...summary } = result
    process.stdout.write(JSON.stringify(summary, null, 2) + '\n')
    process.exit(result.readable ? 0 : 1)
  }

  const lines = []
  lines.push('file            ' + result.filename)
  lines.push('bytes           ' + result.bytes + '  (' + result.type + ', detected by ' + result.detectedBy + ')')
  lines.push('sha256          ' + String(result.sha256 || '').slice(0, 32) + '…')
  lines.push('readable        ' + result.readable + (result.reason ? '  reason: ' + result.reason : ''))
  lines.push('pages           ' + (result.pageCount || 0) + ', characters ' + (result.textCharacters || 0))
  if (result.scannedPages && result.scannedPages.length) {
    lines.push('scanned pages   ' + result.scannedPages.join(', '))
  }
  if (result.documentType) {
    lines.push('document type   ' + result.documentType.type + ' (' + result.documentType.label + '), confidence ' + result.documentType.confidence)
    if (result.documentType.candidates && result.documentType.candidates.length > 1) {
      lines.push('                also: ' + result.documentType.candidates.slice(1).map((c) => c.type + '=' + c.score).join(', '))
    }
  }
  if (result.requirements) {
    lines.push('')
    lines.push('commercial terms')
    for (const [field, value] of Object.entries(result.requirements.fields)) {
      const citation = result.requirements.citations[field]
      if (value == null) { lines.push('  ' + field.padEnd(18) + '—'); continue }
      const printed = typeof value === 'object' ? JSON.stringify(value) : String(value)
      lines.push('  ' + field.padEnd(18) + printed + (citation ? '   [p' + citation.page + ' l' + citation.line + ' ' + Math.round(citation.confidence * 100) + '%]' : ''))
    }
    if (result.requirements.eligibility.length) {
      lines.push('')
      lines.push('eligibility evidence requested')
      for (const item of result.requirements.eligibility) {
        lines.push('  ' + item.term.padEnd(28) + '[p' + item.page + ' l' + item.line + ']')
      }
    }
    if (result.requirements.missing.length) {
      lines.push('')
      lines.push('missing         ' + result.requirements.missing.join(', '))
    }
  }
  if (result.completeness) {
    lines.push('')
    lines.push('complete        ' + result.completeness.complete
      + (result.completeness.criticalFieldsMissing.length
        ? '   critical missing: ' + result.completeness.criticalFieldsMissing.join(', ')
        : ''))
  }
  if (result.warnings && result.warnings.length) {
    lines.push('')
    for (const warning of result.warnings) lines.push('warning         ' + warning)
  }

  process.stdout.write(lines.join('\n') + '\n')
  process.exit(result.readable ? 0 : 1)
} finally {
  await closeOcr()
}

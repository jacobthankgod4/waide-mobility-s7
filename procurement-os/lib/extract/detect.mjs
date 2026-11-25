/* File type detection.

   Extension alone is not trusted: suppliers send .pdf files that are really
   ZIP archives, and a quotation can arrive as a photo. The magic bytes decide,
   the extension only breaks ties, and an unknown type is reported rather than
   guessed. */

const SIGNATURES = [
  { type: 'pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: 'zip', bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK..
  { type: 'png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { type: 'tiff', bytes: [0x49, 0x49, 0x2a, 0x00] },
  { type: 'bmp', bytes: [0x42, 0x4d] }
]

const EXTENSIONS = {
  pdf: 'pdf',
  docx: 'docx',
  xlsx: 'xlsx',
  xlsm: 'xlsx',
  doc: 'doc-legacy',
  xls: 'xls-legacy',
  csv: 'csv',
  txt: 'text',
  md: 'text',
  html: 'html',
  htm: 'html',
  png: 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
  tif: 'tiff',
  tiff: 'tiff',
  bmp: 'bmp',
  eml: 'email'
}

export function detectType(buffer, filename = '') {
  const head = Buffer.isBuffer(buffer) ? buffer.subarray(0, 8) : Buffer.from(buffer || []).subarray(0, 8)
  const extension = String(filename).toLowerCase().split('.').pop() || ''

  for (const signature of SIGNATURES) {
    if (signature.bytes.every((byte, index) => head[index] === byte)) {
      /* A ZIP container carries OOXML documents; the extension separates them. */
      if (signature.type === 'zip') {
        const ooxml = EXTENSIONS[extension]
        return { type: ooxml === 'docx' || ooxml === 'xlsx' ? ooxml : 'zip', by: 'magic' }
      }
      return { type: signature.type, by: 'magic' }
    }
  }

  if (head.length >= 5 && head.toString('latin1').startsWith('From ')) return { type: 'email', by: 'magic' }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(head.toString('latin1'))) return { type: 'unknown', by: 'default' }

  const byExtension = EXTENSIONS[extension]
  if (byExtension) return { type: byExtension, by: 'extension' }

  /* Text is recognised by content, not by name: a supplier's .dat file is
     often a CSV, and a quotation pasted into a .txt must still be read. */
  const sample = (Buffer.isBuffer(buffer) ? buffer.subarray(0, 2048) : Buffer.from('')).toString('utf8')
  const printable = sample.replace(/[^\x09\x0a\x0d\x20-\x7e\u00a0-\uffff]/g, '')
  if (sample.length > 0 && printable.length / sample.length > 0.92) {
    return { type: sample.includes(',') && sample.split('\n').length > 2 ? 'csv' : 'text', by: 'content' }
  }

  return { type: 'unknown', by: 'default' }
}

export const OCR_TYPES = new Set(['png', 'jpeg', 'tiff', 'bmp', 'gif'])

export function isSupported(type) {
  return ['pdf', 'docx', 'xlsx', 'csv', 'text', 'html', 'email', ...OCR_TYPES].includes(type)
}

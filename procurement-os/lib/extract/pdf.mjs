/* PDF text extraction with page-level provenance.

   pdfjs-dist runs in Node on the legacy build. Each page keeps its lines with
   the baseline coordinate so a requirement can cite the page and the line
   order it came from. A page that yields almost no characters is a scan, which
   is reported as needing OCR instead of being treated as an empty page — an
   empty quotation must never read as "no requirements". */

let cachedModule = null

async function loadPdfjs() {
  if (cachedModule) return cachedModule
  cachedModule = await import('pdfjs-dist/legacy/build/pdf.mjs')
  return cachedModule
}

/* Group text items into visual lines: same baseline (±2pt), ordered by x. */
function buildLines(items) {
  const buckets = []

  for (const item of items) {
    const text = (item.str || '').replace(/\u0000/g, '')
    if (!text.trim()) continue
    const transform = item.transform || [1, 0, 0, 1, 0, 0]
    const x = transform[4]
    const y = Math.round(transform[5] * 2) / 2
    const height = item.height || Math.abs(transform[3]) || 10

    let bucket = buckets.find((candidate) => Math.abs(candidate.y - y) <= 2)
    if (!bucket) {
      bucket = { y, items: [] }
      buckets.push(bucket)
    }
    bucket.items.push({ x, text, height })
  }

  buckets.sort((a, b) => b.y - a.y)

  return buckets.map((bucket) => {
    const ordered = bucket.items.sort((a, b) => a.x - b.x)
    let line = ''
    let previousEnd = null
    for (const item of ordered) {
      if (previousEnd != null && item.x - previousEnd > 1.5) line += ' '
      line += item.text
      previousEnd = item.x + (item.width || item.text.length * 4)
    }
    return line.replace(/\s+/g, ' ').trim()
  }).filter(Boolean)
}

export async function extractPdf(buffer) {
  const pdfjs = await loadPdfjs()
  const task = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
    verbosity: 0
  })

  const document = await task.promise
  const pages = []
  let textCharacters = 0

  try {
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number)
      const content = await page.getTextContent({ includeMarkedContent: false })
      const lines = buildLines(content.items)
      const characters = lines.join(' ').length
      textCharacters += characters
      pages.push({
        number,
        lines,
        characters,
        scanned: characters < 40,
        width: page.view ? Math.round(page.view[2] - page.view[0]) : null,
        height: page.view ? Math.round(page.view[3] - page.view[1]) : null
      })
      page.cleanup()
    }
  } finally {
    /* v6 exposes teardown on the loading task; the document proxy no longer
       carries destroy(). Either way the worker must be released or Node exits
       only when the process does. */
    if (typeof task.destroy === 'function') await task.destroy()
    else if (typeof document.destroy === 'function') await document.destroy()
    else if (typeof document.cleanup === 'function') await document.cleanup()
  }

  const scannedPages = pages.filter((page) => page.scanned).map((page) => page.number)

  return {
    pages,
    pageCount: pages.length,
    textCharacters,
    scannedPages,
    /* A PDF with under 40 characters per page on average is a scan set: the
       caller must OCR it or treat the document as unreadable. */
    likelyScanned: pages.length > 0 && textCharacters / pages.length < 40
  }
}

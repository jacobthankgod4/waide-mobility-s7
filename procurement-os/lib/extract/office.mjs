/* Office and plain-text readers.

   DOCX goes through mammoth (real OOXML parsing), XLSX/CSV through exceljs so
   merged cells and multiple sheets survive, HTML through a tag stripper that
   keeps table rows on their own lines. Each returns the same shape as the PDF
   reader: pages of lines, so downstream code never branches on file type. */

import mammoth from 'mammoth'
import ExcelJS from 'exceljs'

function toPages(lines, perPage = 55) {
  const pages = []
  for (let index = 0; index < lines.length; index += perPage) {
    const slice = lines.slice(index, index + perPage)
    pages.push({
      number: pages.length + 1,
      lines: slice,
      characters: slice.join(' ').length,
      scanned: false,
      width: null,
      height: null
    })
  }
  return {
    pages,
    pageCount: pages.length,
    textCharacters: lines.join(' ').length,
    scannedPages: [],
    likelyScanned: false
  }
}

function tidyLines(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function extractDocx(buffer) {
  const raw = await mammoth.extractRawText({ buffer })
  const html = await mammoth.convertToHtml({ buffer })

  /* Tables come back as <tr><td>; flattening them to one line per row keeps
     quantity/price columns readable to the requirement extractor. */
  const tableRows = []
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch
  while ((rowMatch = rowPattern.exec(html.value || '')) !== null) {
    const cells = []
    const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    let cellMatch
    while ((cellMatch = cellPattern.exec(rowMatch[1])) !== null) {
      const text = cellMatch[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      if (text) cells.push(text)
    }
    if (cells.length) tableRows.push(cells.join(' | '))
  }

  const combined = tidyLines([raw.value, '', ...tableRows].join('\n'))
  return { ...toPages(combined), warnings: (raw.messages || []).map((message) => message.message) }
}

export async function extractXlsx(buffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const lines = []
  workbook.eachSheet((sheet) => {
    lines.push('## Sheet: ' + sheet.name)
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const cells = []
      row.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value
        if (value == null) { cells.push(''); return }
        if (typeof value === 'object') {
          if (value.result != null) { cells.push(String(value.result)); return }
          if (value.richText) { cells.push(value.richText.map((part) => part.text).join('')); return }
          if (value.text) { cells.push(String(value.text)); return }
          if (value instanceof Date) { cells.push(value.toISOString().slice(0, 10)); return }
          cells.push(JSON.stringify(value)); return
        }
        cells.push(String(value))
      })
      const joined = cells.join(' ').replace(/\s+/g, ' ').trim()
      if (joined) lines.push(joined)
    })
  })

  return { ...toPages(tidyLines(lines.join('\n'))), sheetCount: workbook.worksheets.length }
}

export function extractCsv(buffer) {
  const text = buffer.toString('utf8')
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') { field += '"'; index += 1 } else quoted = false
      } else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(field); field = '' }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (char !== '\r') field += char
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }

  const lines = rows
    .map((cells) => cells.map((cell) => cell.trim()).filter((cell) => cell.length).join(' | '))
    .filter(Boolean)

  return { ...toPages(lines), rowCount: rows.length }
}

export function extractText(buffer) {
  return toPages(tidyLines(buffer.toString('utf8')))
}

export function extractHtml(buffer) {
  const html = buffer.toString('utf8')
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  const withBreaks = withoutScripts
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|table)>/gi, '\n')
    .replace(/<\/(td|th)>/gi, ' | ')
  const text = withBreaks
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
  return toPages(tidyLines(text))
}

export function extractEmail(buffer) {
  const text = buffer.toString('utf8')
  const split = text.split(/\r?\n\r?\n/)
  const headers = split.slice(0, Math.ceil(split.length / 2)).join('\n')
  const body = split.slice(Math.ceil(split.length / 2)).join('\n\n')
  return toPages(tidyLines(headers + '\n\n' + body))
}

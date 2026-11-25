/* OCR for scanned pages and photographed documents.

   Tesseract runs in WebAssembly, so there is no native build to fail on a
   machine without a compiler. The worker is expensive to start, so it is
   created once per process and reused. A missing language pack is reported as
   a warning: the document is then *unreadable*, never *empty*. */

let workerPromise = null

async function worker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js')
      const instance = await createWorker('eng', 1, { cachePath: '.tools/ocr-cache' })
      await instance.setParameters({ preserve_interword_spaces: '1' })
      return instance
    })()
  }
  return workerPromise
}

export async function ocrImage(buffer) {
  const instance = await worker()
  const { data } = await instance.recognize(buffer)
  const text = String(data.text || '')
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return {
    lines,
    confidence: typeof data.confidence === 'number' ? Math.round(data.confidence) : null,
    words: Array.isArray(data.words) ? data.words.length : 0
  }
}

export async function closeOcr() {
  if (!workerPromise) return
  try {
    const instance = await workerPromise
    await instance.terminate()
  } catch (error) {
    /* Already gone. */
  }
  workerPromise = null
}

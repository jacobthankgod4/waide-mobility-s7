/* Extraction, gating and AgentMail surface tests.

   These run offline against two real tender PDFs committed under data/samples,
   so a change to the parsers is measured against documents this desk would
   actually receive rather than invented fixtures. Nothing here contacts
   AgentMail: the gate is tested as a decision function. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { detectType, isSupported } from '../lib/extract/detect.mjs'
import { extractDocument, closeOcr } from '../lib/extract/pipeline.mjs'
import { classifyDocument } from '../lib/extract/classify.mjs'
import { review, INTENT_CAPABILITY } from '../lib/integrations/agentmail/gate.mjs'
import { capabilityReport, sdkSurfaceAudit, SDK_SURFACE } from '../lib/integrations/agentmail/client.mjs'
import { matchSupplier } from '../lib/integrations/agentmail/sync.mjs'

const ROOT = process.cwd()
const IOM = join(ROOT, 'data', 'samples', 'iom-itb-pakistan.pdf')
const UNFPA = join(ROOT, 'data', 'samples', 'unfpa-itb-angola.pdf')

test('detects a PDF by magic bytes, not by extension', async () => {
  const buffer = await readFile(IOM)
  const detected = detectType(buffer, 'renamed-quotation.dat')
  assert.equal(detected.type, 'pdf')
  assert.equal(detected.by, 'magic')
  assert.equal(isSupported('pdf'), true)
})

test('refuses an empty file instead of returning no requirements', async () => {
  const result = await extractDocument({ buffer: Buffer.alloc(0), filename: 'empty.pdf' })
  assert.equal(result.readable, false)
  assert.equal(result.reason, 'empty_file')
  assert.equal(result.requirements, null)
})

test('unknown binary is reported unsupported, not silently skipped', async () => {
  const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08])
  const result = await extractDocument({ buffer, filename: 'thing.bin' })
  assert.equal(result.readable, false)
  assert.match(result.reason, /unknown_type|unsupported_type/)
})

test('extracts a real 47-page ITB with page-level citations', async () => {
  const buffer = await readFile(IOM)
  const result = await extractDocument({ buffer, filename: 'iom-itb-pakistan.pdf' })

  assert.equal(result.readable, true)
  assert.ok(result.pageCount > 40, 'expected the full document, got ' + result.pageCount + ' pages')
  assert.equal(result.documentType.type, 'tender_notice')

  const incoterm = result.requirements.fields.incoterm
  assert.equal(incoterm.term, 'FCA')
  /* The word after "FCA" in the source is "prices", which is not a place. */
  assert.equal(incoterm.place, null)

  const citation = result.requirements.citations.incoterm
  assert.ok(citation.page > 0 && citation.line > 0)
  assert.ok(citation.snippet.length > 0)
})

test('records a missing critical term as missing rather than inventing one', async () => {
  const buffer = await readFile(IOM)
  const result = await extractDocument({ buffer, filename: 'iom-itb-pakistan.pdf' })

  /* This ITB defers its deadline to a data sheet, so the honest result is
     "unknown" and the bid gate must hold on it. */
  assert.equal(result.requirements.fields.closing_date, null)
  assert.ok(result.requirements.missing.includes('closing_date'))
  assert.ok(result.completeness.criticalFieldsMissing.includes('closing_date'))
  assert.equal(result.completeness.complete, false)
})

test('extracts dated terms from a second real ITB', async () => {
  const buffer = await readFile(UNFPA)
  const result = await extractDocument({ buffer, filename: 'unfpa-itb-angola.pdf' })

  assert.equal(result.readable, true)
  const fields = result.requirements.fields
  assert.match(String(fields.closing_date), /^\d{4}-\d{2}-\d{2}$/)
  assert.match(String(fields.issue_date), /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(fields.incoterm.term, 'DAP')
})

test('classifies invoice language as an invoice, not a tender', () => {
  const text = 'TAX INVOICE\nInvoice No: 12345\nAmount due: USD 4,300.00\nVAT 7.5%\nIBAN GB00\n'
  const result = classifyDocument(text)
  assert.equal(result.type, 'invoice')
})

test('an unrecognised document stays unknown', () => {
  const result = classifyDocument('Lorem ipsum dolor sit amet.')
  assert.equal(result.type, 'unknown')
  assert.equal(result.confidence, 0)
})

test('plain text and CSV are read by content', async () => {
  const csv = Buffer.from('item,qty,price\ncatheter,120,14.50\n', 'utf8')
  const result = await extractDocument({ buffer: csv, filename: 'quote.csv' })
  assert.equal(result.readable, true)
  assert.ok(result.pageCount >= 1)

  const txt = Buffer.from('Subject: Quotation for 12 infusion pumps.\nDelivery terms: CIF Lagos.\n', 'utf8')
  const textResult = await extractDocument({ buffer: txt, filename: 'note.txt' })
  assert.equal(textResult.readable, true)
  assert.equal(textResult.requirements.fields.incoterm.term, 'CIF')
})

/* ---- gate ---------------------------------------------------------------- */

const cleanContext = {
  recipientVerified: true,
  templateApproved: true,
  idempotencyKeyUsed: false,
  recipientClearedForFinancial: true
}

test('an RFQ from the agent passes when every control is satisfied', () => {
  const verdict = review({
    intent: 'rfq',
    actorRole: 'ai_agent',
    body: 'Please quote 12 infusion pumps, delivery to Lagos.',
    to: 'sales@example.com',
    supplierId: 'SUP-1',
    idempotencyKey: 'rfq-SUP-1-001',
    context: cleanContext
  })
  assert.equal(verdict.decision, 'send')
  assert.equal(verdict.authority.allowed, true)
})

test('the same RFQ is blocked when the recipient is unverified', () => {
  const verdict = review({
    intent: 'rfq',
    actorRole: 'ai_agent',
    body: 'Please quote.',
    to: 'sales@example.com',
    supplierId: 'SUP-1',
    idempotencyKey: 'rfq-2',
    context: { ...cleanContext, recipientVerified: false }
  })
  assert.equal(verdict.decision, 'blocked')
  assert.ok(verdict.blockers.length > 0)
})

test('a final quotation cannot be sent by the agent', () => {
  const verdict = review({
    intent: 'final_quotation',
    actorRole: 'ai_agent',
    body: 'Our final price is USD 480,000.',
    to: 'buyer@example.com',
    opportunityId: 'OPP-2026-018',
    idempotencyKey: 'fq-1',
    context: cleanContext
  })
  assert.notEqual(verdict.decision, 'send')
  assert.equal(verdict.authority.allowed, false)
})

test('an intent with no delegated capability fails closed', () => {
  const verdict = review({
    intent: 'invent_a_new_message_class',
    actorRole: 'ai_agent',
    body: 'hello',
    to: 'x@example.com',
    context: cleanContext
  })
  assert.equal(verdict.decision, 'blocked')
})

test('commitment language in an autonomous class is blocked', () => {
  const verdict = review({
    intent: 'supplier_followup',
    actorRole: 'ai_agent',
    body: 'We agree to accept the order and shall be liable for all costs.',
    to: 'sales@example.com',
    supplierId: 'SUP-1',
    idempotencyKey: 'fu-1',
    context: cleanContext
  })
  assert.equal(verdict.decision, 'blocked')
})

test('every intent that can send maps to a real policy capability', () => {
  assert.ok(Object.keys(INTENT_CAPABILITY).length > 10)
  for (const capability of Object.values(INTENT_CAPABILITY)) {
    assert.match(capability, /^[a-z]+\.[a-z.0-9A-Z]+$/)
  }
})

/* ---- surface ------------------------------------------------------------- */

test('the capability registry covers the whole SDK surface', () => {
  const report = capabilityReport()
  assert.equal(report.total, SDK_SURFACE.length)
  assert.ok(report.automated > 10, 'automated endpoints: ' + report.automated)
  assert.ok(report.owner_only > 0)

  /* The invariant that matters is that the system never destroys anything on
     its own, whether that is mail, a domain or a key. */
  const destructive = SDK_SURFACE.filter((item) => /(^|\.)delete$/.test(item.method))
  assert.ok(destructive.length > 0)
  for (const item of destructive) {
    assert.notEqual(item.exposure, 'automated', item.path + '.' + item.method + ' must not be automated')
  }

  /* Account administration - keys, domains, identity - is never automated,
     whether or not it mutates. Reading the account is a human action; issuing
     a key is the owner's alone. */
  const admin = SDK_SURFACE.filter((item) => /^(apiKeys|accounts|agent|organizations)\./.test(item.path))
  for (const item of admin) {
    assert.notEqual(item.exposure, 'automated', item.path + '.' + item.method + ' must not be automated')
  }
})

test('every registered AgentMail method exists on the installed SDK', () => {
  /* A registry row for a method the package does not ship is a promise the
     system cannot keep. This caught six such rows (organisation drafts are
     read-only, `files` is inbox-scoped, auth exposes `me` not `authenticate`). */
  const audit = sdkSurfaceAudit()
  assert.deepEqual(audit.missing, [], 'unknown methods: ' + audit.missing.join(', '))
  assert.equal(audit.ok, true)
  assert.ok(audit.total > 150, 'the surface should cover the whole package, got ' + audit.total)
  assert.ok(audit.automated > 0 && audit.human > 0 && audit.owner_only > 0)
  assert.equal(audit.automated + audit.human + audit.owner_only, audit.total)
})

test('a sender is matched to a supplier by address, never by display name', () => {
  const store = {
    suppliers: [
      { id: 'SUP-1', name: 'Acme Medical', email: 'quotes@acme.example', contacts: [{ email: 'rep@acme.example' }] }
    ]
  }
  assert.equal(matchSupplier(store, 'REP@acme.example').id, 'SUP-1')
  assert.equal(matchSupplier(store, 'stranger@example.com'), null)
  assert.equal(matchSupplier(store, ''), null)
})

test.after(async () => {
  await closeOcr()
})

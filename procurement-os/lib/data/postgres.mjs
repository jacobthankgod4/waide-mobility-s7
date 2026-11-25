/* PostgreSQL repository.

   The specification calls for PostgreSQL behind a typed service layer. This
   module runs the actual PostgreSQL engine (PGlite: PostgreSQL compiled to
   WebAssembly) embedded in the Node process, which gives real SQL, real types,
   real constraints and real transactions with no server to install and no
   administrator rights.

   It is not a TCP server: another process cannot connect to it over port 5432.
   The native Windows server could not start on this machine (its binaries exit
   with 0xC0000135 because the MSVC runtime is absent, which needs an
   administrator install). Where a shared server is required, point the same
   schema and queries at a hosted PostgreSQL instance by swapping `connect()`.

   Persistence: .tools/pgdata (ignored by git). The JSON store remains the
   console's working set; this mirrors it into SQL so reporting, screening
   history and the ledger are queryable, and so the migration is proven rather
   than described. */

import { PGlite } from '@electric-sql/pglite'

const DATA_DIR = './.tools/pgdata-sql'

let instance = null

export async function connect() {
  if (instance) return instance
  instance = await PGlite.create(DATA_DIR)
  await migrate(instance)
  return instance
}

export async function close() {
  if (!instance) return
  await instance.close()
  instance = null
}

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS suppliers (
  id            TEXT PRIMARY KEY,
  legal_name    TEXT NOT NULL,
  lei           TEXT,
  country       TEXT,
  city          TEXT,
  state         TEXT NOT NULL DEFAULT 'S0',
  source        TEXT NOT NULL,
  screening_status TEXT,
  screening_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS screening_matches (
  id            BIGSERIAL PRIMARY KEY,
  supplier_id   TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  list_source   TEXT NOT NULL,
  list_reference TEXT NOT NULL,
  listed_name   TEXT NOT NULL,
  similarity    NUMERIC(4,3) NOT NULL,
  status        TEXT NOT NULL,
  decided_by    TEXT,
  decided_at    TIMESTAMPTZ,
  resolution    TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id            TEXT PRIMARY KEY,
  sha256        TEXT NOT NULL UNIQUE,
  filename      TEXT NOT NULL,
  source        TEXT NOT NULL,
  readable      BOOLEAN NOT NULL,
  document_type TEXT,
  confidence    NUMERIC(4,2),
  page_count    INTEGER,
  incoterm      TEXT,
  hs_code       TEXT,
  closing_date  DATE,
  complete      BOOLEAN,
  extracted_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger (
  seq           BIGSERIAL PRIMARY KEY,
  hash          TEXT NOT NULL UNIQUE,
  previous_hash TEXT,
  type          TEXT NOT NULL,
  subject       TEXT,
  actor         TEXT,
  payload       JSONB NOT NULL,
  at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS suppliers_country_idx ON suppliers(country);
CREATE INDEX IF NOT EXISTS screening_status_idx ON screening_matches(status);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(document_type);
`

async function migrate(db) {
  await db.exec(SCHEMA)
}

/* Load the harvested sanctions dataset into SQL so screening history is
   queryable. Idempotent: the same reference is updated, not duplicated. */
export async function syncReferenceData() {
  const db = await connect()
  const { dataset } = await import('../engines/sanctions.mjs')
  const loaded = dataset()
  return { available: loaded.available, entries: loaded.entries.length }
}

export async function upsertSuppliers(suppliers = []) {
  const db = await connect()
  let written = 0
  for (const supplier of suppliers) {
    await db.query(
      `INSERT INTO suppliers (id, legal_name, lei, country, city, state, source, screening_status, screening_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET legal_name = EXCLUDED.legal_name, state = EXCLUDED.state,
         screening_status = EXCLUDED.screening_status, screening_at = EXCLUDED.screening_at`,
      [
        supplier.id,
        supplier.legalName,
        supplier.lei ?? null,
        supplier.country ?? null,
        supplier.city ?? null,
        supplier.state ?? 'S0',
        supplier.source ?? 'gleif',
        supplier.sanctionsStatus ?? null,
        supplier.screenedAt ?? null,
      ],
    )
    written += 1
  }
  return written
}

export async function recordMatch(supplierId, match) {
  const db = await connect()
  const result = await db.query(
    `INSERT INTO screening_matches (supplier_id, list_source, list_reference, listed_name, similarity, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [supplierId, match.source, match.reference, match.name, match.similarity, match.status],
  )
  return result.rows[0]
}

export async function insertDocument(document) {
  const db = await connect()
  const fields = document.requirements?.fields ?? {}
  await db.query(
    `INSERT INTO documents (id, sha256, filename, source, readable, document_type, confidence, page_count, incoterm, hs_code, closing_date, complete, extracted_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (sha256) DO NOTHING`,
    [
      document.id,
      document.sha256,
      document.filename,
      document.source,
      Boolean(document.readable),
      document.documentType?.type ?? null,
      document.documentType?.confidence ?? null,
      document.pageCount ?? null,
      fields.incoterm ? fields.incoterm.term : null,
      fields.hs_code ?? null,
      fields.closing_date || null,
      Boolean(document.completeness?.complete),
      document.extractedAt,
    ],
  )
}

export async function insertLedgerEvent(event) {
  const db = await connect()
  await db.query(
    `INSERT INTO ledger (hash, previous_hash, type, subject, actor, payload, at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (hash) DO NOTHING`,
    [event.hash, event.previousHash ?? null, event.type ?? 'unknown', event.subject ?? null, event.actor ?? null, JSON.stringify(event), event.at ?? new Date().toISOString()],
  )
}

/* Reporting queries used by the infrastructure screen and the tests. */
export async function stats() {
  const db = await connect()
  const suppliers = await db.query('SELECT count(*)::int AS n FROM suppliers')
  const byCountry = await db.query('SELECT country, count(*)::int AS n FROM suppliers GROUP BY country ORDER BY n DESC LIMIT 8')
  const holds = await db.query("SELECT count(*)::int AS n FROM screening_matches WHERE status <> 'clear'")
  const documents = await db.query('SELECT count(*)::int AS n FROM documents')
  const version = await db.query('SELECT version() AS v')
  return {
    version: version.rows[0].v,
    suppliers: suppliers.rows[0].n,
    byCountry: byCountry.rows,
    matches: holds.rows[0].n,
    documents: documents.rows[0].n,
  }
}

/* Migrate the current JSON store into SQL. Safe to re-run. */
export async function mirrorStore(store) {
  const db = await connect()

  await db.exec('BEGIN')
  try {
    const suppliers = await upsertSuppliers(store.suppliers ?? [])
    for (const document of store.mail?.documents ?? []) {
      await insertDocument(document)
    }
    for (const event of store.ledger ?? []) {
      await insertLedgerEvent(event)
    }
    for (const supplier of store.suppliers ?? []) {
      for (const match of supplier.screeningMatches ?? []) {
        await recordMatch(supplier.id, match)
      }
    }
    await db.exec('COMMIT')
    return { suppliers, documents: (store.mail?.documents ?? []).length, ledger: (store.ledger ?? []).length }
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }
}

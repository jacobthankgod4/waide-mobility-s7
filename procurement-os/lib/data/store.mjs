/**
 * File-backed operational store.
 *
 * The specification's production target is PostgreSQL + pgvector behind a typed
 * service layer. This build keeps the same repository boundary but persists to a
 * JSON document with an append-only ledger, so the console runs with zero
 * infrastructure. Swap `load`/`save` for a SQL repository without touching the
 * engines or pages.
 */

import fs from "node:fs";
import path from "node:path";
import { buildSeed } from "./seed.mjs";
import { appendEvent, verifyChain } from "../engines/ledger.mjs";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "runtime");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const LEDGER_PATH = path.join(DATA_DIR, "ledger.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadStore() {
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    const seed = buildSeed();
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(seed.ledger ?? [], null, 2), "utf8");
    return seed;
  }
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
}

export function saveStore(store) {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  return store;
}

export function loadLedger() {
  ensureDir();
  if (!fs.existsSync(LEDGER_PATH)) return [];
  return JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
}

export function saveLedger(chain) {
  ensureDir();
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(chain, null, 2), "utf8");
  return chain;
}

/** Append one sealed audit event and persist the chain. */
export function record(event) {
  const chain = loadLedger();
  const appended = appendEvent(chain, event);
  saveLedger(chain);
  return appended;
}

export function ledgerIntegrity() {
  return verifyChain(loadLedger());
}

export function resetStore() {
  ensureDir();
  const seed = buildSeed();
  saveStore(seed);
  saveLedger(seed.ledger ?? []);
  return seed;
}

// ---- Selectors -------------------------------------------------------------

export function getUser(store, id) {
  return store.users.find((u) => u.id === id) ?? store.users[0];
}

export function defaultUser(store) {
  return store.users.find((u) => u.role === "managing_director") ?? store.users[0];
}

export function getOpportunity(store, id) {
  return store.opportunities.find((o) => o.id === id) ?? null;
}

export function getSupplier(store, id) {
  return store.suppliers.find((s) => s.id === id) ?? null;
}

export function getContract(store, id) {
  return store.contracts.find((c) => c.id === id) ?? null;
}

export function getBidModel(store, opportunityId) {
  return store.bidModels.find((b) => b.opportunityId === opportunityId) ?? null;
}

export function countryProfile(store, code) {
  return store.countries.find((c) => c.code === code) ?? null;
}

export function sectorRule(store, code) {
  return store.sectors.find((s) => s.code === code) ?? null;
}

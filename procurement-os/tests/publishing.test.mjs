/**
 * The published snapshot is the only console output that reaches a public page.
 * These tests hold it to the narrow contract it claims: control coverage read
 * from the engines, reference-data currency from the harvest manifest, and no
 * supplier identity, price or contact detail at all.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  SCHEMA,
  PUBLIC_KEYS,
  buildSnapshot,
  assertPublicSafe,
  forbiddenNames,
} from "../scripts/publish-automation.mjs";
import { CHECK_DEFINITIONS } from "../lib/engines/gates.mjs";
import { CAPABILITIES } from "../lib/engines/policy.mjs";
import { INTENTS } from "../lib/engines/comms.mjs";

const store = JSON.parse(await readFile(new URL("../data/runtime/store.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("../data/real/manifest.json", import.meta.url), "utf8"));

const snapshot = buildSnapshot({ store, manifest, now: new Date("2026-11-25T00:00:00.000Z") });

test("snapshot is public-safe", () => {
  assert.doesNotThrow(() => assertPublicSafe(snapshot, { forbidden: forbiddenNames(store) }));
});

test("control coverage comes from the engines, not from prose", () => {
  assert.equal(snapshot.controls.bidGateChecks, CHECK_DEFINITIONS.length);
  assert.equal(snapshot.controls.authorityCapabilities, Object.keys(CAPABILITIES).length);
  assert.equal(snapshot.controls.correspondenceIntents, Object.keys(INTENTS).length);
  assert.equal(snapshot.controls.auditChain.algorithm, "sha256-chain");
  assert.equal(typeof snapshot.controls.auditChain.valid, "boolean");
});

test("reference data is dated and sourced", () => {
  assert.equal(snapshot.reference.sanctions.entries, manifest.sanctions_total);
  assert.match(snapshot.reference.sanctions.source, /OFAC/);
  assert.ok(Date.parse(snapshot.reference.sanctions.generatedAt) > 0);
  assert.equal(snapshot.reference.supplierRegistry.retrieved, manifest.entities_total);
  assert.equal(snapshot.reference.supplierRegistry.imported, store.suppliers.length);
  assert.equal(snapshot.reference.supplierRegistry.source, "GLEIF LEI");
  assert.match(snapshot.reference.exchangeRates.source, /er-api/);
});

test("no supplier name, e-mail address or price appears in the file", () => {
  const text = JSON.stringify(snapshot).toLowerCase();
  for (const name of forbiddenNames(store)) {
    assert.equal(text.includes(name.toLowerCase()), false, `leaked supplier name: ${name}`);
  }
  assert.equal(/[^\s@"]+@[^\s@"]+\.[a-z]{2,}/.test(text), false, "leaked an e-mail address");
  for (const key of ["price", "amount", "margin", "value", "bank", "account", "buyer", "contact"]) {
    assert.equal(Object.keys(flatten(snapshot)).some((pathName) => pathName.toLowerCase().includes(key)), false, `unexpected key containing ${key}`);
  }
});

test("every key is on the allowlist", () => {
  for (const key of Object.keys(flatten(snapshot))) assert.ok(PUBLIC_KEYS.has(key), `${key} is not allowlisted`);
});

test("widening the snapshot is refused", () => {
  const extra = structuredClone(snapshot);
  extra.reference.sanctions.supplier = "Example Medical Ltd";

  assert.throws(
    () => assertPublicSafe(extra, { forbidden: forbiddenNames(store) }),
    /not on the public allowlist/,
  );
});

test("a contact address is refused", () => {
  const leaky = structuredClone(snapshot);
  leaky.published.scope = "Contact buyer@example.org for details.";

  assert.throws(() => assertPublicSafe(leaky), /e-mail address/);
});

test("a real supplier name is refused", () => {
  const name = forbiddenNames(store)[0];
  assert.ok(name, "the realised store should contain supplier names");

  const named = structuredClone(snapshot);
  named.published.scope = `Prepared with ${name}.`;

  assert.throws(() => assertPublicSafe(named, { forbidden: forbiddenNames(store) }), /names a real supplier/);
});

test("the serialised file round-trips through the allowlist", () => {
  const written = JSON.parse(JSON.stringify(snapshot, null, 2));
  assert.equal(written.schema, SCHEMA);
  assert.doesNotThrow(() => assertPublicSafe(written, { forbidden: forbiddenNames(store) }));
});

function flatten(value, prefix = "") {
  const out = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      out[key] = true;
      Object.assign(out, flatten(child, prefix ? `${prefix}.${key}` : key));
    }
  }
  return out;
}

#!/usr/bin/env node
/**
 * Publish the console's public automation status to waidemobility.com.
 *
 * The marketing site is static HTML with serverless endpoints, so it has no
 * database and cannot accept writes at runtime. The console therefore pushes a
 * small, deliberately narrow snapshot into the site repository, the page at
 * /automation.html reads it, and `node stage.mjs` publishes it.
 *
 * What is published: the currency of the real reference data (sanctions lists,
 * the LEI supplier registry, exchange rates) and the coverage of controls that
 * exist in code. What is never published: supplier identities, buyer names,
 * document contents, prices, margins, bank details, correspondence, or any
 * approval record. `assertPublicSafe` enforces that by key allowlist and by
 * scanning for known supplier names and e-mail addresses, so widening the
 * snapshot is a deliberate act rather than an accident.
 *
 *   node scripts/publish-automation.mjs            # write into the site repo
 *   node scripts/publish-automation.mjs --check    # validate what is there
 *   node scripts/publish-automation.mjs --repo <p> # another checkout
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { verifyChain } from "../lib/engines/ledger.mjs";
import { CHECK_DEFINITIONS } from "../lib/engines/gates.mjs";
import { CAPABILITIES } from "../lib/engines/policy.mjs";
import { INTENTS } from "../lib/engines/comms.mjs";

export const SCHEMA = "waide.automation-status/1";
export const FILENAME = "automation-status.json";
export const DEFAULT_REPO = "C:/Users/Admin/Documents/Default Project/waide-mobility-s7-main";

/** Every key the public snapshot may contain. Anything else is a bug. */
export const PUBLIC_KEYS = new Set([
  "schema",
  "generatedAt",
  "controls",
  "bidGateChecks",
  "authorityCapabilities",
  "correspondenceIntents",
  "auditChain",
  "algorithm",
  "valid",
  "reference",
  "supplierRegistry",
  "sanctions",
  "exchangeRates",
  "source",
  "retrieved",
  "imported",
  "importedAt",
  "entries",
  "generatedAt",
  "asOf",
  "published",
  "scope",
]);

const MAX_STRING = 400;

function pick(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
}

/**
 * Build the snapshot from the console's own records.
 *
 * Counts of controls are read from the engine modules rather than written by
 * hand, so the page cannot claim coverage the code does not have.
 */
export function buildSnapshot({ store, manifest, now = new Date() }) {
  const ledger = verifyChain(store.ledger ?? []);
  const reference = manifest?.sources ?? {};
  const registry = store.meta?.referenceData?.suppliers ?? {};

  return {
    schema: SCHEMA,
    generatedAt: now.toISOString(),
    controls: {
      bidGateChecks: CHECK_DEFINITIONS.length,
      authorityCapabilities: Object.keys(CAPABILITIES).length,
      correspondenceIntents: Object.keys(INTENTS).length,
      auditChain: { algorithm: "sha256-chain", valid: ledger.valid === true },
    },
    reference: {
      supplierRegistry: {
        source: "GLEIF LEI",
        retrieved: pick(manifest?.entities_total, 0),
        imported: (store.suppliers ?? []).length,
        importedAt: pick(registry.importedAt, pick(manifest?.generated_at, null)),
      },
      sanctions: {
        source: "OFAC SDN and UN consolidated",
        entries: pick(manifest?.sanctions_total, 0),
        generatedAt: pick(manifest?.generated_at, null),
      },
      exchangeRates: {
        source: "open.er-api.com",
        asOf: pick(reference.fx?.market_as_of, null),
      },
    },
    published: {
      scope:
        "Reference-data currency and control coverage only. No supplier, buyer, document, price or approval record is published.",
    },
  };
}

/**
 * Refuse to publish anything outside the allowlist, anything that names a real
 * supplier, or anything that looks like a contact address.
 */
export function assertPublicSafe(snapshot, { forbidden = [] } = {}) {
  const problems = [];
  const names = forbidden.map((name) => String(name).trim().toLowerCase()).filter((name) => name.length > 3);

  const walk = (value, at) => {
    if (value === null || typeof value === "boolean") return;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) problems.push(`${at}: not a finite number`);
      return;
    }
    if (typeof value === "string") {
      if (value.length > MAX_STRING) problems.push(`${at}: string longer than ${MAX_STRING}`);
      if (/[^\s@]+@[^\s@]+\.[^\s@]{2,}/.test(value)) problems.push(`${at}: contains an e-mail address`);
      const lower = value.toLowerCase();
      const hit = names.find((name) => lower.includes(name));
      if (hit) problems.push(`${at}: names a real supplier`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${at}[${index}]`));
      return;
    }
    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (!PUBLIC_KEYS.has(key)) problems.push(`${at}.${key}: key is not on the public allowlist`);
        walk(child, `${at}.${key}`);
      }
      return;
    }
    problems.push(`${at}: unsupported value type ${typeof value}`);
  };

  walk(snapshot, "snapshot");

  if (snapshot.schema !== SCHEMA) problems.push(`snapshot.schema: expected ${SCHEMA}`);
  if (Number.isNaN(Date.parse(snapshot.generatedAt))) problems.push("snapshot.generatedAt: not a timestamp");

  if (problems.length) {
    const error = new Error(`Refusing to publish:\n  ${problems.join("\n  ")}`);
    error.problems = problems;
    throw error;
  }

  return snapshot;
}

/** Supplier names that must never appear in the published file. */
export function forbiddenNames(store) {
  const names = new Set();
  for (const supplier of store.suppliers ?? []) {
    for (const value of [supplier.legalName, supplier.name, supplier.registeredName, supplier.tradingName]) {
      if (typeof value === "string" && value.trim().length > 3) names.add(value);
    }
  }
  return [...names];
}

export function formatSummary(snapshot) {
  const { controls, reference } = snapshot;
  return [
    `Published ${FILENAME} (${SCHEMA})`,
    `  bid gate checks          ${controls.bidGateChecks}`,
    `  authority capabilities   ${controls.authorityCapabilities}`,
    `  correspondence intents   ${controls.correspondenceIntents}`,
    `  audit chain              ${controls.auditChain.valid ? "verified" : "FAILED"}`,
    `  sanctions entries        ${reference.sanctions.entries} (${reference.sanctions.source})`,
    `  supplier registry        ${reference.supplierRegistry.imported} imported of ${reference.supplierRegistry.retrieved} (${reference.supplierRegistry.source})`,
    `  exchange rates           ${reference.exchangeRates.asOf}`,
  ].join("\n");
}

async function loadJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function main(argv) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const check = argv.includes("--check");
  const repoFlag = argv.indexOf("--repo");
  const repo = repoFlag === -1 ? DEFAULT_REPO : path.resolve(argv[repoFlag + 1]);
  const target = path.join(repo, FILENAME);

  const store = await loadJson(path.join(root, "data/runtime/store.json"));

  if (check) {
    const existing = await loadJson(target);
    assertPublicSafe(existing, { forbidden: forbiddenNames(store) });
    console.log(`OK ${target}`);
    console.log(formatSummary(existing));
    return;
  }

  const manifest = await loadJson(path.join(root, "data/real/manifest.json"))
    .catch(() => null);

  if (!manifest) {
    throw new Error("data/real/manifest.json is missing: run `npm run harvest` before publishing.");
  }

  const snapshot = assertPublicSafe(buildSnapshot({ store, manifest }), {
    forbidden: forbiddenNames(store),
  });

  await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(formatSummary(snapshot));
  console.log(`  written to               ${target}`);
  console.log("\nNext: cd to the site repository, run `node stage.mjs`, then commit.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

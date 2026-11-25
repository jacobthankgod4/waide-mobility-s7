/**
 * Restricted-party screening against the harvested official lists.
 *
 * Spec pages 17, 57. A hit is a HOLD, not a conviction: the engine separates
 * false positive / potential match / confirmed match, and a confirmed legal
 * prohibition requires rejection unless a documented licence applies.
 *
 * The dataset is the OFAC SDN list and the UN Security Council consolidated
 * list, harvested by scripts/harvest-real-data.mjs into data/real/sanctions.json
 * with the URL, byte count and SHA-256 of the exact files used. There is no
 * fixture fallback: if the dataset is absent, screening returns `unavailable`
 * and every workflow that depends on it is held. A clear result based on an
 * empty list is the most dangerous answer this module could give.
 */

import fs from "node:fs";
import path from "node:path";

/** Sources. `harvested` marks the lists this build actually screens against. */
export const SCREENING_LISTS = [
  { id: "ofac_sdn", name: "OFAC Specially Designated Nationals", level: 1, harvested: true, officialUrl: "https://sanctionssearch.ofac.treas.gov/" },
  { id: "un_sc", name: "UN Security Council Consolidated List", level: 1, harvested: true, officialUrl: "https://www.un.org/securitycouncil/content/un-sc-consolidated-list" },
  { id: "wb_ineligible", name: "World Bank Listing of Ineligible Firms", level: 1, harvested: false, officialUrl: "https://www.worldbank.org/en/projects-operations/procurement/debarred-firms" },
  { id: "us_csl", name: "US Consolidated Screening List (discovery only)", level: 6, harvested: false, officialUrl: "https://www.trade.gov/consolidated-screening-list" },
];

/** Small illustrative set used only by unit tests that need known hits. */
export const SCREENING_ENTRIES = [
  { name: "Volgograd Precision Instruments JSC", listId: "ofac_sdn", country: "RU", type: "entity", programme: "Test fixture", fixture: true },
  { name: "Sahara Medical Supplies BV", listId: "wb_ineligible", country: "NL", type: "entity", programme: "Test fixture", fixture: true },
  { name: "Delta Bridge Logistics Ltd", listId: "un_sc", country: "AE", type: "entity", programme: "Test fixture", fixture: true },
  { name: "A. Kuznetsov", listId: "ofac_sdn", country: "RU", type: "individual", programme: "Test fixture", fixture: true },
];

const DATASET_PATH = path.join(process.cwd(), "data", "real", "sanctions.json");

export function normaliseName(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(ltd|limited|plc|inc|llc|bv|gmbh|jsc|co|company|group|holdings|international|nigeria|sa|srl|sarl|pty|pte|ag|nv|corp|corporation)\b/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensOf(value) {
  return normaliseName(value).split(" ").filter(Boolean);
}

/** Token-set Dice coefficient - robust to word order and legal suffixes. */
export function nameSimilarity(a, b) {
  const ta = new Set(tokensOf(a));
  const tb = new Set(tokensOf(b));
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared += 1;
  return (2 * shared) / (ta.size + tb.size);
}

let cache = null;

/**
 * Load and index the harvested dataset once per process. The index is keyed by
 * token: any pair scoring above zero must share a token, so only entries
 * sharing a token with the party are scored, which keeps 20k entries viable
 * inside a page render.
 */
export function dataset() {
  if (cache !== null) return cache;

  try {
    if (!fs.existsSync(DATASET_PATH)) {
      cache = { available: false, reason: "No dataset at data/real/sanctions.json. Run `npm run harvest`.", entries: [], index: new Map(), generatedAt: null };
      return cache;
    }

    const parsed = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8"));
    const entries = (parsed.entries ?? []).map((entry) => {
      const tokens = new Set([...tokensOf(entry.name), ...(entry.aliases ?? []).flatMap(tokensOf)]);
      return { ...entry, tokens: [...tokens] };
    });

    const index = new Map();
    entries.forEach((entry, position) => {
      for (const token of entry.tokens) {
        if (!index.has(token)) index.set(token, []);
        index.get(token).push(position);
      }
    });

    cache = {
      available: true,
      generatedAt: parsed.generated_at ?? null,
      counts: {
        total: entries.length,
        ofac: entries.filter((e) => e.source === "OFAC-SDN").length,
        un: entries.filter((e) => e.source === "UN-CONSOLIDATED").length,
      },
      entries,
      index,
    };
    return cache;
  } catch (error) {
    cache = { available: false, reason: "Dataset unreadable: " + error.message, entries: [], index: new Map(), generatedAt: null };
    return cache;
  }
}

function candidatesFor(loaded, names) {
  if (loaded.index.size === 0) return loaded.entries.map((entry, position) => ({ entry, position }));
  const positions = new Set();
  for (const name of names) {
    for (const token of tokensOf(name)) {
      const bucket = loaded.index.get(token);
      if (bucket) for (const position of bucket.slice(0, 4000)) positions.add(position);
    }
  }
  return [...positions].slice(0, 6000).map((position) => ({ entry: loaded.entries[position], position }));
}

/**
 * @param {{legalName:string, country?:string, aliases?:string[]}} party
 * @param {Array|null} [entries] explicit list (tests only); null uses the harvested dataset
 */
export function screenParty(party, entries = null) {
  const usingDataset = entries == null;
  const loaded = usingDataset ? dataset() : { available: true, entries, index: new Map(), generatedAt: null, counts: { total: entries.length } };

  if (usingDataset && !loaded.available) {
    return {
      status: "unavailable",
      confidence: "none",
      matches: [],
      workflowState: "frozen",
      decision: "hold",
      reason: loaded.reason + " Screening cannot produce a clear result without a list.",
      dataset: { available: false, reason: loaded.reason },
      listVersions: SCREENING_LISTS.map((l) => ({ id: l.id, level: l.level, harvested: l.harvested })),
    };
  }

  const names = [party.legalName, ...(party.aliases ?? [])].filter(Boolean);
  const pool = usingDataset ? candidatesFor(loaded, names) : loaded.entries.map((entry, position) => ({ entry, position }));
  const matches = [];

  for (const { entry } of pool) {
    for (const name of names) {
      const similarity = Number(nameSimilarity(name, entry.name).toFixed(3));
      if (similarity >= 0.6) {
        matches.push({
          entry,
          screenedName: name,
          similarity,
          countryMatch: Boolean(party.country && entry.country && party.country === entry.country),
        });
      }
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  const top = matches[0];

  const provenance = {
    dataset: usingDataset
      ? { available: true, generatedAt: loaded.generatedAt, counts: loaded.counts }
      : { available: true, generatedAt: null, counts: { total: loaded.entries.length }, fixture: true },
    listVersions: SCREENING_LISTS.map((l) => ({ id: l.id, level: l.level, harvested: l.harvested })),
  };

  if (!top) {
    return {
      status: "clear",
      confidence: "high",
      matches: [],
      workflowState: "open",
      decision: "proceed",
      reason: `No match at or above the 0.60 similarity threshold across ${loaded.entries.length} listed entries.`,
      ...provenance,
    };
  }

  const isExact = top.similarity >= 0.95 && top.countryMatch;
  const status = isExact ? "confirmed_match" : "potential_match";

  return {
    status,
    confidence: top.similarity >= 0.9 ? "high" : "medium",
    matches: matches.slice(0, 10),
    top,
    workflowState: "frozen",
    decision: "hold_and_investigate",
    reason:
      status === "confirmed_match"
        ? `Exact name and country match on ${top.entry.source} (${top.entry.id}). Do not transact unless a valid applicable licence/authorisation is documented and reviewed.`
        : `Potential match (${Math.round(top.similarity * 100)}% name similarity) on ${top.entry.source} (${top.entry.id}). Freeze the affected workflow and investigate; this is not proof of a prohibition.`,
    ...provenance,
  };
}

/** Clear a potential match only with named human resolution (page 17). */
export function resolveMatch(screening, resolution = {}) {
  const allowedResolutions = ["false_positive", "confirmed_match", "licensed_activity"];
  if (!allowedResolutions.includes(resolution.outcome)) {
    return { resolved: false, reason: "Resolution outcome must be false_positive, confirmed_match or licensed_activity." };
  }
  if (!resolution.resolvedBy || !resolution.evidence) {
    return { resolved: false, reason: "A named resolver and documentary evidence are mandatory." };
  }
  if (resolution.outcome === "licensed_activity" && !resolution.licenceReference) {
    return { resolved: false, reason: "Licensed activity requires a licence reference and issuing authority." };
  }
  return {
    resolved: true,
    workflowState: resolution.outcome === "false_positive" ? "open" : "rejected",
    decision: resolution.outcome === "false_positive" ? "proceed" : resolution.outcome === "licensed_activity" ? "proceed_licensed" : "reject",
    reason: resolution.rationale ?? "Resolved by authorised compliance reviewer.",
  };
}

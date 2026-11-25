#!/usr/bin/env node
/** Regenerate data/runtime/store.json from the seed modules. */
import fs from "node:fs";
import path from "node:path";
import { buildSeed } from "../lib/data/seed.mjs";

const dir = path.join(process.cwd(), "data", "runtime");
fs.mkdirSync(dir, { recursive: true });

const seed = buildSeed();
fs.writeFileSync(path.join(dir, "store.json"), JSON.stringify(seed, null, 2), "utf8");
fs.writeFileSync(path.join(dir, "ledger.json"), JSON.stringify(seed.ledger, null, 2), "utf8");

console.log(
  `seeded ${seed.opportunities.length} opportunities, ${seed.suppliers.length} suppliers, ` +
    `${seed.documents.length} documents, ${seed.contracts.length} contracts, ${seed.ledger.length} audit events`,
);

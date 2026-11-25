#!/usr/bin/env node
/**
 * Render the two controlling documents from the same data the console reads, so
 * the audit and the app can never disagree.
 */
import fs from "node:fs";
import path from "node:path";
import { ROADMAP, ROADMAP_FLAT, ROADMAP_STATS } from "../lib/data/roadmap.mjs";
import { SPEC_PAGES, specStats, omissionCheck, STATUS_LABELS } from "../lib/data/spec-pages.mjs";

const docs = path.join(process.cwd(), "docs");
fs.mkdirSync(docs, { recursive: true });

// ---- Phased build plan -----------------------------------------------------

const phaseLines = [];
phaseLines.push("# Waide Procurement OS — 50-phase build plan", "");
phaseLines.push(
  "This plan replaces the specification's eight-stage summary with fifty dependency-ordered phases without changing its sequence. A phase may not receive",
  "additional permission before the phase beneath it passes its gate. Status reflects **this workspace build**, not the production target.", "",
);
phaseLines.push(
  `**Totals:** ${ROADMAP_STATS.total} phases · ${ROADMAP_STATS.shipped} shipped · ${ROADMAP_STATS.partial} partial · ${ROADMAP_STATS.staged} staged`, "",
);
phaseLines.push("| Status | Meaning |", "| --- | --- |");
phaseLines.push("| `shipped` | Built and exercised by the deterministic test suite in this build. |");
phaseLines.push("| `partial` | The control exists; a component named in the gap column is deferred. |");
phaseLines.push("| `staged` | Specified and sequenced; requires infrastructure, a provider account or a human authority. |", "");

for (const stage of ROADMAP) {
  phaseLines.push(`## ${stage.stage}`, "");
  phaseLines.push("| # | Phase | Spec pages | Status | Gate |", "| --- | --- | --- | --- | --- |");
  for (const p of stage.phases) {
    phaseLines.push(`| ${p.n} | ${p.name} | ${p.pages.join(", ")} | \`${p.status}\` | ${p.gate} |`);
  }
  phaseLines.push("");
}

phaseLines.push("## Sequencing rules", "");
phaseLines.push(
  "- No live supplier correspondence before screening, admission and the outbound policy engine are in place (phases 23–29).",
  "- No portal automation before bid gating and submission-receipt capture (phases 22, 40).",
  "- No payment preparation before three-way matching and beneficiary control (phases 46–47).",
  "- No advance, guarantee or unconditional commitment at any phase without a recorded human approval.",
  "- Shadow-mode commissioning (phase 50) precedes any expansion of autonomy, and requires MD, technical, finance and legal sign-off.",
  "",
);
fs.writeFileSync(path.join(docs, "PHASED_BUILD_PLAN.md"), phaseLines.join("\n"), "utf8");

// ---- Specification audit ---------------------------------------------------

const stats = specStats();
const check = omissionCheck();
const audit = [];
audit.push("# Specification audit — 100 pages, no omission", "");
audit.push(
  "Page-by-page audit of *Waide_Procurement_OS_Master_Build_Prompt_100_Pages.docx* against this build. Each page records its status, the controls actually built,",
  "and any open gap. A page is **not** marked implemented because the specification describes it; only because the control exists and is exercised here.", "",
);
audit.push(
  `**Coverage:** ${stats.total} pages · ${stats.implemented} implemented · ${stats.partial} partial · ${stats.specified_only} specified only · ${stats.external} external dependency`, "",
);
audit.push(
  `**Omission check:** ${check.complete ? "PASSED — pages 1–100 present exactly once, each with a title, valid status and a build note or documented gap." : `FAILED — ${check.problems.join(" ")}`}`,
  "",
);
audit.push("## Status key", "");
audit.push("| Status | Meaning |", "| --- | --- |");
audit.push("| Implemented | Built and exercised in this workspace build. |");
audit.push("| Partial | Core control exists; a component named in the gap is deferred. |");
audit.push("| Specified only | Correctly specified; no implementation exists in this build. |");
audit.push("| External dependency | Requires a live provider, regulator or legal confirmation. |", "");

audit.push("## Page register", "");
audit.push("| Page | Section | Status | Built | Open gap |", "| --- | --- | --- | --- | --- |");
for (const p of SPEC_PAGES) {
  const built = (p.built ?? []).join("; ").replace(/\|/g, "\\|");
  const gap = p.gap ? p.gap.replace(/\|/g, "\\|") : "—";
  audit.push(`| ${p.page} | ${p.title.replace(/\|/g, "\\|")} | ${STATUS_LABELS[p.status]} | ${built || "—"} | ${gap} |`);
}
audit.push("");

const openGaps = SPEC_PAGES.filter((p) => p.gap);
audit.push("## Open gaps, grouped", "");
const groups = {
  "Production infrastructure (not built here)": [21, 30, 44, 45, 61, 67, 70, 71, 72, 73, 74, 75, 90, 98],
  "Live connectors and providers": [14, 15, 16, 25, 34, 36, 38, 43],
  "Legal / regulator confirmation": [4, 11, 12, 14, 32, 57, 59, 93],
  "Governance and commissioning": [89, 99],
};
for (const [label, pages] of Object.entries(groups)) {
  audit.push(`### ${label}`, "");
  for (const n of pages) {
    const p = openGaps.find((x) => x.page === n);
    if (p) audit.push(`- **p.${n} — ${p.title}**: ${p.gap}`);
  }
  audit.push("");
}

audit.push("## Deliberate non-claims", "");
audit.push(
  "- The system is **not** commissioned for live autonomous operation. Production is disabled by policy (page 89).",
  "- No legal, tax, customs or regulatory conclusion is asserted. Every recurring legal claim in the source is a research lead requiring current official confirmation and accountable review (page 93).",
  "- No supplier, certificate, sanction entry or market figure in the dataset is real.",
  "- No model is called. All outputs shown are deterministic engine results; the AI runtime is specified, not implemented (page 70).",
  "",
);

fs.writeFileSync(path.join(docs, "AUDIT_100_PAGES.md"), audit.join("\n"), "utf8");

console.log(`PHASED_BUILD_PLAN.md: ${ROADMAP_FLAT.length} phases`);
console.log(`AUDIT_100_PAGES.md: ${SPEC_PAGES.length} pages, omission check ${check.complete ? "passed" : "FAILED"}`);
if (!check.complete) process.exitCode = 1;

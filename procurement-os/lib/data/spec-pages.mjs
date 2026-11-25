/** 100-page specification audit register. */

import { SPEC_PAGES_A } from "./spec-pages-a.mjs";
import { SPEC_PAGES_B } from "./spec-pages-b.mjs";

export const SPEC_PAGES = [...SPEC_PAGES_A, ...SPEC_PAGES_B].sort((a, b) => a.page - b.page);

export const STATUS_LABELS = {
  implemented: "Implemented",
  partial: "Partial",
  specified_only: "Specified only",
  external: "External dependency",
};

export function specStats() {
  const counts = { implemented: 0, partial: 0, specified_only: 0, external: 0 };
  for (const p of SPEC_PAGES) counts[p.status] = (counts[p.status] ?? 0) + 1;
  return { total: SPEC_PAGES.length, ...counts };
}

/**
 * Omission check: every page 1..100 must be present exactly once, with a title,
 * a status and at least one implementation note or a documented gap.
 */
export function omissionCheck() {
  const seen = new Map();
  const problems = [];
  for (const p of SPEC_PAGES) {
    if (seen.has(p.page)) problems.push(`Page ${p.page} recorded more than once.`);
    seen.set(p.page, p);
  }
  for (let i = 1; i <= 100; i += 1) {
    const p = seen.get(i);
    if (!p) problems.push(`Page ${i} is missing from the audit register.`);
    else {
      if (!p.title) problems.push(`Page ${i} has no title.`);
      if (!STATUS_LABELS[p.status]) problems.push(`Page ${i} has an unknown status "${p.status}".`);
      if (!(p.built?.length > 0) && !p.gap) problems.push(`Page ${i} has neither an implementation note nor a documented gap.`);
    }
  }
  return { complete: problems.length === 0, problems, pages: SPEC_PAGES.length };
}

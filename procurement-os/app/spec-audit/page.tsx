import { SPEC_PAGES, STATUS_LABELS, specStats, omissionCheck } from "@/lib/data/spec-pages.mjs";
import { Badge, Callout, PageHeader, Panel, Stat } from "@/components/ui";

export const dynamic = "force-static";

const TONE: Record<string, string> = {
  implemented: "emerald",
  partial: "amber",
  specified_only: "violet",
  external: "sky",
};

export default function SpecAuditPage() {
  const stats = specStats();
  const check = omissionCheck();
  const gaps = SPEC_PAGES.filter((p: any) => p.gap);

  return (
    <>
      <PageHeader
        eyebrow="Specification audit"
        title="All 100 pages, statused without omission"
        description="Every page of the master build prompt is recorded with what was built, where it lives, and what remains open. Nothing is marked implemented merely because it is described in the specification."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Pages audited" value={stats.total} hint="Exactly 100 required" />
        <Stat label="Implemented" value={stats.implemented} tone="emerald" />
        <Stat label="Partial" value={stats.partial} tone="amber" />
        <Stat label="Specified only" value={stats.specified_only} tone="violet" />
        <Stat label="External dependency" value={stats.external} tone="sky" />
      </div>

      <div className="mb-4">
        <Callout tone={check.complete ? "emerald" : "rose"} title={check.complete ? "Omission check passed" : "Omission check failed"}>
          {check.complete
            ? `Pages 1–100 are each present exactly once, with a title, a valid status and either an implementation note or a documented gap. ${gaps.length} page(s) carry an open gap.`
            : check.problems.join(" ")}
        </Callout>
      </div>

      <Panel title="Page-by-page register" subtitle="Status reflects this workspace build, not the production target." dense>
        <ul className="divide-y divide-ink-700/40">
          {SPEC_PAGES.map((p: any) => (
            <li key={p.page} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mono mt-0.5 w-[30px] shrink-0 text-[11px] text-slate-500">{String(p.page).padStart(3, "0")}</span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-slate-200">{p.title}</p>
                    {p.built?.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {p.built.map((b: string) => (
                          <li key={b} className="text-[11px] leading-relaxed text-slate-400">
                            · {b}
                          </li>
                        ))}
                      </ul>
                    )}
                    {p.gap && (
                      <p className="mt-1.5 border-l-2 border-signal-amber/50 pl-2 text-[11px] leading-relaxed text-signal-amber/90">
                        Open: {p.gap}
                      </p>
                    )}
                  </div>
                </div>
                <Badge tone={TONE[p.status]}>{STATUS_LABELS[p.status]}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

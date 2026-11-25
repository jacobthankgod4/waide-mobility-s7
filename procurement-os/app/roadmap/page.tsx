import { ROADMAP, ROADMAP_STATS } from "@/lib/data/roadmap.mjs";
import { Badge, Callout, PageHeader, Panel, Stat } from "@/components/ui";

export const dynamic = "force-static";

const TONE: Record<string, string> = { shipped: "emerald", partial: "amber", staged: "neutral" };

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Implementation plan"
        title="Fifty gated phases"
        description="Dependency order matters more than speed. No phase receives additional permission before the phase beneath it passes its gate. Fifty phases replace the specification's eight-stage summary without changing its sequence."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Phases" value={ROADMAP_STATS.total} hint="Across eight stages" />
        <Stat label="Shipped in this build" value={ROADMAP_STATS.shipped} tone="emerald" hint="Built and exercised" />
        <Stat label="Partly built" value={ROADMAP_STATS.partial} tone="amber" hint="Control exists, component deferred" />
        <Stat label="Staged" value={ROADMAP_STATS.staged} hint="Requires infrastructure or a provider" />
      </div>

      <div className="mb-4">
        <Callout tone="amber" title="Staged is not shipped">
          A staged phase is planned and sequenced, not implemented. It is listed here so the build order stays honest: portal automation, live connectors, staffing of
          the email provider and the document-extraction pipeline all remain ahead of any claim of autonomous operation.
        </Callout>
      </div>

      <div className="space-y-4">
        {ROADMAP.map((stage: any) => (
          <Panel key={stage.stage} title={stage.stage} subtitle={`${stage.phases.filter((p: any) => p.status === "shipped").length} of ${stage.phases.length} phases shipped`} dense>
            <ul className="divide-y divide-ink-700/40">
              {stage.phases.map((p: any) => (
                <li key={p.n} className="grid gap-2 px-4 py-2.5 sm:grid-cols-[38px_1fr_auto]">
                  <span className="mono text-[11px] text-slate-500">{String(p.n).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[12.5px] text-slate-200">{p.name}</p>
                    <p className="mt-0.5 text-[10.5px] text-slate-500">
                      Gate: {p.gate} · spec p.{p.pages.join(", ")}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <Badge tone={TONE[p.status]}>{p.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}

import Link from "next/link";
import { currentActor } from "@/lib/session.mjs";
import { buildDashboard, compactMoney, money } from "@/lib/view.mjs";
import { Badge, Meter, PageHeader, Panel, Stat, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const { store } = await currentActor();
  const d = buildDashboard(store);

  const byStage: Record<string, number> = {};
  for (const v of d.views) byStage[v.opp.stage] = (byStage[v.opp.stage] ?? 0) + 1;

  return (
    <>
      <PageHeader
        eyebrow="Opportunity pipeline"
        title="Live procurement opportunities"
        description="Discovery is automatic; eligibility is not assumed. Each record carries its source, retrieval time, deadline timezone and the deterministic gate result."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pipeline value" value={compactMoney(d.kpi.pipelineValue)} hint="Sum of live estimated values" />
        <Stat label="Tier 1 markets" value={store.countries.filter((c: any) => c.tier === 1).length} hint="Nigeria plus six expansion markets" />
        <Stat label="Sectors in scope" value={store.sectors.filter((s: any) => !s.excluded).length} tone="sky" hint="Category C excluded at launch" />
        <Stat label="Amendment risk" value={d.views.filter((v: any) => v.amendmentPending).length} tone="amber" hint="Unincorporated change to price or scope" />
      </div>

      <Panel title="All opportunities" subtitle="Gate verdict is recomputed from evidence on every request." dense>
        <Table head={["Reference", "Opportunity", "Buyer / country", "Sector", "Value", "Deadline", "Requirements", "Gate"]}>
          {d.views.map((v: any) => (
            <tr key={v.opp.id} className="row-hover">
              <td className="td mono text-[11px] text-slate-400">{v.opp.reference}</td>
              <td className="td max-w-[320px]">
                <Link href={`/opportunities/${v.opp.id}`} className="link text-[12.5px]">
                  {v.opp.title}
                </Link>
                {v.amendmentPending && <Badge tone="rose" className="ml-2">amendment</Badge>}
              </td>
              <td className="td text-[12px]">
                {v.opp.buyer}
                <p className="text-[10.5px] text-slate-500">
                  {v.opp.buyerCountry}
                  {v.countryScore ? ` · score ${v.countryScore.score}` : ""}
                </p>
              </td>
              <td className="td">
                <span className="mono text-[11px] text-signal-sky">{v.sector.code}</span>
                <p className="max-w-[150px] text-[10.5px] leading-tight text-slate-500">{v.sector.label}</p>
              </td>
              <td className="td num">{money(v.opp.estimatedValue)}</td>
              <td className="td">
                <span className={`num text-[12px] ${v.deadline.critical ? "text-signal-rose" : "text-slate-300"}`}>{v.deadline.hoursRemaining}h left</span>
                <p className="text-[10px] text-slate-500">{v.deadline.timeZone}</p>
              </td>
              <td className="td w-[110px]">
                <Meter value={v.mandatorySatisfied} max={v.mandatory.length} tone={v.mandatorySatisfied === v.mandatory.length ? "emerald" : "amber"} />
                <p className="mt-1 text-[10.5px] text-slate-500">
                  {v.mandatorySatisfied}/{v.mandatory.length} evidenced
                </p>
              </td>
              <td className="td">
                <Badge tone={v.gate.verdict === "bid_ready" ? "emerald" : v.gate.verdict === "hold" ? "amber" : "rose"}>
                  {v.gate.verdict.replace(/_/g, " ")}
                </Badge>
                <p className="mt-1 text-[10px] text-slate-500">{v.gate.blockers.length} open item(s)</p>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(byStage).map(([stage, count]) => (
          <div key={stage} className="panel px-3 py-2.5">
            <p className="label">{stage.replace(/_/g, " ")}</p>
            <p className="num mt-1 text-[16px] text-slate-200">{count}</p>
          </div>
        ))}
      </div>
    </>
  );
}

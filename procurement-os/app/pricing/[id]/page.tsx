import { notFound } from "next/navigation";
import Link from "next/link";
import { currentActor } from "@/lib/session.mjs";
import { buildOpportunityView, money } from "@/lib/view.mjs";
import { Badge, Callout, KeyValue, Meter, PageHeader, Panel, StatusMark, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { store } = await currentActor();
  const opp = store.opportunities.find((o: any) => o.id === id);
  if (!opp) notFound();
  const v = buildOpportunityView(store, opp);
  if (!v.bid || !v.margin || !v.cash || !v.risk) notFound();

  const { margin, risk, cash, bid } = v;
  const maxOutflow = Math.max(...cash.curve.points.map((p: any) => p.cumOutflow), 1);

  return (
    <>
      <PageHeader
        eyebrow={`Price model · ${opp.reference}`}
        title={`Contribution model — ${opp.title}`}
        description="Waide does not price on buy-minus-sell. Every direct cost is a ledger line with a source, a validity date and a certainty state; an unknown line means no final price."
        actions={<Link href={`/opportunities/${opp.id}`} className="btn">Tender workspace</Link>}
      />

      <div className={`mb-4 ${margin.decision === "eligible" ? "" : ""}`}>
        <Callout
          tone={margin.decision === "eligible" ? "emerald" : margin.decision === "pricing_review" ? "amber" : "rose"}
          title={`Decision: ${margin.decision.replace(/_/g, " ")}`}
        >
          {margin.rationale} {margin.provisional && "The percentage shown is provisional because a direct cost is unknown."}
        </Callout>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Cost waterfall" subtitle={`Sector ${v.sector.code} target ${margin.sectorTargetMin}–${margin.targetMax ?? "—"}%, floor ${margin.sectorFloor}%.`} dense>
          <Table head={["Cost line", "Amount", "Share of revenue", "Certainty", "Source", "Valid to"]}>
            {margin.costLines.map((c: any) => (
              <tr key={c.key}>
                <td className="td text-[12px]">{c.label}</td>
                <td className="td num">{c.amount === null || c.amount === undefined ? <span className="text-signal-rose">unknown</span> : money(c.amount)}</td>
                <td className="td num text-[11.5px] text-slate-500">{c.amount === null ? "—" : `${c.nineLineShare}%`}</td>
                <td className="td">
                  <Badge tone={c.certainty === "verified" ? "emerald" : c.certainty === "estimated" ? "amber" : "rose"}>{c.certainty}</Badge>
                </td>
                <td className="td max-w-[190px] text-[11px] text-slate-400">{c.source}</td>
                <td className="td mono text-[10.5px] text-slate-500">{c.validUntil ?? "—"}</td>
              </tr>
            ))}
            <tr>
              <td className="td text-[12px] text-slate-400">Financing cost</td>
              <td className="td num">{money(margin.financingCost)}</td>
              <td className="td" colSpan={4} />
            </tr>
            <tr>
              <td className="td text-[12px] text-slate-400">Contingency ({margin.contingencyPct}%)</td>
              <td className="td num">{money(margin.contingencyAmount)}</td>
              <td className="td" colSpan={4} />
            </tr>
          </Table>
          <div className="border-t border-ink-700/60 px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="label">Total cost</p>
                <p className="num text-[16px] text-slate-200">{money(margin.totalCost)}</p>
              </div>
              <div>
                <p className="label">Revenue</p>
                <p className="num text-[16px] text-slate-200">{money(margin.revenue)}</p>
              </div>
              <div>
                <p className="label">Contribution</p>
                <p className="num text-[16px] text-signal-emerald">{money(margin.contribution)}</p>
              </div>
              <div>
                <p className="label">Contribution margin</p>
                <p className={`num text-[16px] ${margin.decision === "eligible" ? "text-signal-emerald" : "text-signal-rose"}`}>
                  {margin.provisional ? "~" : ""}
                  {margin.contributionPct}%
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Meter value={Math.max(0, margin.contributionPct)} max={Math.max(margin.targetMax ?? 40, margin.contributionPct)} tone={margin.decision === "eligible" ? "emerald" : margin.decision === "pricing_review" ? "amber" : "rose"} />
              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                <span>0%</span>
                <span>floor {margin.sectorFloor}%</span>
                <span>target {margin.sectorTargetMin}%</span>
                <span>{margin.targetMax ?? ""}%</span>
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Risk-adjusted view" subtitle="Margin alone is not comparable across payment terms.">
            <KeyValue
              columns={1}
              items={[
                ["Payment terms", `${bid.paymentTerms.buyerAdvancePct}% advance · ${bid.paymentTerms.receivableDays}-day receivable`],
                ["Supplier terms", `${bid.supplierTerms.depositPct}% deposit · quote validity ${bid.supplierTerms.quoteValidityDays}d`],
                ["Funding cost", `${money(risk.fundingCostAmount)} (${risk.fundingCostPct}% of revenue over ${risk.carryDays} days)`],
                ["FX drag", `${risk.fxDragPct}%`],
                ["Payment confidence drag", `${risk.confidenceDragPct}%`],
                ["Adjusted margin", <span className={`num ${risk.adjustedContributionPct > margin.sectorFloor ? "text-signal-emerald" : "text-signal-rose"}`}>{risk.adjustedContributionPct}%</span>],
                ["Verdict", <StatusMark status={risk.verdict === "acceptable_after_risk" ? "pass" : "fail"} />],
              ]}
            />
          </Panel>

          <Panel title="Cash requirement" subtitle="Peak funding need, not net contract profit.">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="label">Peak requirement</p>
                <p className="num text-[18px] text-slate-100">{money(cash.curve.peakCashRequirement)}</p>
              </div>
              <div className="text-right">
                <p className="label">Liquidity</p>
                <p className="num text-[13px] text-slate-300">{money(cash.curve.liquidityAvailable)}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {cash.curve.points.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="mono w-[74px] shrink-0 text-[10px] text-slate-500">{p.date.slice(5)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-ink-800">
                    <div
                      className={`h-full ${p.direction === "out" ? "bg-signal-rose/70" : p.fundingClass === "expected" ? "bg-signal-amber/60" : "bg-signal-emerald/70"}`}
                      style={{ width: `${Math.min(100, (p.amount / maxOutflow) * 100)}%` }}
                    />
                  </div>
                  <span className="num w-[70px] shrink-0 text-right text-[10.5px] text-slate-400">{money(p.amount)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
              Buyer promises are not cleared funds. Red = outflow, amber = expected receipt, green = cleared inflow.
            </p>
            <div className="mt-3 border-t border-ink-700/50 pt-3">
              <p className="text-[11.5px]">
                {cash.curve.funded ? (
                  <span className="text-signal-emerald">Fundable — headroom {money(cash.curve.headroom)}</span>
                ) : (
                  <span className="text-signal-rose">{cash.curve.blockingReason}</span>
                )}
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Stress scenarios" subtitle="The same contract under downside assumptions." dense>
          <Table head={["Scenario", "Peak cash", "Headroom", "Funded"]}>
            {cash.scenarios.map((s: any) => (
              <tr key={s.id}>
                <td className="td text-[12px]">{s.label}</td>
                <td className="td num">{money(s.peakCashRequirement)}</td>
                <td className={`td num ${s.funded ? "text-signal-emerald" : "text-signal-rose"}`}>{money(s.headroom)}</td>
                <td className="td">
                  <Badge tone={s.funded ? "emerald" : "rose"}>{s.funded ? "fundable" : "gap"}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel title="Pricing controls applied" dense>
          <ul className="divide-y divide-ink-700/40 text-[12px]">
            {[
              ["Full direct cost base", margin.missingCostLines.length === 0 ? "12 required lines present" : `missing: ${margin.missingCostLines.join(", ")}`],
              ["Unknown cost", margin.unknownCosts.length === 0 ? "none" : margin.unknownCosts.join(", ")],
              ["Unpriced liability", Number(bid.unpricedLiability) > 0 ? money(bid.unpricedLiability) : "none recorded"],
              ["Negative contribution", margin.contribution <= 0 ? "rejected" : "not triggered"],
              ["Floor breach", margin.contributionPct < margin.sectorFloor ? "below floor — no auto-submit" : "within policy"],
              ["Exception route", "MD + Finance dual approval, recorded against this price version"],
            ].map(([k, val]) => (
              <li key={k as string} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span className="text-slate-400">{k}</span>
                <span className="text-right text-slate-200">{val}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

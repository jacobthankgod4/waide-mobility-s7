import Link from "next/link";
import { currentActor } from "@/lib/session.mjs";
import { buildDashboard, compactMoney, money, buildCommsView } from "@/lib/view.mjs";
import { Badge, Callout, Dot, PageHeader, Panel, Stat, StatusMark, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { store, actor } = await currentActor();
  const d = buildDashboard(store);
  const comms = buildCommsView(store);
  const flaggedComms = comms.filter((c) => ["blocked", "quarantined", "human_approval"].includes(c.decision as string));

  return (
    <>
      <PageHeader
        eyebrow="Command dashboard"
        title="What needs a decision, and what the system refuses to do without one"
        description="Every figure below is computed from the evidence, policy and authority records — not from an agent's narrative. A hold means a mandatory fact is unknown; it is never a pass."
      />

      {store.policy.status !== "approved" && (
        <div className="mb-5">
          <Callout tone="amber" title="Policy not yet authorised">
            {store.policy.statusNote} Acting role: <strong className="text-slate-200">{actor.name}</strong> — {actor.title}.
          </Callout>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Pipeline value" value={compactMoney(d.kpi.pipelineValue)} hint={`${d.kpi.opportunities} live opportunities`} />
        <Stat label="Bid-ready" value={d.kpi.bidReady} tone="emerald" hint="Every mandatory gate passed" />
        <Stat label="Held" value={d.kpi.held} tone="amber" hint="Unknown fact — system will not assume" />
        <Stat label="Pending approvals" value={d.kpi.pendingApprovals} tone="amber" hint="Human authority required" />
        <Stat label="Critical exceptions" value={d.kpi.criticalExceptions} tone="rose" hint="Open, owner-assigned" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel
          title="Bid gate — every opportunity"
          subtitle="Mandatory gates are enforced in deterministic code. A failure is no-bid; an unknown is a hold."
          dense
        >
          <Table head={["Opportunity", "Buyer", "Deadline", "Margin", "Gate", "Primary blocker"]}>
            {d.views.map((v: any) => (
              <tr key={v.opp.id} className="row-hover">
                <td className="td">
                  <Link href={`/opportunities/${v.opp.id}`} className="link text-[12.5px]">
                    {v.opp.title}
                  </Link>
                  <p className="mono mt-0.5 text-[10.5px] text-slate-500">{v.opp.reference}</p>
                </td>
                <td className="td text-[12px]">{v.opp.buyer}</td>
                <td className="td">
                  <span className={`num text-[12px] ${v.deadline.critical ? "text-signal-rose" : ""}`}>{v.deadline.hoursRemaining}h</span>
                  <p className="text-[10.5px] text-slate-500">{v.deadline.timeZone}</p>
                </td>
                <td className="td">
                  {v.margin ? (
                    <span className={v.margin.decision === "eligible" ? "text-signal-emerald" : v.margin.decision === "pricing_review" ? "text-signal-amber" : "text-signal-rose"}>
                      {v.margin.provisional ? "~" : ""}
                      {v.margin.contributionPct}%
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                  <p className="text-[10.5px] text-slate-500">floor {v.margin?.sectorFloor ?? "—"}%</p>
                </td>
                <td className="td">
                  <Badge tone={v.gate.verdict === "bid_ready" ? "emerald" : v.gate.verdict === "hold" ? "amber" : "rose"}>
                    {v.gate.verdict.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="td max-w-[240px] text-[11.5px] text-slate-400">{v.gate.blockers[0]?.note ?? "—"}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Approval queue" action={<Link href="/approvals" className="link text-[11px]">Open centre →</Link>} dense>
            <ul className="divide-y divide-ink-700/40">
              {d.pending.map((a: any) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12.5px] leading-snug text-slate-200">{a.subjectLabel}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{a.summary}</p>
                    </div>
                    <Badge tone={a.risk === "red" ? "rose" : "amber"}>{a.risk}</Badge>
                  </div>
                  <p className="mono mt-2 text-[10.5px] text-slate-600">
                    {a.action} · needs {(a.requiredRoles ?? []).join(" + ")}
                  </p>
                </li>
              ))}
              {d.pending.length === 0 && <li className="px-4 py-6 text-center text-[12px] text-slate-500">No pending approvals.</li>}
            </ul>
          </Panel>

          <Panel title="Where the system stops" dense>
            <ul className="divide-y divide-ink-700/40">
              {d.blockerCounts.map(([label, count]: any) => (
                <li key={label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[12px] text-slate-300">{label}</span>
                  <span className="mono text-[12px] text-signal-amber">{count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Country intelligence" subtitle="Weighted 0–100. A legal prohibition overrides any score." dense>
          <ul className="divide-y divide-ink-700/40">
            {d.countries.map((c: any) => (
              <li key={c.code} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div>
                  <p className="text-[12.5px] text-slate-200">
                    {c.name} <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-500">Tier {c.tier}</span>
                  </p>
                  <p className="text-[10.5px] text-slate-500">{c.blocked ? c.hardStops[0].label.slice(0, 52) + "…" : c.band.label}</p>
                </div>
                <div className="text-right">
                  <p className={`num text-[14px] ${c.blocked ? "text-signal-rose" : c.score >= 75 ? "text-signal-emerald" : "text-signal-amber"}`}>{c.score}</p>
                  <p className="text-[10px] text-slate-600">cov {c.coverage}%</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Evidence needing refresh" subtitle="Ageing evidence cannot support a submission." dense>
          <ul className="divide-y divide-ink-700/40">
            {d.expiring.slice(0, 6).map(({ doc, f }: any) => (
              <li key={doc.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-slate-200">{doc.title}</p>
                  <p className="text-[10.5px] text-slate-500">{doc.class.replace(/_/g, " ")}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusMark status={f.status} />
                  <p className="mono mt-1 text-[10px] text-slate-500">{f.daysLeft !== null ? `${f.daysLeft}d` : "—"}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Correspondence holding" subtitle="Outbound classes, quarantine and approvals." dense>
          <ul className="divide-y divide-ink-700/40">
            {flaggedComms.slice(0, 5).map((c: any) => (
              <li key={c.message.id} className="px-4 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[12px] text-slate-200">{c.message.subject}</p>
                  <Badge tone={c.decision === "blocked" || c.decision === "quarantined" ? "rose" : "amber"}>
                    {String(c.decision).replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-[10.5px] text-slate-500">{(c.message.intent ?? "inbound correspondence").replace(/_/g, " ")}</p>
              </li>
            ))}
            {flaggedComms.length === 0 && <li className="px-4 py-6 text-center text-[12px] text-slate-500">Nothing held.</li>}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Active contracts" dense>
          <Table head={["Contract", "Buyer", "Value", "Stage", "Closeout"]}>
            {d.activeContracts.map((c: any) => (
              <tr key={c.id} className="row-hover">
                <td className="td">
                  <Link href={`/contracts/${c.id}`} className="link text-[12px]">
                    {c.title}
                  </Link>
                  <p className="mono text-[10px] text-slate-500">{c.reference}</p>
                </td>
                <td className="td text-[11.5px]">{c.buyer}</td>
                <td className="td num">{money(c.value)}</td>
                <td className="td">
                  <Badge tone={c.status === "fulfilment" ? "sky" : "amber"}>{c.status.replace(/_/g, " ")}</Badge>
                </td>
                <td className="td text-[11.5px] text-slate-400">{c.closeout?.deliveryAccepted ? "accepted" : "open obligations"}</td>
              </tr>
            ))}
            {d.activeContracts.length === 0 && (
              <tr>
                <td className="td text-slate-500" colSpan={5}>
                  No active contracts.
                </td>
              </tr>
            )}
          </Table>
        </Panel>

        <Panel title="Governance integrity" dense>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <p className="label">Audit chain</p>
              <p className="mt-1 flex items-center gap-2 text-[13px]">
                <Dot tone={d.ledger.valid ? "emerald" : "rose"} />
                {d.ledger.valid ? `Verified · ${d.ledger.events} sealed events` : "INTEGRITY FAILURE"}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Hash-chained, append-only. Rewriting any event breaks verification.</p>
            </div>
            <div>
              <p className="label">Supplier approval</p>
              <p className="mt-1 text-[13px] text-slate-200">
                {d.kpi.suppliersApproved} of {d.kpi.suppliersTotal} at S2/S3
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Only S2 or S3 suppliers may support a product-specific bid.</p>
            </div>
            <div>
              <p className="label">Cash &amp; facility</p>
              <p className="num mt-1 text-[13px] text-slate-200">
                {money(d.kpi.cash)} + {money(d.kpi.facility)}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Cleared cash and committed facility only; buyer promises are excluded.</p>
            </div>
            <div>
              <p className="label">Margin position</p>
              <p className="mt-1 text-[13px] text-slate-200">
                <span className="text-signal-emerald">{d.marginBand.eligible} eligible</span> ·{" "}
                <span className="text-signal-amber">{d.marginBand.review} review</span> ·{" "}
                <span className="text-signal-rose">{d.marginBand.blocked} blocked</span>
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Sector floors are company policy and cannot be overridden by an agent.</p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

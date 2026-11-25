import { currentActor } from "@/lib/session.mjs";
import { buildComplianceView } from "@/lib/view.mjs";
import { resolveScreening } from "@/app/actions";
import { Badge, Callout, PageHeader, Panel, Stat, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CompliancePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { store, actor } = await currentActor();
  const { error } = await searchParams;
  const c = buildComplianceView(store);
  const unresolved = c.screenings.filter((s: any) => !s.resolved);
  const materialConflicts = c.conflicts.filter((x: any) => x.status === "unresolved");

  return (
    <>
      <PageHeader
        eyebrow="Compliance & screening"
        title="Restricted parties, conflicts and jurisdictional controls"
        description="Screening covers every party to a transaction — supplier, manufacturer, exporter, buyer, end user, forwarder, consignee, bank and beneficial owner. A hit is a hold, not a verdict."
      />

      {error && (
        <div className="mb-4">
          <Callout tone="rose" title="Action refused">
            {error}
          </Callout>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Unresolved screenings" value={unresolved.length} tone="rose" hint="Workflows frozen until resolved" />
        <Stat label="Confirmed matches" value={c.screenings.filter((s: any) => s.status === "confirmed_match").length} tone="rose" hint="Reject unless a licence applies" />
        <Stat label="Material conflicts" value={materialConflicts.length} tone="amber" hint="Hold pending legal review" />
        <Stat label="Country hard stops" value={c.countries.filter((x: any) => x.blocked).length} tone="rose" hint="Legal prohibition overrides score" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Screening register" subtitle="Match confidence, list and resolution state are preserved." dense>
          <Table head={["Party", "Party type", "Lists", "Match", "Workflow", "Resolution"]}>
            {c.screenings.map((s: any) => (
              <tr key={s.id}>
                <td className="td">
                  <p className="text-[12px] text-slate-200">{s.party}</p>
                  <p className="text-[10.5px] text-slate-500">
                    {s.country} · {s.id}
                  </p>
                </td>
                <td className="td text-[11px] text-slate-400">{s.contractId ? "freight forwarder" : "supplier"}</td>
                <td className="td mono text-[10.5px]">{s.listId ?? "all"}</td>
                <td className="td">
                  <Badge tone={s.status === "clear" ? "emerald" : s.status === "potential_match" ? "amber" : "rose"}>{s.status.replace(/_/g, " ")}</Badge>
                  {s.live?.matches?.[0] && <p className="mt-1 text-[10px] text-slate-500">{Math.round(s.live.matches[0].similarity * 100)}% similarity</p>}
                </td>
                <td className="td text-[11px]">
                  {s.workflowFrozen ? <span className="text-signal-rose">frozen</span> : <span className="text-signal-emerald">open</span>}
                </td>
                <td className="td">
                  {s.resolved ? (
                    <span className="text-[11px] text-signal-emerald">resolved — {s.resolution?.outcome ?? "cleared"}</span>
                  ) : (
                    <form action={resolveScreening} className="flex flex-col gap-1">
                      <input type="hidden" name="screeningId" value={s.id} />
                      <select name="outcome" className="input py-1 text-[11px]" defaultValue="false_positive">
                        <option value="false_positive">False positive</option>
                        <option value="confirmed_match">Confirmed match</option>
                      </select>
                      <input name="note" placeholder="Evidence reference" className="input py-1 text-[11px]" />
                      <button type="submit" className="btn py-1 text-[11px]">
                        Resolve as {actor.role === "compliance_officer" || actor.role === "managing_director" ? "reviewer" : "— role denied"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          <div className="border-t border-ink-700/60 px-4 py-2.5">
            <p className="text-[10.5px] leading-relaxed text-slate-500">
              Screening runs against the harvested OFAC SDN and UN Security Council consolidated lists, with the list version recorded per screening. The World Bank ineligible-firm list and the US Consolidated Screening List are configured but not yet harvested; a list that is not loaded fails closed as unavailable rather than returning a clear result.
            </p>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Conflict register" dense>
            <ul className="divide-y divide-ink-700/40">
              {c.conflicts.map((x: any) => (
                <li key={x.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] text-slate-200">{x.party}</p>
                    <Badge tone={x.status === "cleared" ? "emerald" : "rose"}>{x.status}</Badge>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{x.relationship}</p>
                  <p className="mt-1 text-[10.5px] text-slate-500">
                    {x.opportunity?.reference} · found by {x.discoveredBy}
                  </p>
                  {x.status !== "cleared" && <p className="mt-1 text-[10.5px] text-signal-amber">{x.note}</p>}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Control regimes in scope" dense>
            <div className="space-y-2 px-4 py-3 text-[11px] leading-relaxed text-slate-400">
              <p><span className="text-slate-200">Export control</span> — dual-use sensors, high-performance positioning and specialised computing require classification before quotation.</p>
              <p><span className="text-slate-200">Sanctions</span> — screen parties, ownership, route and financial institutions; a licence may lawfully permit otherwise prohibited activity.</p>
              <p><span className="text-slate-200">Medical</span> — NAFDAC registration for the exact model; SONCAP applies only to goods within its scope; CE/ISO is not a destination approval.</p>
              <p><span className="text-slate-200">Data protection</span> — NDPA lawful basis and documented cross-border transfer; no confidential buyer data for model training.</p>
              <p><span className="text-slate-200">Integrity</span> — no unofficial payments, undisclosed commissions, bid coordination or evaluator influence; agent register maintained.</p>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Panel title="Country score matrix" subtitle="Weighted components, coverage and hard stops." dense>
          <Table head={["Country", "Tier", "Score", "Coverage", "Band", "Decision", "Hard stop"]}>
            {c.countries.map((x: any) => (
              <tr key={x.code}>
                <td className="td text-[12px]">{x.name}</td>
                <td className="td mono text-[11px]">{x.tier}</td>
                <td className={`td num ${x.blocked ? "text-signal-rose" : x.score >= 75 ? "text-signal-emerald" : "text-signal-amber"}`}>{x.score}</td>
                <td className="td text-[11px] text-slate-400">{x.coverage}% · {x.confidence}</td>
                <td className="td text-[11px]">{x.band.label}</td>
                <td className="td text-[11px] text-slate-400">{x.decisionLabel}</td>
                <td className="td max-w-[220px] text-[10.5px] text-signal-rose">{x.hardStops[0]?.label ?? "—"}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </>
  );
}

import { currentActor } from "@/lib/session.mjs";
import { verifyChain, explain } from "@/lib/engines/ledger.mjs";
import { Badge, Callout, PageHeader, Panel, Stat, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { store } = await currentActor();
  const { subject } = await searchParams;
  const chain = store.ledger ?? [];
  const integrity = verifyChain(chain);
  const activeSubject = subject ?? "OPP-2026-021";
  const reconstruction = explain(chain, activeSubject);
  const subjects = [...new Set(chain.map((e: any) => e.subject))] as string[];

  return (
    <>
      <PageHeader
        eyebrow="Audit ledger"
        title="Append-only event history"
        description="Every material action records actor, actor type, action, subject, policy decision, approval, evidence and result. Events are hash-chained, so a rewritten history fails verification."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Events sealed" value={chain.length} />
        <Stat label="Chain integrity" value={integrity.valid ? "verified" : "broken"} tone={integrity.valid ? "emerald" : "rose"} hint={integrity.valid ? `head ${String(integrity.head).slice(0, 12)}…` : integrity.reason} />
        <Stat label="Distinct subjects" value={subjects.length} hint="Opportunities, suppliers, payments, messages" />
        <Stat label="Human vs agent" value={`${chain.filter((e: any) => e.actorType === "human").length} / ${chain.filter((e: any) => e.actorType === "agent").length}`} tone="sky" hint="Attribution is recorded, never inferred" />
      </div>

      <div className="mb-4">
        <Callout tone={integrity.valid ? "emerald" : "rose"} title={integrity.valid ? "Verification passed" : "Verification failed"}>
          {integrity.valid
            ? `All ${integrity.events} events verify against their predecessors. Reconstructing why the system acted is possible for every subject.`
            : `Broken at event ${integrity.brokenAt}: ${integrity.reason}`}
        </Callout>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Event stream" subtitle="Newest first." dense>
          <Table head={["Seq", "Time", "Actor", "Action", "Subject", "Decision / result", "Hash"]}>
            {[...chain].reverse().map((e: any) => (
              <tr key={e.seq}>
                <td className="td mono text-[10.5px] text-slate-500">{String(e.seq).padStart(3, "0")}</td>
                <td className="td mono text-[10.5px] text-slate-500">{new Date(e.ts).toLocaleString()}</td>
                <td className="td text-[11px]">
                  {e.actor}
                  <p className={`text-[10px] ${e.actorType === "agent" ? "text-signal-sky" : "text-slate-500"}`}>{e.actorType}</p>
                </td>
                <td className="td mono text-[10.5px] text-slate-300">{e.action}</td>
                <td className="td text-[11px]">
                  <a href={`/audit?subject=${encodeURIComponent(e.subject)}`} className="link">
                    {e.subject}
                  </a>
                </td>
                <td className="td max-w-[300px] text-[11px] text-slate-400">
                  {e.policyDecision && <p>{e.policyDecision}</p>}
                  {e.result && <p className="text-slate-500">{e.result}</p>}
                </td>
                <td className="td mono text-[10px] text-slate-600">{e.hash.slice(0, 10)}…</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel title={`Reconstruction — ${activeSubject}`} subtitle="Why did the system act?" dense>
          {reconstruction.reconstructable ? (
            <ol className="divide-y divide-ink-700/40">
              {reconstruction.narrative.map((n: any, i: number) => (
                <li key={i} className="px-4 py-3">
                  <p className="mono text-[10px] text-slate-500">{new Date(n.at).toLocaleString()}</p>
                  <p className="mt-0.5 text-[11.5px] text-slate-200">{n.did}</p>
                  <p className="text-[10.5px] text-slate-500">{n.who}</p>
                  {n.decision && <p className="mt-1 text-[10.5px] text-slate-400">Policy: {n.decision}</p>}
                  {n.approval && <p className="text-[10.5px] text-signal-emerald">Approval: {n.approval}</p>}
                  {n.result && <p className="text-[10.5px] text-slate-500">{n.result}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-4 py-4 text-[12px] text-slate-500">No events recorded for {activeSubject}.</p>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Subjects" dense>
          <div className="flex flex-wrap gap-1.5 p-3">
            {subjects.map((s: string) => (
              <a key={s} href={`/audit?subject=${encodeURIComponent(s)}`} className="rounded border border-ink-700 px-2 py-1 text-[10.5px] text-slate-400 hover:border-ink-600 hover:text-slate-200">
                {s}
              </a>
            ))}
          </div>
          <div className="border-t border-ink-700/50 px-4 py-2.5">
            <Badge tone="neutral">Retention</Badge>
            <span className="ml-2 text-[10.5px] text-slate-500">Corrections are appended, never overwritten. Export packs are generated from this stream.</span>
          </div>
        </Panel>
      </div>
    </>
  );
}

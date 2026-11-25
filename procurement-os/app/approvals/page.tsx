import Link from "next/link";
import { currentActor } from "@/lib/session.mjs";
import { actorCapabilities, money } from "@/lib/view.mjs";
import { decideApproval } from "@/app/actions";
import { Badge, Callout, PageHeader, Panel, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { store, actor } = await currentActor();
  const { error } = await searchParams;
  const caps = actorCapabilities(store, actor);
  const groups = {
    red: store.approvals.filter((a: any) => a.risk === "red"),
    amber: store.approvals.filter((a: any) => a.risk === "amber"),
  };
  const pending = store.approvals.filter((a: any) => ["pending", "awaiting_second", "blocked"].includes(a.status));

  return (
    <>
      <PageHeader
        eyebrow="Approval centre"
        title="Decisions that only a named human may make"
        description="Green work runs autonomously. Amber work is prepared and needs a decision. Red work is paused. Every decision is bound to a payload hash, so a later change to price, quantity, destination or counterparty voids it."
      />

      {error && (
        <div className="mb-4">
          <Callout tone="rose" title="Decision refused">
            {error}
          </Callout>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Awaiting decision" value={pending.length} tone="amber" hint="Across amber and red" />
        <Stat label="Red / paused" value={groups.red.length} tone="rose" hint="Authority, fraud or uncapped exposure" />
        <Stat label="Your delegation" value={caps.filter((c: any) => c.allowed).length} tone="sky" hint="Capabilities for your role" />
        <Stat label="Policy threshold" value={money(store.settings.dualApprovalThreshold)} hint="Dual approval above this value" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {pending.length === 0 && (
            <Panel title="Queue clear">
              <p className="text-[12.5px] text-slate-400">No approvals are outstanding.</p>
            </Panel>
          )}

          {pending.map((a: any) => {
            const cap = caps.find((c: any) => c.action === a.action);
            const open = ["pending", "awaiting_second"].includes(a.status);
            const alreadyDecided = (a.decisions ?? []).some((d: any) => d.role === actor.role);
            const canDecide = cap?.allowed && open && !alreadyDecided;
            return (
              <Panel
                key={a.id}
                title={`${a.id} · ${a.action}`}
                subtitle={a.summary}
                action={
                  <Badge tone={a.status === "blocked" ? "neutral" : a.risk === "red" ? "rose" : "amber"}>
                    {a.status === "blocked" ? "held" : a.status === "awaiting_second" ? "awaiting second" : a.risk === "red" ? "paused" : "awaiting decision"}
                  </Badge>
                }
              >
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="label">Subject</p>
                    <p className="text-[12.5px] text-slate-200">{a.subjectLabel}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Value {money(a.amount)} · requested {new Date(a.requestedAt).toLocaleString()} · deadline {new Date(a.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="label">Required authority</p>
                    <p className="text-[12.5px] text-slate-200">{(a.requiredRoles ?? []).join(" + ")}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Payload {a.payloadHash} · status {a.status.replace(/_/g, " ")}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="label mb-1">Evidence bundle</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(a.evidence ?? []).map((e: string) => (
                      <Badge key={e} tone="neutral">
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>

                {(a.decisions ?? []).length > 0 && (
                  <div className="mb-3 rounded border border-ink-700/60 bg-ink-950/40 px-3 py-2">
                    <p className="label mb-1">Recorded decisions</p>
                    {a.decisions.map((d: any, i: number) => (
                      <p key={i} className="text-[11.5px] text-slate-400">
                        {d.by} ({d.role}) at {new Date(d.at).toLocaleTimeString()} {d.rationale ? `— ${d.rationale}` : ""}
                      </p>
                    ))}
                  </div>
                )}

                {!open ? (
                  <Callout tone="amber" title={`Held — ${a.status.replace(/_/g, " ")}`}>
                    A deterministic gate is blocking this approval. The underlying condition must be remedied before any decision can be recorded; approving it here would not release the action.
                  </Callout>
                ) : alreadyDecided ? (
                  <Callout tone="neutral" title="You have already decided">
                    {a.status === "awaiting_second"
                      ? `A distinct authority is required for the second decision (${a.secondApproverRole ?? "another required role"}).`
                      : "This approval already carries your decision."}
                  </Callout>
                ) : canDecide ? (
                  <form action={decideApproval} className="space-y-2">
                    <input type="hidden" name="approvalId" value={a.id} />
                    <input type="hidden" name="returnTo" value="/approvals" />
                    <textarea
                      name="rationale"
                      rows={2}
                      placeholder="Decision rationale — stored immutably against this payload hash"
                      className="input"
                    />
                    <div className="flex gap-2">
                      <button type="submit" name="decision" value="approve" className="btn btn-primary">
                        Approve within my authority
                      </button>
                      <button type="submit" name="decision" value="reject" className="btn btn-danger">
                        Reject
                      </button>
                    </div>
                  </form>
                ) : (
                  <Callout tone="neutral" title="Your role is not delegated for this action">
                    {(cap?.reasons ?? ["Fail closed: no matching capability for this role."]).join(" ")} Switch acting role above to test the authority model.
                  </Callout>
                )}
              </Panel>
            );
          })}
        </div>

        <div className="space-y-4">
          <Panel title="Your authority" subtitle="Resolved by the deterministic policy engine, not by the interface." dense>
            <ul className="divide-y divide-ink-700/40">
              {caps.map((c: any) => (
                <li key={c.action} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] text-slate-300">{c.label}</p>
                    <p className="mono text-[10px] text-slate-600">{c.mode}</p>
                  </div>
                  <Badge tone={c.allowed ? (c.mode === "dual" ? "amber" : "emerald") : "rose"}>{c.allowed ? (c.mode === "dual" ? "dual" : "allowed") : "denied"}</Badge>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Succession & availability" dense>
            <div className="space-y-2 px-4 py-3 text-[11.5px] leading-relaxed text-slate-400">
              <p>
                Primary signatory: <span className="text-slate-200">Managing Director</span> (proposed, pending board resolution).
              </p>
              <p>Alternate approver: <span className="text-slate-200">Finance Approver</span> for financial instruments within limit.</p>
              <p>Escalation timetable: red items notify at request, then 24h, then 4h before deadline.</p>
              <p>Emergency stop: any approver may halt a workflow; the halt is written to the ledger.</p>
              <p className="text-signal-amber">Approvals expire after 72h or on any material change, whichever is sooner.</p>
            </div>
          </Panel>

          <Panel title="Nothing here is a signature" dense>
            <p className="px-4 py-3 text-[11.5px] leading-relaxed text-slate-400">
              An approval authorises the next controlled step. It does not apply an electronic signature, execute a deed, or attest personal knowledge. Those
              remain reserved to the named human under CAMA 2020 s.101–102, subject to counsel confirmation.
            </p>
            <div className="border-t border-ink-700/50 px-4 py-2">
              <Link href="/policies" className="link text-[11px]">
                View the capability matrix →
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

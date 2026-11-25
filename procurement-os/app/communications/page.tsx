import { currentActor } from "@/lib/session.mjs";
import { buildCommsView } from "@/lib/view.mjs";
import { Badge, Callout, PageHeader, Panel, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

const DECISION_TONE: Record<string, string> = {
  autonomous: "emerald",
  human_approval: "amber",
  blocked: "rose",
  quarantined: "rose",
  safe: "emerald",
};

export default async function CommunicationsPage() {
  const { store } = await currentActor();
  const comms = buildCommsView(store);
  const outbound = comms.filter((c: any) => c.direction === "outbound");
  const inbound = comms.filter((c: any) => c.direction === "inbound");

  return (
    <>
      <PageHeader
        eyebrow="Correspondence"
        title="What the agent may send, and what it may never send"
        description="Every outbound message is classified by intent, then checked for recipient authenticity, evidence, attachments, confidentiality, commitment language, sender authority and duplicate send."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Autonomous" value={outbound.filter((c: any) => c.decision === "autonomous").length} tone="emerald" hint="RFQs, follow-ups, acknowledgements" />
        <Stat label="Needs approval" value={outbound.filter((c: any) => c.decision === "human_approval").length} tone="amber" hint="Final quotation, eligibility, commitments" />
        <Stat label="Blocked" value={outbound.filter((c: any) => c.decision === "blocked").length} tone="rose" hint="Commitment or duplicate risk" />
        <Stat label="Quarantined inbound" value={inbound.filter((c: any) => c.decision === "quarantined").length} tone="rose" hint="Injection or exfiltration attempt" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {outbound.map((c: any) => (
            <Panel
              key={c.message.id}
              title={c.message.subject}
              subtitle={`${c.message.intent.replace(/_/g, " ")} · to ${c.message.to ?? "—"}`}
              action={<Badge tone={DECISION_TONE[c.decision] ?? "neutral"}>{String(c.decision).replace(/_/g, " ")}</Badge>}
            >
              <p className="mb-3 whitespace-pre-line rounded border border-ink-700/60 bg-ink-950/40 px-3 py-2 text-[12px] leading-relaxed text-slate-300">
                {c.message.body}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {c.evaluation.checks.map((k: any) => (
                  <div key={k.id} className="flex items-start gap-2">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${k.ok ? "bg-signal-emerald" : "bg-signal-rose"}`} />
                    <div>
                      <p className="text-[11px] text-slate-300">{k.label}</p>
                      {!k.ok && <p className="text-[10.5px] text-slate-500">{k.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {(c.evaluation.blockers.length > 0 || c.evaluation.escalations.length > 0) && (
                <div className="mt-3 space-y-1 border-t border-ink-700/50 pt-2">
                  {c.evaluation.blockers.map((b: string) => (
                    <p key={b} className="text-[11px] text-signal-rose">
                      Blocked — {b}
                    </p>
                  ))}
                  {c.evaluation.escalations.map((e: string) => (
                    <p key={e} className="text-[11px] text-signal-amber">
                      Escalated — {e}
                    </p>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-600">
                <span className="mono">idempotency: {c.message.idempotencyKey ?? "missing"}</span>
                <span>·</span>
                <span className="mono">signature: Waide Procurement Operations</span>
              </div>
            </Panel>
          ))}
        </div>

        <div className="space-y-4">
          {inbound.map((c: any) => (
            <Panel
              key={c.message.id}
              title={c.message.subject}
              subtitle={`From ${c.message.from} · untrusted external content`}
              action={<Badge tone="rose">quarantined</Badge>}
            >
              <p className="mb-3 whitespace-pre-line rounded border border-signal-rose/25 bg-signal-rose/[0.05] px-3 py-2 text-[11.5px] leading-relaxed text-slate-300">
                {c.message.body}
              </p>
              <p className="label mb-1.5">Detected</p>
              <ul className="space-y-1.5">
                {c.scan.findings.map((f: any) => (
                  <li key={f.id} className="text-[11px]">
                    <span className="text-signal-rose">{f.label}</span>
                    <p className="mono text-[10px] text-slate-500">“{f.excerpt}”</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-ink-700/50 pt-2 text-[10.5px] leading-relaxed text-slate-500">
                {c.scan.rule} {c.scan.escalation}
              </div>
            </Panel>
          ))}

          <Panel title="Mandatory email controls" dense>
            <ul className="divide-y divide-ink-700/40 text-[11.5px] text-slate-400">
              <li className="px-4 py-2.5">Every AI email is linked to an opportunity, supplier or contract record.</li>
              <li className="px-4 py-2.5">Every send carries a unique business-event key so retries cannot duplicate.</li>
              <li className="px-4 py-2.5">Inbound messages are matched to the correct thread and opportunity, never to a company name.</li>
              <li className="px-4 py-2.5">Webhook events are deduplicated by event ID; failures dead-letter and alarm.</li>
              <li className="px-4 py-2.5">A second, human channel exists for emergency notification.</li>
            </ul>
          </Panel>

          <Panel title="Channel health" dense>
            <ul className="divide-y divide-ink-700/40">
              {store.notificationChannels.map((ch: any) => (
                <li key={ch.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11.5px] text-slate-200">{ch.name}</p>
                    <Badge tone={ch.status === "healthy" ? "emerald" : "amber"}>{ch.status}</Badge>
                  </div>
                  <p className="mt-1 text-[10.5px] text-slate-500">{ch.detail}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

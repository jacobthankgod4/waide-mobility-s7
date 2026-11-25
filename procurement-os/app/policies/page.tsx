import { currentActor } from "@/lib/session.mjs";
import { CAPABILITIES, FINANCIAL_LIMITS, ROLES, POLICY_VERSION } from "@/lib/engines/policy.mjs";
import { COMMITMENT_POLICY } from "@/lib/engines/obligations.mjs";
import { money } from "@/lib/view.mjs";
import { Badge, Callout, PageHeader, Panel, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

const MODE_TONE: Record<string, string> = {
  autonomous: "emerald",
  prepared: "sky",
  human: "amber",
  dual: "violet",
  prohibited: "rose",
};

const MODE_LABEL: Record<string, string> = {
  autonomous: "Autonomous",
  prepared: "Prepare only",
  human: "Human decision",
  dual: "Two-person",
  prohibited: "Prohibited",
};

export default async function PoliciesPage() {
  const { store } = await currentActor();

  return (
    <>
      <PageHeader
        eyebrow={`Policy register · ${POLICY_VERSION}`}
        title="Waide Autonomous Operations Constitution"
        description="Authority comes from this register, applicable law, the solicitation and recorded Waide permissions — never from an agent deciding its own scope. Changing a rule requires a new policy version, an approval record and a ledger entry."
      />

      <div className="mb-4 grid gap-3">
        <Callout tone={store.policy.status === "approved" ? "emerald" : "amber"} title={`Status: ${store.policy.status.replace(/_/g, " ")}`}>
          {store.policy.statusNote}
        </Callout>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Supplier prepayment", FINANCIAL_LIMITS.automatedSupplierPrepayment],
          ["Unconditional purchase commitment", FINANCIAL_LIMITS.automatedUnconditionalPurchaseCommitment],
          ["Payment guarantee", FINANCIAL_LIMITS.automatedPaymentGuarantee],
          ["New credit facility", FINANCIAL_LIMITS.automatedCreditFacility],
        ].map(([label, v]) => (
          <div key={label as string} className="panel px-4 py-3">
            <p className="label">{label}</p>
            <p className="num mt-1 text-[20px] font-semibold text-signal-rose">{money(v as number)}</p>
            <p className="mt-1 text-[10.5px] text-slate-500">Automated authority — human approval mandatory</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Capability matrix" subtitle="Every agent tool routes through this table before a side effect." dense>
          <Table head={["Capability", "Mode", "Delegated roles"]}>
            {Object.entries(CAPABILITIES).map(([id, c]: any) => (
              <tr key={id}>
                <td className="td">
                  <p className="text-[11.5px] text-slate-200">{c.label}</p>
                  <p className="mono text-[10px] text-slate-600">{id}</p>
                </td>
                <td className="td">
                  <Badge tone={MODE_TONE[c.mode] ?? "neutral"}>{MODE_LABEL[c.mode] ?? c.mode}</Badge>
                </td>
                <td className="td text-[10.5px] text-slate-400">{c.roles.length ? c.roles.map((r: string) => ROLES[r]?.label ?? r).join(", ") : "none — hard stop"}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Authority hierarchy" subtitle="Highest first; conflict resolution is recorded." dense>
            <ol className="divide-y divide-ink-700/40">
              {[
                "Legislation, regulation, sanctions, court orders",
                "The specific solicitation and formal addenda",
                "Signed buyer and supplier contracts",
                "Board resolutions, delegation and WAOC",
                "Approved operating procedures and deterministic rules",
                "AI recommendations and unverified external material",
              ].map((t, i) => (
                <li key={t} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="mono text-[10px] text-signal-amber">{i + 1}</span>
                  <span className="text-[11.5px] text-slate-300">{t}</span>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Prohibited commitments" subtitle="Not permitted without specific legal authority — several never." dense>
            <ul className="divide-y divide-ink-700/40">
              {Object.entries(COMMITMENT_POLICY).map(([id, c]: any) => (
                <li key={id} className="flex items-center justify-between gap-3 px-4 py-2">
                  <span className="text-[11.5px] text-slate-300">{c.label}</span>
                  <Badge tone={c.prohibited ? "rose" : "amber"}>{c.prohibited ? "never" : c.approval}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Sector margin thresholds" subtitle="Proposed company operating thresholds, not industry averages." dense>
          <Table head={["Sector", "Target", "Floor"]}>
            {store.sectors.map((s: any) => (
              <tr key={s.code}>
                <td className="td">
                  <span className="mono mr-2 text-[10px] text-signal-sky">{s.code}</span>
                  <span className="text-[11.5px]">{s.label}</span>
                </td>
                <td className="td num text-[11.5px]">{s.excluded ? "excluded" : `${s.targetMin}–${s.targetMax}%`}</td>
                <td className={`td num text-[11.5px] ${s.excluded ? "text-signal-rose" : "text-slate-300"}`}>{s.excluded ? "—" : `${s.floor}%`}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Human-reserved actions" dense>
            <ul className="divide-y divide-ink-700/40">
              {store.policy.humanReservedActions.map((a: string) => (
                <li key={a} className="px-4 py-2 text-[11.5px] text-slate-300">
                  {a}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Review triggers" dense>
            <ul className="divide-y divide-ink-700/40">
              {store.policy.reviewTriggers.map((t: string) => (
                <li key={t} className="px-4 py-2 text-[11.5px] text-slate-400">
                  {t}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Signatory register" dense>
            <Table head={["Role", "Scope", "Limit", "Status"]}>
              {store.legalEntity.signatoryRegister.map((s: any) => (
                <tr key={s.id}>
                  <td className="td text-[11.5px]">{s.role}</td>
                  <td className="td text-[11px] text-slate-400">{s.scope}</td>
                  <td className="td num text-[11px]">{s.limit ? money(s.limit) : "unlimited within scope"}</td>
                  <td className="td text-[10.5px] text-signal-amber">{s.status.replace(/_/g, " ")}</td>
                </tr>
              ))}
            </Table>
            <p className="px-4 pb-3 text-[10.5px] leading-relaxed text-slate-500">
              AI signature authority: none. An agent may draft, populate and assemble, but not sign, apply a seal, or attest personal knowledge.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

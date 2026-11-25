import { currentActor } from "@/lib/session.mjs";
import { buildFinanceView, money } from "@/lib/view.mjs";
import { preparePayment, releasePayment } from "@/app/actions";
import { Badge, Callout, PageHeader, Panel, Stat, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ error?: string; prepared?: string; approval?: string }> }) {
  const { error, prepared, approval } = await searchParams;
  const { store, actor } = await currentActor();
  const f = buildFinanceView(store, new Date(), actor);
  const duplicateInvoices = f.invoices.filter((i: any) => i.duplicates.duplicate);

  return (
    <>
      <PageHeader
        eyebrow="Finance & payments"
        title="Read, prepare — never release"
        description="Payment preparation, approval and execution are separate controls. Three-way matching runs before any payment is recommended, and a beneficiary change requires an independent callback plus dual approval."
      />

      {error && (
        <div className="mb-4">
          <Callout tone="rose" title="Payment action refused">
            {error}
          </Callout>
        </div>
      )}
      {prepared && (
        <div className="mb-4">
          <Callout tone="emerald" title={`Payment ${prepared} prepared`}>
            Release is blocked until approval {approval ?? ""} is granted by the required authority. Preparation and execution remain separate steps.
          </Callout>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Cleared cash" value={money(f.position.cash)} hint="Confirmed balance only" />
        <Stat label="Committed facility" value={money(f.position.facility)} hint="Contracted, not drawn" />
        <Stat label="Committed purchases" value={money(f.position.committed)} tone="amber" hint="Accepted purchase orders" />
        <Stat label="Released to date" value={money(f.position.released)} tone="emerald" hint="Only with bank confirmation" />
      </div>

      <div className="mb-4">
        <Callout tone="neutral" title={`Acting as ${actor.name}`}>
          Automated supplier-prepayment authority is {money(store.policy.automatedLimits.supplierPrepayment)}, as is authority to issue an unconditional purchase
          commitment, guarantee a payment or accept a credit facility. An interface role cannot raise these limits; only a recorded policy change can.
        </Callout>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel title="Payment instructions" subtitle="Each row is matched against the order and delivery evidence before it can move." dense>
          <Table head={["Payment", "Contract", "Amount", "Beneficiary", "3-way match", "Duplicate", "State", "Release"]}>
            {f.rows.map((r: any) => (
              <tr key={r.payment.id}>
                <td className="td">
                  <p className="mono text-[11px]">{r.payment.reference}</p>
                  <p className="text-[10px] text-slate-500">{r.payment.invoiceId ?? "no invoice"}</p>
                </td>
                <td className="td text-[11px]">{r.payment.contractId}</td>
                <td className="td num">{money(r.payment.amount)}</td>
                <td className="td text-[11.5px]">
                  {r.payment.beneficiaryName}
                  <p className={`text-[10px] ${r.beneficiaryOk ? "text-slate-500" : "text-signal-rose"}`}>{r.beneficiaryOk ? "matches order beneficiary" : "beneficiary mismatch"}</p>
                </td>
                <td className="td">
                  <Badge tone={r.match?.state === "matched" ? "emerald" : r.match?.state === "blocked" ? "rose" : "amber"}>
                    {(r.match?.state ?? "none").replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="td">
                  <Badge tone={r.duplicates.duplicate ? "rose" : "emerald"}>{r.duplicates.duplicate ? "duplicate" : "unique"}</Badge>
                </td>
                <td className="td">
                  <Badge tone={["released", "confirmed"].includes(r.payment.state) ? "emerald" : r.payment.state === "held" || r.payment.state === "rejected" ? "rose" : "amber"}>
                    {r.payment.state}
                  </Badge>
                </td>
                <td className="td">
                  {["released", "confirmed"].includes(r.payment.state) ? (
                    <span className="text-[10.5px] text-slate-500">executed</span>
                  ) : r.release.allowed ? (
                    <form action={releasePayment}>
                      <input type="hidden" name="paymentId" value={r.payment.id} />
                      <input type="hidden" name="returnTo" value="/finance" />
                      <button type="submit" className="btn btn-primary text-[10.5px]">
                        Release
                      </button>
                    </form>
                  ) : (
                    <span className="block max-w-[190px] text-[10px] leading-snug text-slate-500">
                      {r.approval ? `approval ${r.approval.status.replace(/_/g, " ")}` : "no approval"} · {r.release.blockers[0]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          <div className="border-t border-ink-700/60 px-4 py-3">
            {f.rows
              .filter((r: any) => r.payment.holdReason)
              .map((r: any) => (
                <p key={r.payment.id} className="mb-1 text-[11px] leading-relaxed text-slate-400 last:mb-0">
                  <span className="mono text-signal-rose">{r.payment.reference}</span> — {r.payment.holdReason}
                </p>
              ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Duplicate detection" subtitle="Same beneficiary, amount and period is a hold." dense>
            <ul className="divide-y divide-ink-700/40">
              {duplicateInvoices.map(({ invoice, duplicates }: any) => (
                <li key={invoice.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="mono text-[11px] text-slate-200">{invoice.invoiceNumber}</p>
                    <Badge tone="rose">duplicate</Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {money(invoice.amount)} · {invoice.beneficiaryName} · {invoice.invoiceDate}
                  </p>
                  <p className="mt-1 text-[10.5px] text-slate-500">Exact fingerprint match against another invoice in the same contract.</p>
                </li>
              ))}
              {duplicateInvoices.length === 0 && <li className="px-4 py-4 text-[12px] text-slate-500">No duplicates detected.</li>}
            </ul>
          </Panel>

          <Panel title="Payment controls in force" dense>
            <ul className="divide-y divide-ink-700/40 text-[11.5px]">
              {[
                ["Verification", "Beneficiary name must match the verified contracting entity"],
                ["Change control", "No bank change from email; callback + 48h cooling-off + dual approval"],
                ["Matching", "PO ↔ invoice ↔ delivery/acceptance within approved tolerances"],
                ["Separation", "Preparation, approval and execution are distinct roles"],
                ["Dual approval", `Above ${money(store.settings.dualApprovalThreshold)}`],
                ["Audit", "Every instruction carries an idempotency key and a ledger record"],
                ["Credentials", "No bank password, OTP or key is ever held by an agent"],
              ].map(([k, val]) => (
                <li key={k} className="flex items-start justify-between gap-4 px-4 py-2.5">
                  <span className="text-slate-400">{k}</span>
                  <span className="max-w-[220px] text-right text-slate-300">{val}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Panel title="Buyer invoicing & receivables" subtitle="Invoiced revenue is not cash received." dense>
          <Table head={["Invoice", "Contract", "Amount", "Beneficiary", "Due", "Status", "Prepare"]}>
            {f.invoices.map(({ invoice, duplicates, preparation, existingPayment }: any) => (
              <tr key={invoice.id}>
                <td className="td mono text-[11px]">{invoice.invoiceNumber}</td>
                <td className="td text-[11px]">{invoice.contractId}</td>
                <td className="td num">{money(invoice.amount)}</td>
                <td className="td text-[11.5px]">{invoice.beneficiaryName}</td>
                <td className="td mono text-[10.5px]">{invoice.dueDate}</td>
                <td className="td">
                  <Badge tone={duplicates.duplicate ? "rose" : invoice.status === "matched" ? "emerald" : "amber"}>{duplicates.duplicate ? "duplicate" : invoice.status}</Badge>
                </td>
                <td className="td">
                  {existingPayment ? (
                    <span className="text-[10.5px] text-slate-500">{existingPayment.reference}</span>
                  ) : preparation.allowed ? (
                    <form action={preparePayment}>
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <input type="hidden" name="returnTo" value="/finance" />
                      <button type="submit" className="btn text-[10.5px]">
                        Prepare
                      </button>
                    </form>
                  ) : (
                    <span className="block max-w-[190px] text-[10px] leading-snug text-slate-500">{preparation.blockers[0]}</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </>
  );
}

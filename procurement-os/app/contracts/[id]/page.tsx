import { notFound } from "next/navigation";
import { currentActor } from "@/lib/session.mjs";
import { buildContractView, money } from "@/lib/view.mjs";
import { issuePurchaseOrder } from "@/app/actions";
import { Badge, Callout, KeyValue, PageHeader, Panel, StatusMark, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ContractPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { store, actor } = await currentActor();
  const contract = store.contracts.find((c: any) => c.id === id);
  if (!contract) notFound();
  const v = buildContractView(store, contract, actor);

  return (
    <>
      <PageHeader
        eyebrow={`${contract.reference} · ${contract.sectorCode}`}
        title={contract.title}
        description={`${contract.buyer} · supplier ${v.supplier?.legalName ?? "—"} · ${contract.currency} ${contract.value.toLocaleString()}`}
        actions={<Badge tone={contract.status === "closed" ? "emerald" : contract.status === "fulfilment" ? "sky" : "amber"}>{contract.status.replace(/_/g, " ")}</Badge>}
      />

      <div className="mb-4 grid gap-3">
        {error && (
          <Callout tone="rose" title="Write action refused">
            {error}
          </Callout>
        )}
        {v.matrix.verdict !== "back_to_back" && (
          <Callout tone={v.matrix.verdict === "reject_or_legal_review" ? "rose" : "amber"} title={`Obligation coverage: ${v.matrix.verdict.replace(/_/g, " ")}`}>
            {v.matrix.blockingReason} {v.matrix.uncoveredCount} buyer obligation(s) are not fully covered by a supplier undertaking.
          </Callout>
        )}
        {v.nigeria && !v.nigeria.released && (
          <Callout tone="rose" title="Nigeria import gate — shipment held">
            {v.nigeria.blockers.slice(0, 4).join(" ")} {v.nigeria.note}
          </Callout>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Clause-by-clause obligation matrix" subtitle="What Waide promises versus what the supplier has undertaken." dense>
          <Table head={["Buyer clause", "Obligation", "Supplier clause", "Status", "Exposure", "Reserve"]}>
            {v.matrix.rows.map((r: any) => (
              <tr key={r.id}>
                <td className="td mono text-[10.5px]">{r.clause}</td>
                <td className="td max-w-[260px]">
                  <p className="text-[11.5px] text-slate-200">{r.buyerText}</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-500">{r.note}</p>
                </td>
                <td className="td mono text-[10.5px]">{r.supplierClause ?? "—"}</td>
                <td className="td">
                  <Badge tone={r.status === "covered" ? "emerald" : r.status === "unlimited_buyer_exposure" ? "rose" : "amber"}>
                    {r.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className={`td num ${r.exposure === "unlimited" ? "text-signal-rose" : ""}`}>
                  {r.exposure === "unlimited" ? "unlimited" : money(r.exposure)}
                </td>
                <td className="td num text-[11px]">{r.pricedReserve ? money(r.pricedReserve) : "unpriced"}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Execution record">
            <KeyValue
              columns={1}
              items={[
                ["Incoterm", `${contract.incoterm.rule} ${contract.incoterm.namedPlace} (${contract.incoterm.version})`],
                ["Importer of record", contract.incoterm.importerOfRecord ?? "—"],
                ["Exporter of record", contract.incoterm.exporterOfRecord ?? "—"],
                ["Purchase order", v.po ? `${v.po.poNumber} · ${v.po.status}` : "not issued"],
                ["Shipment", v.shipment ? `${v.shipment.id} · ${v.shipment.status}` : "none"],
                ["Invoice", v.invoice ? `${v.invoice.invoiceNumber} · ${v.invoice.status}` : "none"],
                ["Payment", v.payment ? `${v.payment.reference} · ${v.payment.state}` : "none"],
              ]}
            />
          </Panel>

          <Panel title="Three-way match" dense>
            {v.match ? (
              <div className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-slate-300">Purchase order · invoice · delivery</p>
                  <Badge tone={v.match.state === "matched" ? "emerald" : v.match.state === "blocked" ? "rose" : "amber"}>{v.match.state.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">{v.match.reason}</p>
                {v.match.exceptions.map((e: any) => (
                  <p key={e.code} className="text-[11px] leading-relaxed text-slate-400">
                    <span className={e.severity === "critical" ? "text-signal-rose" : "text-signal-amber"}>{e.code}</span> — {e.message}
                  </p>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-[11.5px] text-slate-500">No purchase order exists for this contract, so nothing can be matched.</p>
            )}
          </Panel>

          <Panel title="Closeout gate" dense>
            <div className="space-y-1.5 px-4 py-3">
              {v.closeout.outstanding.length === 0 ? (
                <p className="text-[12px] text-signal-emerald">{v.closeout.reason}</p>
              ) : (
                v.closeout.outstanding.map((o: string) => (
                  <p key={o} className="text-[11.5px] text-slate-400">
                    • {o}
                  </p>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Panel
          title="Purchase order"
          subtitle="A PO is a binding supplier obligation. It is issued only when the supplier is S2/S3, funding is real, buyer obligations are back-to-back and the acting role is delegated."
        >
          {v.po && v.po.status !== "held" ? (
            <div className="p-4">
              <KeyValue
                items={[
                  ["PO number", v.po.poNumber],
                  ["Status", <Badge tone={v.po.status === "accepted" ? "emerald" : "amber"}>{v.po.status}</Badge>],
                  ["Amount", <span className="num">{money(v.po.amount)}</span>],
                  ["Beneficiary", v.po.beneficiaryName],
                  ["Issued", v.po.issuedAt ?? "—"],
                  ["Funding check", v.po.fundingCheck ?? "—"],
                ]}
              />
            </div>
          ) : (
            <form action={issuePurchaseOrder} className="space-y-3 p-4">
              <input type="hidden" name="contractId" value={contract.id} />
              <input type="hidden" name="returnTo" value={`/contracts/${contract.id}`} />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="label block">Amount ({contract.currency})</span>
                  <input name="amount" type="number" min="1" step="1" defaultValue={contract.value} className="input mt-1" />
                </label>
                <label className="block">
                  <span className="label block">Quantity</span>
                  <input name="quantity" type="number" min="1" step="1" defaultValue={1} className="input mt-1" />
                </label>
                <label className="block">
                  <span className="label block">Unit</span>
                  <input name="unit" defaultValue="lot" className="input mt-1" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="label block">Description</span>
                  <input name="description" defaultValue={contract.title} className="input mt-1" />
                </label>
                <label className="block">
                  <span className="label block">Incoterm</span>
                  <input name="incotermRule" defaultValue={contract.incoterm?.rule ?? "DAP"} className="input mt-1" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="label block">Named place</span>
                  <input name="namedPlace" defaultValue={contract.incoterm?.namedPlace ?? ""} className="input mt-1" />
                </label>
              </div>

              <div className="rounded border border-ink-700/60 bg-ink-950/40 px-3 py-2">
                {v.poGate.blockers.length === 0 ? (
                  <p className="text-[11.5px] text-signal-emerald">{v.poGate.reason}</p>
                ) : (
                  <ul className="space-y-1">
                    {v.poGate.blockers.map((b: string) => (
                      <li key={b} className="text-[11px] leading-relaxed text-slate-400">
                        • {b}
                      </li>
                    ))}
                  </ul>
                )}
                {v.poGate.requiresApproval && (
                  <p className="mt-1.5 text-[11px] text-signal-amber">
                    Approval required: {v.poGate.requiredRoles.join(" + ")}. Submitting creates the request; issue again after it is approved.
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-primary" disabled={v.poGate.blockers.length > 0}>
                {v.poGate.requiresApproval && !v.poGate.approvalSatisfied ? "Request approval to issue PO" : "Issue purchase order"}
              </button>
            </form>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Shipment" dense>
          {v.shipment ? (
            <div className="space-y-2 p-4">
              <KeyValue
                columns={2}
                items={[
                  ["Status", <StatusMark status={v.shipment.status === "held" ? "fail" : "pass"} />],
                  ["Route", v.shipment.route.join(" → ")],
                  ["Exporter", v.shipment.exporterOfRecord],
                  ["Importer", v.shipment.importerOfRecord],
                  ["Consignee", v.shipment.consignee],
                  ["HS code", v.shipment.hsCode ? `${v.shipment.hsCode} (${v.shipment.hsCodeVerifiedBy})` : "unverified"],
                  ["Insurance", v.shipment.insuranceCertificate ?? "missing"],
                  ["Form M", v.shipment.formM ?? "not recorded"],
                ]}
              />
              {v.nigeria && (
                <div className="mt-2 rounded border border-ink-700/60 p-3">
                  <p className="label mb-1">Nigeria import rules applied</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {v.nigeria.rules.formM.note} {v.nigeria.rules.valuerBasis.note}
                  </p>
                  {v.nigeria.warnings.map((w: string) => (
                    <p key={w} className="mt-1 text-[11px] text-signal-amber">
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="p-4 text-[12px] text-slate-500">No shipment recorded.</p>
          )}
        </Panel>

        <Panel title="Outcome" dense>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <p className="label">Bid snapshot (preserved)</p>
              <p className="num mt-1 text-[13px] text-slate-200">
                {money(contract.bidSnapshot.contribution)} · {contract.bidSnapshot.contributionPct}%
              </p>
              <p className="mt-1 text-[10.5px] text-slate-500">Never rewritten after the event.</p>
            </div>
            <div>
              <p className="label">Realised</p>
              {v.realised ? (
                <>
                  <p className="num mt-1 text-[13px] text-slate-200">
                    {money(v.realised.contribution)} · {v.realised.contributionPct}%
                  </p>
                  <p className={`mt-1 text-[10.5px] ${v.realised.varianceAmount < 0 ? "text-signal-rose" : "text-signal-emerald"}`}>
                    variance {money(v.realised.varianceAmount)} ({v.realised.variancePctPoints} pts)
                  </p>
                </>
              ) : (
                <p className="mt-1 text-[12px] text-slate-500">Not yet reconciled.</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <p className="label">Commitment policy</p>
              {contract.buyerObligations.filter((o: any) => o.unlimited).length > 0 ? (
                <p className="mt-1 text-[11.5px] text-signal-rose">
                  {contract.buyerObligations.filter((o: any) => o.unlimited).length} unlimited obligation(s) present — prohibited by default and requiring legal review.
                </p>
              ) : (
                <p className="mt-1 text-[11.5px] text-slate-400">No unlimited indemnity, cap-free liability or personal guarantee identified.</p>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

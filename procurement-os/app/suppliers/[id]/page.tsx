import Link from "next/link";
import { notFound } from "next/navigation";
import { currentActor } from "@/lib/session.mjs";
import { buildSupplierView, money } from "@/lib/view.mjs";
import { recordSupplierChecks, promoteSupplier } from "@/app/actions";
import { Badge, Callout, KeyValue, Meter, PageHeader, Panel, StatusMark, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SupplierPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { store, actor } = await currentActor();
  const supplier = store.suppliers.find((s: any) => s.id === id);
  if (!supplier) notFound();
  const v = buildSupplierView(store, supplier);
  const canAdmit = ["compliance_officer", "managing_director"].includes(actor.role);

  return (
    <>
      <PageHeader
        eyebrow={`${supplier.id} · ${supplier.country}`}
        title={supplier.legalName}
        description={`Roles recorded separately: ${supplier.roles.join(", ")}. Approval state drives what may be relied on in a binding bid.`}
        actions={
          <>
            <Badge tone={["S2", "S3"].includes(supplier.state) ? "emerald" : "amber"}>{supplier.state}</Badge>
            <Badge tone={v.screening.status === "clear" ? "emerald" : "rose"}>{v.screening.status.replace(/_/g, " ")}</Badge>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <Callout tone="rose" title="Admission action refused">
            {error}
          </Callout>
        </div>
      )}

      {v.screening.status !== "clear" && (
        <div className="mb-4">
          <Callout tone={v.screening.status === "confirmed_match" ? "rose" : "amber"} title={`Screening ${v.screening.status.replace(/_/g, " ")}`}>
            {v.screening.reason}
          </Callout>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel title="Supplier admission checklist" subtitle="All fifteen checks must pass or carry a documented, authorised exception." dense>
          <Table head={["#", "Check", "Result", "Evidence / gap"]}>
            {supplier.checks.map((c: any, i: number) => (
              <tr key={c.id}>
                <td className="td mono text-[10.5px] text-slate-500">{String(i + 1).padStart(2, "0")}</td>
                <td className="td text-[12px]">{c.label}</td>
                <td className="td">
                  <StatusMark status={c.passed ? "pass" : "fail"} />
                </td>
                <td className="td max-w-[280px] text-[11px] text-slate-400">{c.passed ? c.evidence : c.note}</td>
              </tr>
            ))}
          </Table>
          <div className="border-t border-ink-700/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Meter value={v.admission.pct} tone={v.admission.pct === 100 ? "emerald" : "amber"} />
              </div>
              <span className="num text-[12px] text-slate-300">
                {v.admission.passed}/{v.admission.total}
              </span>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Lifecycle">
            <div className="space-y-1.5">
              {["S0 Discovered", "S1 Identity verified", "S2 Technically approved", "S3 Strategic approved"].map((label) => {
                const code = label.slice(0, 2);
                const order = ["S0", "S1", "S2", "S3"];
                const reached = order.indexOf(supplier.state) >= order.indexOf(code) && !["suspended", "rejected"].includes(supplier.state);
                return (
                  <div key={code} className={`flex items-center gap-2 rounded border px-2.5 py-1.5 ${reached ? "border-signal-emerald/30 bg-signal-emerald/[0.05]" : "border-ink-700/60"}`}>
                    <span className={`mono text-[10.5px] ${reached ? "text-signal-emerald" : "text-slate-600"}`}>{code}</span>
                    <span className={`text-[11.5px] ${reached ? "text-slate-200" : "text-slate-500"}`}>{label.slice(3)}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">Promotions require evidence and an authorised workflow; S3 requires dual approval.</p>
          </Panel>

          <Panel title="Admission decision" subtitle="Promotion is resolved by the deterministic admission gate, not by this button.">
            {v.admissionGate.target ? (
              <>
                <div className="space-y-2 px-4 pt-3">
                  <p className="text-[12px] text-slate-300">
                    Next level <span className="mono text-slate-100">{v.admissionGate.target}</span> ·{" "}
                    {v.admissionGate.recordedEvidence}/{v.admissionGate.requiredEvidence} requirements evidenced
                  </p>
                  {v.admissionGate.blockers.length === 0 ? (
                    <p className="text-[11.5px] text-signal-emerald">All mandatory requirements carry evidence.</p>
                  ) : (
                    <ul className="space-y-1">
                      {v.admissionGate.blockers.map((b: string) => (
                        <li key={b} className="text-[11px] leading-relaxed text-slate-400">
                          • {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {v.admissionGate.warnings.map((w: string) => (
                    <p key={w} className="text-[11px] text-signal-amber">
                      {w}
                    </p>
                  ))}
                </div>
                <form action={promoteSupplier} className="border-t border-ink-700/60 px-4 py-3">
                  <input type="hidden" name="supplierId" value={supplier.id} />
                  <input type="hidden" name="target" value={v.admissionGate.target} />
                  <input type="hidden" name="returnTo" value={`/suppliers/${supplier.id}`} />
                  <button type="submit" className="btn btn-primary" disabled={!v.admissionGate.allowed || !canAdmit}>
                    Promote to {v.admissionGate.target}
                  </button>
                  {!canAdmit && <p className="mt-2 text-[10.5px] text-slate-500">Switch to Compliance or the Managing Director to act.</p>}
                </form>
              </>
            ) : (
              <p className="px-4 py-3 text-[11.5px] text-slate-500">Highest admission level reached.</p>
            )}
          </Panel>

          <Panel title="Identity & banking">
            <KeyValue
              columns={1}
              items={[
                ["Legal entity", supplier.legalName],
                ["Beneficiary name", supplier.beneficiary?.name ?? "—"],
                ["Beneficiary match", <Badge tone={v.beneficiaryMatch ? "emerald" : "rose"}>{v.beneficiaryMatch ? "verified match" : "does not match entity"}</Badge>],
                ["Bank", `${supplier.beneficiary?.bank ?? "—"} ····${supplier.beneficiary?.accountLast4 ?? ""}`],
                ["Account verified", supplier.beneficiary?.verified ? `yes (${new Date(supplier.beneficiary.verifiedAt).toLocaleDateString()})` : "no"],
                ["Beneficiary change", "independent callback + 48h cooling-off + dual approval"],
              ]}
            />
          </Panel>

          <Panel title="Screening detail" dense>
            <div className="space-y-2 px-4 py-3 text-[11.5px]">
              <p className="text-slate-300">Highest similarity: {v.screening.matches?.[0] ? `${Math.round(v.screening.matches[0].similarity * 100)}%` : "no hit"}</p>
              <p className="text-slate-500">Workflow state: {v.screening.workflowState}</p>
              <p className="text-slate-500">Lists screened: {v.screening.listVersions.map((l: any) => l.id).join(", ")}</p>
              <p className="text-[10.5px] leading-relaxed text-slate-500">
                The Consolidated Screening List is a discovery source only. A potential match is an investigation trigger, not proof of a prohibition.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Panel
          title="Record admission evidence"
          subtitle="A check counts only when it carries a written evidence reference. Clear a field to withdraw its evidence. Only Compliance or the Managing Director may record this."
        >
          <form action={recordSupplierChecks} className="space-y-3 p-4">
            <input type="hidden" name="supplierId" value={supplier.id} />
            <input type="hidden" name="returnTo" value={`/suppliers/${supplier.id}`} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {supplier.checks.map((c: any) => (
                <label key={c.id} className="block">
                  <span className="label block">{c.label}</span>
                  <input
                    name={`evidence_${c.id}`}
                    defaultValue={c.evidence ?? ""}
                    placeholder="Issuer, document and date"
                    className="input mt-1"
                  />
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn btn-primary" disabled={!canAdmit}>
                Save admission evidence
              </button>
              <span className="text-[10.5px] text-slate-500">
                {supplier.checks.filter((c: any) => c.passed && c.evidence).length} of {supplier.checks.length} checks evidenced
              </span>
            </div>
          </form>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Performance intelligence" subtitle="Only verified delivery outcomes count." dense>
          <div className="space-y-2 px-4 py-3 text-[12px]">
            {supplier.performance?.score != null ? (
              <KeyValue
                columns={1}
                items={[
                  ["Score", `${supplier.performance.score}/100 (confidence ${supplier.performance.confidence})`],
                  ["Deliveries", String(supplier.performance.deliveries)],
                  ["On time", `${supplier.performance.onTimePct}%`],
                  ["Quality accepted", `${supplier.performance.qualityAcceptPct}%`],
                  ["Claims", String(supplier.performance.claims)],
                  ["Avg response", `${supplier.performance.responseHours}h`],
                ]}
              />
            ) : (
              <p className="text-slate-500">No verified delivery history. Score suppressed rather than inferred.</p>
            )}
          </div>
        </Panel>

        <Panel title="Products on record" dense>
          <Table head={["Model", "Description", "HS"]}>
            {supplier.products.map((p: any) => (
              <tr key={p.model}>
                <td className="td mono text-[10.5px]">{p.model}</td>
                <td className="td text-[11.5px]">{p.description}</td>
                <td className="td mono text-[10.5px]">{p.hsCode}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel title="Linked exposure" dense>
          <div className="space-y-2 px-4 py-3">
            <p className="label">Opportunities</p>
            {v.linkedOpps.length === 0 ? (
              <p className="text-[11.5px] text-slate-500">None.</p>
            ) : (
              v.linkedOpps.map((o: any) => (
                <Link key={o.id} href={`/opportunities/${o.id}`} className="link block text-[11.5px]">
                  {o.reference} — {o.title.slice(0, 52)}…
                </Link>
              ))
            )}
            <p className="label mt-3">Contracts</p>
            {v.contracts.length === 0 ? (
              <p className="text-[11.5px] text-slate-500">None.</p>
            ) : (
              v.contracts.map((c: any) => (
                <p key={c.id} className="text-[11.5px] text-slate-300">
                  {c.reference} · {money(c.value)}
                </p>
              ))
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{supplier.notes}</p>
          </div>
        </Panel>
      </div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { currentActor } from "@/lib/session.mjs";
import { buildOpportunityView, money } from "@/lib/view.mjs";
import { approveBid, submitBid } from "@/app/actions";
import { Badge, Callout, KeyValue, PageHeader, Panel, StatusMark, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OpportunityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { store, actor } = await currentActor();
  const opp = store.opportunities.find((o: any) => o.id === id);
  if (!opp) notFound();

  const v = buildOpportunityView(store, opp, new Date(), actor);

  return (
    <>
      <PageHeader
        eyebrow={`${opp.reference} · ${v.sector.label}`}
        title={opp.title}
        description={`${opp.buyer} · ${opp.buyerCountry} · source ${opp.source.name} (Level ${opp.source.level}) retrieved ${new Date(opp.source.retrievedAt).toLocaleString()}`}
        actions={
          <>
            <Link href={`/pricing/${opp.id}`} className="btn">
              Price model
            </Link>
            <Badge tone={v.gate.verdict === "bid_ready" ? "emerald" : v.gate.verdict === "hold" ? "amber" : "rose"}>
              {v.gate.verdict.replace(/_/g, " ")}
            </Badge>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <Callout tone="rose" title="Bid action refused">
            {error}
          </Callout>
        </div>
      )}

      <div className="mb-4">
        <Callout tone={v.gate.verdict === "bid_ready" ? "emerald" : v.gate.verdict === "hold" ? "amber" : "rose"} title={`Gate summary — ${v.gate.blockers.length} blocking item(s)`}>
          {v.gate.summary} {v.openApproval ? `Approval ${v.openApproval.id} is ${v.openApproval.status.replace(/_/g, " ")}.` : ""}
        </Callout>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Mandatory gate results" subtitle="Each row is a deterministic check. Unknown is never treated as pass." dense>
          <ul className="divide-y divide-ink-700/40">
            {v.gate.checks.map((c: any) => (
              <li key={c.id} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] text-slate-200">
                    {c.label} <span className="ml-1 text-[10px] text-slate-600">p.{c.page}</span>
                  </p>
                  {c.note && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{c.note}</p>}
                </div>
                <StatusMark status={c.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Commercial snapshot">
            <KeyValue
              items={[
                ["Estimated value", <span className="num">{money(opp.estimatedValue)}</span>],
                ["Currency", opp.currency],
                ["Deadline", <span className="num text-[11.5px]">{v.deadline.display}</span>],
                ["Time remaining", <span className={v.deadline.critical ? "text-signal-rose" : ""}>{v.deadline.hoursRemaining}h</span>],
                ["Submission method", opp.submissionMethod],
                ["Incoterm", `${opp.incoterm.rule} ${opp.incoterm.namedPlace} (${opp.incoterm.version})`],
                ["Incoterm check", v.incoterm.valid ? "consistent" : v.incoterm.blockingReason],
              ]}
            />
          </Panel>

          <Panel title="Eligibility & country">
            <div className="space-y-3">
              {v.countryScore && (
                <div className="flex items-center justify-between rounded border border-ink-700/60 px-3 py-2">
                  <div>
                    <p className="text-[12px] text-slate-200">{v.countryScore.name}</p>
                    <p className="text-[10.5px] text-slate-500">
                      {v.countryScore.band.label} · confidence {v.countryScore.confidence}
                      {v.countryScore.stale ? " · score stale" : ""}
                    </p>
                  </div>
                  <p className={`num text-[18px] ${v.countryScore.blocked ? "text-signal-rose" : "text-signal-emerald"}`}>{v.countryScore.score}</p>
                </div>
              )}
              <ul className="space-y-2">
                {(opp.eligibility ?? []).map((e: any) => (
                  <li key={e.criterion} className="rounded border border-ink-700/60 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] text-slate-200">{e.criterion}</p>
                      <Badge tone={e.status === "pass" ? "emerald" : e.status === "fail" ? "rose" : "amber"}>{e.status}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Required: {e.required} · Waide: {e.waidePosition}
                    </p>
                    {e.note && <p className="mt-1 text-[11px] text-slate-400">{e.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Requirement compliance matrix" subtitle="Every requirement is linked to a source page and an evidence reference." dense>
          <Table head={["Code", "Requirement", "Type", "Status", "Evidence", "Page"]}>
            {opp.requirements.map((r: any) => (
              <tr key={r.code}>
                <td className="td mono text-[11px]">{r.code}</td>
                <td className="td max-w-[380px] text-[12px]">{r.text}</td>
                <td className="td">
                  <Badge tone={r.mandatory ? "rose" : "neutral"}>{r.mandatory ? "mandatory" : r.type}</Badge>
                </td>
                <td className="td">
                  <StatusMark status={r.status === "satisfied" ? "pass" : r.status === "ambiguous" ? "unknown" : "fail"} />
                </td>
                <td className="td text-[11px] text-slate-400">{r.evidence ?? "—"}</td>
                <td className="td mono text-[11px] text-slate-500">{r.sourcePage}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Jurisdictional chain" subtitle="Not a single destination check." dense>
            <ul className="divide-y divide-ink-700/40">
              {v.jurisdictions.nodes.map((n: any) => (
                <li key={n.key} className="flex items-center justify-between px-4 py-2">
                  <span className="text-[12px] text-slate-300">{n.label}</span>
                  <span className="mono text-[12px] text-slate-400">{n.country ?? "unidentified"}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink-700/40 px-4 py-3">
              {v.jurisdictions.controls.map((c: any) => (
                <p key={c.regime} className="mb-1.5 text-[11px] leading-relaxed text-slate-400">
                  <span className="text-signal-sky">{c.regime}</span> — {c.why}
                </p>
              ))}
              {v.jurisdictions.controls.length === 0 && <p className="text-[11px] text-slate-500">No additional control regime identified.</p>}
            </div>
          </Panel>

          <Panel title="Amendments" dense>
            {(opp.amendments ?? []).length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-slate-500">No amendments received.</p>
            ) : (
              <ul className="divide-y divide-ink-700/40">
                {opp.amendments.map((a: any) => (
                  <li key={a.version} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-slate-200">{a.version}</p>
                      <Badge tone={a.incorporated ? "emerald" : "rose"}>{a.incorporated ? "incorporated" : "not incorporated"}</Badge>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">{a.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Products & BOQ" dense>
          <Table head={["Code", "Item", "Qty", "Model", "HS"]}>
            {opp.products.map((p: any) => (
              <tr key={p.code}>
                <td className="td mono text-[11px]">{p.code}</td>
                <td className="td text-[11.5px]">{p.description}</td>
                <td className="td num">{p.quantity} {p.unit}</td>
                <td className="td mono text-[10.5px]">{p.model}</td>
                <td className="td mono text-[10.5px]">{p.hsCode}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel title="Linked suppliers" dense>
          <ul className="divide-y divide-ink-700/40">
            {v.suppliers.map((s: any) => (
              <li key={s.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/suppliers/${s.id}`} className="link text-[12px]">
                    {s.legalName}
                  </Link>
                  <Badge tone={["S2", "S3"].includes(s.state) ? "emerald" : "amber"}>{s.state}</Badge>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Screening: {s.sanctionsStatus.replace(/_/g, " ")} · {s.country}
                </p>
              </li>
            ))}
            {v.suppliers.length === 0 && <li className="px-4 py-4 text-[12px] text-slate-500">No supplier linked.</li>}
          </ul>
        </Panel>

        <Panel title="Attached evidence" dense>
          <ul className="divide-y divide-ink-700/40">
            {v.evidenceChecks.map((e: any) => (
              <li key={e.docId} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] text-slate-200">{e.title}</p>
                  <Badge tone={e.attachable ? "emerald" : "rose"}>{e.verdict.replace(/_/g, " ")}</Badge>
                </div>
                {e.issues.map((i: any) => (
                  <p key={i.code} className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {i.message}
                  </p>
                ))}
              </li>
            ))}
            {v.evidenceChecks.length === 0 && <li className="px-4 py-4 text-[12px] text-slate-500">No documents attached.</li>}
          </ul>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel
          title="Bid approval & submission"
          subtitle="Approval and submission are separate human steps. A bid may not read 'submitted' without a captured portal receipt."
        >
          <div className="space-y-3 p-4">
            {opp.stage === "eligible" && (
              <>
                {v.bidApproval.blockers.length === 0 ? (
                  <p className="text-[11.5px] text-signal-emerald">{v.bidApproval.reason}</p>
                ) : (
                  <ul className="space-y-1">
                    {v.bidApproval.blockers.map((b: string) => (
                      <li key={b} className="text-[11px] leading-relaxed text-slate-400">
                        • {b}
                      </li>
                    ))}
                  </ul>
                )}
                <form action={approveBid}>
                  <input type="hidden" name="opportunityId" value={opp.id} />
                  <input type="hidden" name="returnTo" value={`/opportunities/${opp.id}`} />
                  <button type="submit" className="btn btn-primary" disabled={!v.bidApproval.allowed}>
                    Approve bid for submission
                  </button>
                </form>
              </>
            )}

            {opp.stage === "bid_approved" && (
              <>
                {v.bidSubmission.blockers.length === 0 ? (
                  <p className="text-[11.5px] text-signal-emerald">{v.bidSubmission.reason}</p>
                ) : (
                  <ul className="space-y-1">
                    {v.bidSubmission.blockers.map((b: string) => (
                      <li key={b} className="text-[11px] leading-relaxed text-slate-400">
                        • {b}
                      </li>
                    ))}
                  </ul>
                )}
                <form action={submitBid} className="space-y-3">
                  <input type="hidden" name="opportunityId" value={opp.id} />
                  <input type="hidden" name="returnTo" value={`/opportunities/${opp.id}`} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="label block">Official portal reference</span>
                      <input name="officialReference" placeholder="e.g. UNGM-2026-018841" className="input mt-1" />
                    </label>
                    <label className="block">
                      <span className="label block">Receipt URL</span>
                      <input name="portalReceiptUrl" placeholder="https://…" className="input mt-1" />
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={!v.bidSubmission.allowed}>
                    Record submission with receipt
                  </button>
                </form>
              </>
            )}

            {opp.stage === "submitted" && (
              <p className="text-[11.5px] text-slate-300">
                Submitted {opp.submittedAt ? new Date(opp.submittedAt).toLocaleString() : ""} by {opp.submittedBy ?? "—"} · reference{" "}
                <span className="mono">{opp.submission?.officialReference ?? opp.submission?.portalReceiptUrl ?? "—"}</span>
              </p>
            )}

            {!["eligible", "bid_approved", "submitted"].includes(opp.stage) && (
              <p className="text-[11.5px] text-slate-500">
                Stage is <span className="mono">{opp.stage}</span>. Resolve the gate and move the opportunity to <span className="mono">eligible</span> before a bid can be approved.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Callout tone="neutral" title="Freshness record">
          Source <span className="mono">{opp.source.name}</span> retrieved {new Date(opp.source.retrievedAt).toLocaleString()} · level {opp.source.level} ·
          deadline interpreted in {opp.deadline.timeZone} and validated against UTC ({v.deadline.utc}). A quotation or guideline is never current merely
          because it remains stored.
        </Callout>
      </div>
    </>
  );
}

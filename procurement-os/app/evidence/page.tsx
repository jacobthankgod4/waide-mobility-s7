import { currentActor } from "@/lib/session.mjs";
import { buildComplianceView } from "@/lib/view.mjs";
import { Badge, Callout, KeyValue, PageHeader, Panel, StatusMark, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const { store } = await currentActor();
  const c = buildComplianceView(store);

  return (
    <>
      <PageHeader
        eyebrow="Corporate evidence repository"
        title="Waide corporate evidence vault"
        description="Every document carries a verified source, legal entity, issue and expiry date, access class, permitted use and verification state. A signed file is not the same as a valid, in-scope, currently-verified file."
      />

      <div className="mb-4 grid gap-3">
        {c.identity.clean ? (
          <Callout tone="emerald" title="Entity consistency">
            All documents carry the registered legal name and RC number.
          </Callout>
        ) : (
          <Callout tone="rose" title="Company identity conflict — submission blocked">
            {c.identity.conflicts.map((x: any) => (
              <p key={x.docId} className="mb-1 last:mb-0">
                <strong className="text-slate-200">{x.title}</strong>: {x.message}
              </p>
            ))}
          </Callout>
        )}
        <Callout tone="amber" title="Registered-name confirmation outstanding">
          {store.legalEntity.confirmationNote}
        </Callout>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Documents" subtitle="Attachability is computed per purpose and legal entity." dense>
          <Table head={["Document", "Class / holder", "Issuer", "Expiry", "Freshness", "Access", "Attachable"]}>
            {c.documents.map(({ doc, freshness }: any) => (
              <tr key={doc.id} className="row-hover">
                <td className="td max-w-[230px]">
                  <p className="text-[12px] text-slate-200">{doc.title}</p>
                  <p className="mono text-[10px] text-slate-500">{doc.id} · {doc.hash?.slice(0, 18)}</p>
                  {doc.productModel && <Badge tone="sky" className="mt-1">model {doc.productModel}</Badge>}
                </td>
                <td className="td text-[11.5px]">
                  {doc.class.replace(/_/g, " ")}
                  <p className="text-[10.5px] text-slate-500">{doc.legalEntity}</p>
                </td>
                <td className="td max-w-[150px] text-[11px] text-slate-400">{doc.issuer}</td>
                <td className="td mono text-[10.5px]">
                  {doc.expires ?? "no expiry"}
                  {freshness.daysLeft !== null && <p className={freshness.daysLeft < 0 ? "text-signal-rose" : "text-slate-500"}>{freshness.daysLeft}d</p>}
                </td>
                <td className="td">
                  <StatusMark status={freshness.status} />
                </td>
                <td className="td">
                  <Badge tone={doc.accessClass === "restricted_financial" ? "rose" : doc.accessClass === "confidential" ? "amber" : "neutral"}>
                    {doc.accessClass.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="td">
                  <Badge tone={freshness.status === "current" && doc.verificationStatus === "verified" ? "emerald" : "rose"}>
                    {freshness.status === "current" && doc.verificationStatus === "verified" ? "yes" : "blocked"}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Legal entity record">
            <KeyValue
              columns={1}
              items={[
                ["Registered name", store.legalEntity.registeredName],
                ["Trading name", store.legalEntity.tradingName],
                ["RC number", store.legalEntity.rcNumber],
                ["Jurisdiction", store.legalEntity.jurisdiction],
                ["Incorporated", store.legalEntity.incorporationDate],
                ["Registered address", store.legalEntity.registeredAddress],
                ["Tax ID", store.legalEntity.taxId],
                ["Confirmation", <Badge tone="amber">{store.legalEntity.confirmationStatus.replace(/_/g, " ")}</Badge>],
              ]}
            />
          </Panel>

          <Panel title="Financial measures" subtitle="Cash, turnover, credit and net assets are never interchanged.">
            {(() => {
              const fs = store.documents.find((d: any) => d.financials);
              const f = fs?.financials;
              if (!f) return <p className="text-[12px] text-slate-500">No audited statements on file.</p>;
              return (
                <KeyValue
                  columns={1}
                  items={[
                    ["Period", f.period],
                    ["Turnover", <span className="num">${f.turnover.toLocaleString()}</span>],
                    ["Net assets", <span className="num">${f.netAssets.toLocaleString()}</span>],
                    ["Cash balance", <span className="num">${f.cash.toLocaleString()}</span>],
                    ["Available credit", <span className="num">${f.availableCredit.toLocaleString()}</span>],
                    ["Source", `${fs.id} · ${fs.issuer}`],
                  ]}
                />
              );
            })()}
          </Panel>

          <Panel title="Partner evidence attribution" dense>
            <ul className="divide-y divide-ink-700/40">
              {c.partnerDocs.map(({ doc, attribution }: any) => (
                <li key={doc.id} className="px-4 py-3">
                  <p className="text-[12px] text-slate-200">{doc.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{attribution.label}</p>
                  <Badge tone={attribution.attributableToWaide ? "emerald" : "amber"} className="mt-1">
                    {attribution.allowedInBidAs.replace(/_/g, " ")}
                  </Badge>
                </li>
              ))}
              {c.partnerDocs.length === 0 && <li className="px-4 py-4 text-[12px] text-slate-500">No partner-attributed evidence.</li>}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

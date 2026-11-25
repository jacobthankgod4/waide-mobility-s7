import Link from "next/link";
import { currentActor } from "@/lib/session.mjs";
import { buildContractView, money } from "@/lib/view.mjs";
import { Badge, PageHeader, Panel, Stat, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const { store } = await currentActor();
  const views = store.contracts.map((c: any) => buildContractView(store, c));

  return (
    <>
      <PageHeader
        eyebrow="Contract execution"
        title="Award to closeout"
        description="An award does not trigger a purchase order. Fulfilment activates only after signatures, conditions precedent, funding and back-to-back obligation coverage are confirmed."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Contracts" value={views.length} hint="Active and closed" />
        <Stat label="Contract value" value={money(views.reduce((s: number, v: any) => s + v.contract.value, 0))} />
        <Stat label="Uncovered obligations" value={views.reduce((s: number, v: any) => s + v.matrix.uncoveredCount, 0)} tone="rose" hint="Buyer duty with no supplier back-to-back" />
        <Stat label="Shipments held" value={store.shipments.filter((s: any) => s.status === "held").length} tone="amber" hint="Import or compliance gate" />
      </div>

      <Panel title="Contracts" dense>
        <Table head={["Reference", "Contract", "Buyer", "Supplier", "Value", "Stage", "Obligations", "Import gate", "Closeout"]}>
          {views.map((v: any) => (
            <tr key={v.contract.id} className="row-hover">
              <td className="td mono text-[11px] text-slate-400">{v.contract.reference}</td>
              <td className="td max-w-[260px]">
                <Link href={`/contracts/${v.contract.id}`} className="link text-[12.5px]">
                  {v.contract.title}
                </Link>
              </td>
              <td className="td text-[11.5px]">{v.contract.buyer}</td>
              <td className="td text-[11.5px]">{v.supplier?.legalName ?? "—"}</td>
              <td className="td num">{money(v.contract.value)}</td>
              <td className="td">
                <Badge tone={v.contract.status === "closed" ? "emerald" : v.contract.status === "fulfilment" ? "sky" : "amber"}>
                  {v.contract.status.replace(/_/g, " ")}
                </Badge>
              </td>
              <td className="td">
                <span className={v.matrix.uncoveredCount ? "text-signal-rose" : "text-signal-emerald"}>
                  {v.matrix.coveredCount}/{v.matrix.rows.length} covered
                </span>
                {v.matrix.unlimitedCount > 0 && <p className="text-[10.5px] text-signal-rose">{v.matrix.unlimitedCount} unlimited</p>}
              </td>
              <td className="td">
                {v.nigeria ? (
                  <Badge tone={v.nigeria.released ? "emerald" : "rose"}>{v.nigeria.released ? "released" : "held"}</Badge>
                ) : (
                  <span className="text-[11px] text-slate-500">n/a</span>
                )}
              </td>
              <td className="td">
                <Badge tone={v.closeout.closable ? "emerald" : "amber"}>{v.closeout.closable ? "closable" : `${v.closeout.outstanding.length} open`}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}

import Link from "next/link";
import { currentActor } from "@/lib/session.mjs";
import { buildSupplierView } from "@/lib/view.mjs";
import { Badge, Meter, PageHeader, Panel, Stat, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const { store } = await currentActor();
  const views = store.suppliers.map((s: any) => buildSupplierView(store, s));

  return (
    <>
      <PageHeader
        eyebrow="Supplier intelligence"
        title="Supplier register and admission state"
        description="A supplier cannot skip stages because its website looks professional or an email claims OEM status. Each role — manufacturer, exporter, agent, forwarder, beneficiary — is verified separately."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="S0 discovered" value={views.filter((v: any) => v.supplier.state === "S0").length} hint="Discovery only — no reliance permitted" />
        <Stat label="S1 identity verified" value={views.filter((v: any) => v.supplier.state === "S1").length} tone="amber" hint="Cannot support a product-specific bid" />
        <Stat label="S2 technically approved" value={views.filter((v: any) => v.supplier.state === "S2").length} tone="sky" hint="Product fit validated" />
        <Stat label="S3 strategic" value={views.filter((v: any) => v.supplier.state === "S3").length} tone="emerald" hint="Signed terms and delivery record" />
      </div>

      <Panel title="All suppliers" subtitle="Admission progress counts passed checks out of the mandatory fifteen." dense>
        <Table head={["Supplier", "Country", "Roles", "State", "Admission", "Screening", "Performance", "Beneficiary"]}>
          {views.map((v: any) => (
            <tr key={v.supplier.id} className="row-hover">
              <td className="td">
                <Link href={`/suppliers/${v.supplier.id}`} className="link text-[12.5px]">
                  {v.supplier.legalName}
                </Link>
                <p className="text-[10.5px] text-slate-500">{v.supplier.sectorCodes.join(" · ")}</p>
              </td>
              <td className="td text-[12px]">{v.supplier.country}</td>
              <td className="td text-[11px] text-slate-400">{v.supplier.roles.join(", ")}</td>
              <td className="td">
                <Badge tone={v.supplier.state === "S3" ? "emerald" : v.supplier.state === "S2" ? "sky" : v.supplier.state === "S1" ? "amber" : "neutral"}>
                  {v.supplier.state}
                </Badge>
              </td>
              <td className="td w-[120px]">
                <Meter value={v.admission.pct} tone={v.admission.pct === 100 ? "emerald" : v.admission.pct >= 60 ? "amber" : "rose"} />
                <p className="mt-1 text-[10.5px] text-slate-500">
                  {v.admission.passed}/{v.admission.total} checks
                </p>
              </td>
              <td className="td">
                <Badge tone={v.screening.status === "clear" ? "emerald" : v.screening.status === "potential_match" ? "amber" : "rose"}>
                  {v.screening.status.replace(/_/g, " ")}
                </Badge>
              </td>
              <td className="td text-[11.5px]">
                {v.supplier.performance && v.supplier.performance.score !== null ? (
                  <>
                    <span className="num">{v.supplier.performance.score}/100</span>
                    <p className="text-[10.5px] text-slate-500">
                      {v.supplier.performance.deliveries} deliveries · confidence {v.supplier.performance.confidence}
                    </p>
                  </>
                ) : (
                  <span className="text-slate-500">no verified delivery data</span>
                )}
              </td>
              <td className="td">
                {v.supplier.beneficiary ? (
                  <Badge tone={v.beneficiaryMatch ? "emerald" : "rose"}>{v.beneficiaryMatch ? "matches entity" : "name mismatch"}</Badge>
                ) : (
                  <Badge tone="neutral">not on file</Badge>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS: { title: string; items: { href: string; label: string; hint?: string }[] }[] = [
  {
    title: "Operations",
    items: [
      { href: "/", label: "Command dashboard" },
      { href: "/opportunities", label: "Opportunity pipeline" },
      { href: "/suppliers", label: "Supplier intelligence" },
      { href: "/evidence", label: "Corporate evidence" },
      { href: "/approvals", label: "Approval centre" },
      { href: "/communications", label: "Correspondence" },
      { href: "/mail", label: "Mailbox & extraction" },
    ],
  },
  {
    title: "Execution",
    items: [
      { href: "/contracts", label: "Contract execution" },
      { href: "/finance", label: "Finance & payments" },
      { href: "/compliance", label: "Compliance & screening" },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/policies", label: "WAOC policy register" },
      { href: "/audit", label: "Audit ledger" },
      { href: "/spec-audit", label: "Specification audit" },
      { href: "/roadmap", label: "50-phase roadmap" },
    ],
  },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-2 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">{section.title}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-2 py-[7px] text-[12.5px] transition ${
                      active ? "bg-ink-800 text-slate-100 shadow-[inset_2px_0_0_0_#f2a93b]" : "text-slate-400 hover:bg-ink-850 hover:text-slate-200"
                    }`}
                  >
                    <span className={`h-1 w-1 rounded-full ${active ? "bg-signal-amber" : "bg-slate-700"}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

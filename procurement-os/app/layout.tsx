import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ActorSwitcher } from "@/components/ActorSwitcher";
import { currentActor } from "@/lib/session.mjs";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Waide Procurement OS",
  description: "Autonomous procurement and contract execution console governed by the Waide Autonomous Operations Constitution.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { store, actor } = await currentActor();

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-ink-950">
          <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/50 lg:flex">
            <div className="border-b border-ink-700/60 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-signal-amber/15 text-[12px] font-bold text-signal-amber">W</span>
                <div>
                  <p className="text-[12.5px] font-semibold leading-none text-slate-100">Waide Procurement OS</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-slate-500">WPOS · {store.policy.version}</p>
                </div>
              </div>
            </div>
            <Nav />
            <div className="border-t border-ink-700/60 px-3 py-3">
              <p className="text-[10px] leading-relaxed text-slate-500">
                Synthetic demonstration dataset. No approval, certificate or supplier here is real.
              </p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 border-b border-ink-700/60 bg-ink-950/85 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
                <div className="flex items-center gap-2">
                  <Badge tone="amber">Internal operating system</Badge>
                  <span className="hidden text-[11px] text-slate-500 sm:inline">
                    Policy {store.policy.version} · {store.policy.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-[11px] text-slate-500 md:inline">{actor.title}</span>
                  <ActorSwitcher users={store.users.map((u: any) => ({ id: u.id, name: u.name, role: u.role }))} currentId={actor.id} />
                </div>
              </div>
              <nav className="flex gap-1 overflow-x-auto border-t border-ink-700/40 px-2 py-1.5 lg:hidden">
                {[
                  ["/", "Dashboard"],
                  ["/opportunities", "Pipeline"],
                  ["/suppliers", "Suppliers"],
                  ["/evidence", "Evidence"],
                  ["/approvals", "Approvals"],
                  ["/contracts", "Contracts"],
                  ["/finance", "Finance"],
                  ["/compliance", "Compliance"],
                  ["/mail", "Mailbox"],
                  ["/policies", "Policy"],
                  ["/audit", "Audit"],
                  ["/spec-audit", "Spec audit"],
                  ["/roadmap", "Roadmap"],
                ].map(([href, label]) => (
                  <a key={href} href={href} className="whitespace-nowrap rounded px-2 py-1 text-[11.5px] text-slate-400 hover:bg-ink-850 hover:text-slate-100">
                    {label}
                  </a>
                ))}
              </nav>
            </header>
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 lg:px-8">{children}</main>
            <footer className="border-t border-ink-700/60 px-4 py-4 text-[10.5px] leading-relaxed text-slate-600 lg:px-8">
              WPOS holds rather than guesses: unknown mandatory facts, unverified evidence and unscreened parties block action. AI has no signature, payment-release or guarantee authority.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}

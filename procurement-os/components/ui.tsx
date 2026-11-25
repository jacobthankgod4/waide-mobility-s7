import Link from "next/link";
import type { ReactNode } from "react";

const TONES: Record<string, string> = {
  neutral: "border-ink-600 bg-ink-800 text-slate-300",
  amber: "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
  emerald: "border-signal-emerald/30 bg-signal-emerald/10 text-signal-emerald",
  rose: "border-signal-rose/30 bg-signal-rose/10 text-signal-rose",
  sky: "border-signal-sky/30 bg-signal-sky/10 text-signal-sky",
  violet: "border-signal-violet/30 bg-signal-violet/10 text-signal-violet",
};

export function Badge({ tone = "neutral", children, className = "" }: { tone?: keyof typeof TONES | string; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] ${TONES[tone] ?? TONES.neutral} ${className}`}>
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral" }: { tone?: string }) {
  const color = tone === "emerald" ? "bg-signal-emerald" : tone === "amber" ? "bg-signal-amber" : tone === "rose" ? "bg-signal-rose" : tone === "sky" ? "bg-signal-sky" : "bg-slate-500";
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />;
}

export function Panel({ title, subtitle, action, children, className = "", dense = false }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; dense?: boolean }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="panel-head">
          <div>
            {title && <h2 className="panel-title">{title}</h2>}
            {subtitle && <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-slate-500">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={dense ? "" : "p-4"}>{children}</div>
    </section>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-ink-700/60 pb-5">
      <div className="max-w-3xl">
        {eyebrow && <p className="label mb-2">{eyebrow}</p>}
        <h1 className="text-[22px] font-semibold leading-tight">{title}</h1>
        {description && <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Stat({ label, value, hint, tone = "neutral" }: { label: string; value: ReactNode; hint?: string; tone?: string }) {
  const accent = tone === "rose" ? "text-signal-rose" : tone === "amber" ? "text-signal-amber" : tone === "emerald" ? "text-signal-emerald" : tone === "sky" ? "text-signal-sky" : "text-slate-100";
  return (
    <div className="panel px-4 py-3">
      <p className="label">{label}</p>
      <p className={`num mt-1.5 text-[22px] font-semibold leading-none ${accent}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-slate-500">{hint}</p>}
    </div>
  );
}

export function Callout({ tone = "amber", title, children }: { tone?: string; title?: string; children: ReactNode }) {
  const map: Record<string, string> = {
    amber: "border-signal-amber/30 bg-signal-amber/[0.06]",
    rose: "border-signal-rose/30 bg-signal-rose/[0.06]",
    emerald: "border-signal-emerald/30 bg-signal-emerald/[0.06]",
    sky: "border-signal-sky/30 bg-signal-sky/[0.06]",
    neutral: "border-ink-600 bg-ink-850/60",
  };
  const text: Record<string, string> = {
    amber: "text-signal-amber",
    rose: "text-signal-rose",
    emerald: "text-signal-emerald",
    sky: "text-signal-sky",
    neutral: "text-slate-300",
  };
  return (
    <div className={`rounded-md border px-3.5 py-3 ${map[tone] ?? map.neutral}`}>
      {title && <p className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${text[tone] ?? text.neutral}`}>{title}</p>}
      <div className="text-[12.5px] leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

export function Meter({ value, max = 100, tone = "sky", label }: { value: number; max?: number; tone?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === "emerald" ? "bg-signal-emerald" : tone === "amber" ? "bg-signal-amber" : tone === "rose" ? "bg-signal-rose" : "bg-signal-sky";
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {label && <p className="mt-1 text-[10.5px] text-slate-500">{label}</p>}
    </div>
  );
}

export function KeyValue({ items, columns = 2 }: { items: [string, ReactNode][]; columns?: number }) {
  return (
    <dl className={`grid gap-x-6 gap-y-3 ${columns === 3 ? "sm:grid-cols-3" : columns === 1 ? "" : "sm:grid-cols-2"}`}>
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="label">{k}</dt>
          <dd className="mt-0.5 text-[12.5px] leading-snug text-slate-300">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatusMark({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pass: ["emerald", "Pass"],
    warning: ["amber", "Review"],
    fail: ["rose", "Fail"],
    unknown: ["amber", "Unknown"],
    eligible: ["emerald", "Eligible"],
    pricing_review: ["amber", "Review"],
    below_floor: ["rose", "Below floor"],
    reject_negative: ["rose", "Reject"],
    no_final_price: ["rose", "No price"],
    blocked: ["rose", "Blocked"],
    current: ["emerald", "Current"],
    expiring: ["amber", "Expiring"],
    expired: ["rose", "Expired"],
    stale: ["amber", "Stale"],
    unverified: ["rose", "Unverified"],
  };
  const [tone, text] = map[status] ?? ["neutral", status];
  return <Badge tone={tone}>{text}</Badge>;
}

export function Table({ head, children }: { head: (string | ReactNode)[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead className="bg-ink-950/40">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="th">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-3 py-8 text-center text-[12px] text-slate-500">{children}</p>;
}

export function SourceLink({ url, name }: { url?: string; name?: string }) {
  if (!url) return <span className="text-slate-500">{name ?? "—"}</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer noopener" className="link inline-flex items-center gap-1 text-[11.5px]">
      {name ?? url.replace(/^https?:\/\//, "").slice(0, 46)}
      <span aria-hidden className="text-slate-500">↗</span>
    </a>
  );
}

export function CRUMLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link text-[11.5px]">
      {children}
    </Link>
  );
}

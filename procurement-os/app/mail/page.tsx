import Link from "next/link";
import { status } from "@/lib/integrations/agentmail/client.mjs";
import { mailSummary } from "@/lib/integrations/agentmail/sync.mjs";
import { uploadDocument, syncMail } from "@/app/mail-actions";
import { Badge, Callout, PageHeader, Panel, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

function tone(value: boolean) {
  return value ? "emerald" : "rose";
}

function fieldLabel(field: string) {
  return field.replace(/_/g, " ");
}

export default async function MailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sync?: string; new?: string; docs?: string; message?: string; document?: string; status?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const connection = await status();
  const mail = mailSummary();

  const quarantined = mail.messages.filter((entry: any) => entry.status === "quarantined");
  const readable = mail.documents.filter((entry: any) => entry.readable);
  const incomplete = readable.filter((entry: any) => entry.completeness && !entry.completeness.complete);

  return (
    <>
      <PageHeader
        eyebrow="Correspondence · AgentMail"
        title="Supplier mail, read as evidence"
        description="The desk inbox is an input to procurement, not a chat window. Inbound content is screened before anything acts on it; attachments are extracted into requirements with page citations; outbound mail passes the authority and content gates before it leaves."
      />

      {params.error && (
        <div className="mb-4">
          <Callout tone="rose" title="Nothing was stored">
            {params.error}
          </Callout>
        </div>
      )}

      {params.sync === "ok" && (
        <div className="mb-4">
          <Callout tone="emerald" title="Mailbox synchronised">
            {params.new ?? "0"} new message(s); {params.docs ?? "0"} document(s) on file. Quarantined messages are held, not acted on.
          </Callout>
        </div>
      )}

      {params.sync === "failed" && (
        <div className="mb-4">
          <Callout tone="amber" title="Synchronisation did not run">
            {params.message ?? "Unknown reason."}
          </Callout>
        </div>
      )}

      {params.document && (
        <div className="mb-4">
          <Callout tone={params.status === "read" ? "emerald" : "amber"} title={params.status === "read" ? "Document extracted" : "Document stored but not readable"}>
            {params.document}
            {params.reason ? ` — ${params.reason}` : ""}
          </Callout>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Connection" value={connection.connected ? "Live" : connection.configured ? "Key rejected" : "No key"} tone={connection.connected ? "emerald" : "rose"} hint={connection.inbox ?? "No inbox resolved"} />
        <Stat label="Messages" value={mail.counts.messages} hint={`${mail.counts.quarantined} quarantined`} tone={mail.counts.quarantined > 0 ? "amber" : "neutral"} />
        <Stat label="Documents" value={mail.counts.documents} hint={`${mail.counts.readableDocuments} readable`} />
        <Stat label="SDK surface" value={connection.capability.total} hint={`${connection.capability.automated} automated · ${connection.capability.human} human · ${connection.capability.owner_only} owner-only`} tone="sky" />
      </div>

      {!connection.configured && (
        <div className="mb-4">
          <Callout tone="amber" title="AgentMail is not connected">
            Create the account, then put <span className="mono">AGENTMAIL_API_KEY</span> in <span className="mono">.env.local</span> (and{" "}
            <span className="mono">AGENTMAIL_WEBHOOK_SECRET</span> once the webhook exists). Nothing else needs changing: the desk inbox is created on first send,
            or set <span className="mono">AGENTMAIL_INBOX</span> to use an existing address. Until then everything below is empty by design rather than filled with
            invented mail.
          </Callout>
        </div>
      )}

      {connection.configured && !connection.connected && (
        <div className="mb-4">
          <Callout tone="rose" title="The key was rejected">
            {connection.reason}
          </Callout>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <Panel
            title="Desk inbox"
            subtitle={mail.inbox ?? connection.inbox ?? "Not resolved yet"}
            action={
              <form action={syncMail}>
                <input type="hidden" name="limit" value="25" />
                <button type="submit" className="btn btn-primary" disabled={!connection.connected}>
                  Synchronise
                </button>
              </form>
            }
          >
            <div className="px-4 py-3">
              {mail.messages.length === 0 ? (
                <p className="text-[12.5px] text-slate-400">
                  No messages synchronised. {connection.connected ? "Press Synchronise to read the inbox." : "Connect AgentMail first."}
                </p>
              ) : (
                <ul className="divide-y divide-ink-700/40">
                  {mail.messages.map((message: any) => (
                    <li key={message.messageId} className="py-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] text-slate-200">{message.subject || "(no subject)"}</p>
                          <p className="truncate text-[11px] text-slate-500">
                            {message.from ?? "unknown sender"} · {new Date(message.receivedAt).toLocaleString()}
                            {message.supplier ? ` · ${message.supplier.name}` : " · unlinked sender"}
                          </p>
                        </div>
                        <Badge tone={message.status === "quarantined" ? "rose" : "neutral"}>
                          {message.status === "quarantined" ? "quarantined" : `${message.attachmentCount} file(s)`}
                        </Badge>
                      </div>
                      {message.screening?.quarantined && (
                        <p className="mt-1 text-[11px] text-signal-rose">
                          {message.screening.findings.map((finding: any) => finding.label).join(" · ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel title="Extracted documents" subtitle="Every value cites the page it came from." dense>
            {mail.documents.length === 0 ? (
              <p className="px-4 py-3 text-[12.5px] text-slate-400">No documents extracted yet. Upload one below, or synchronise a mailbox that has attachments.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="border-b border-ink-700/60 text-left text-[10px] uppercase tracking-[0.1em] text-slate-500">
                      <th className="px-4 py-2">Document</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Incoterm</th>
                      <th className="px-3 py-2">Quantity</th>
                      <th className="px-3 py-2">Closing</th>
                      <th className="px-3 py-2">Complete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-700/40">
                    {mail.documents.map((document: any) => {
                      const fields = document.requirements?.fields ?? {};
                      const missing = document.completeness?.criticalFieldsMissing ?? [];
                      return (
                        <tr key={document.id}>
                          <td className="px-4 py-2">
                            <p className="text-slate-200">{document.filename}</p>
                            <p className="mono text-[10px] text-slate-600">
                              {document.id} · {document.pageCount}p · {document.readable ? "read" : document.reason ?? "unreadable"}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-slate-300">
                            {document.documentType?.type ?? "—"}
                            <span className="ml-1 text-[10px] text-slate-600">{document.documentType?.confidence ?? ""}</span>
                          </td>
                          <td className="px-3 py-2 text-slate-300">
                            {fields.incoterm ? `${fields.incoterm.term}${fields.incoterm.place ? ` ${fields.incoterm.place}` : ""}` : "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-300">
                            {fields.quantity ? `${fields.quantity.amount} ${fields.quantity.unit}` : "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-300">{fields.closing_date ?? "—"}</td>
                          <td className="px-3 py-2">
                            <Badge tone={document.completeness?.complete ? "emerald" : missing.length ? "rose" : "amber"}>
                              {document.completeness?.complete ? "complete" : missing.length ? `missing ${missing.length}` : "unreadable"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Upload a document" subtitle="PDF, DOCX, XLSX, CSV, TXT, HTML or a scanned image.">
            <form action={uploadDocument} className="flex flex-wrap items-end gap-2 px-4 py-3">
              <input type="file" name="file" required className="input max-w-sm" accept=".pdf,.docx,.xlsx,.csv,.txt,.html,.png,.jpg,.jpeg,.tif,.tiff" />
              <button type="submit" className="btn btn-primary">
                Extract
              </button>
              <p className="w-full text-[11px] leading-relaxed text-slate-500">
                A scanned PDF with no text layer is reported unreadable rather than returning "no requirements". Send the image or an OCR copy instead.
              </p>
            </form>
          </Panel>
        </div>

        <div className="space-y-4">
          {quarantined.length > 0 && (
            <Panel title="Quarantined inbound" subtitle="Held for compliance review; nothing was actioned." dense>
              <ul className="divide-y divide-ink-700/40">
                {quarantined.map((message: any) => (
                  <li key={message.messageId} className="px-4 py-2.5">
                    <p className="text-[12px] text-slate-200">{message.subject || "(no subject)"}</p>
                    <p className="text-[11px] text-slate-500">{message.from}</p>
                    <ul className="mt-1 space-y-0.5">
                      {message.screening.findings.map((finding: any) => (
                        <li key={finding.id} className="text-[11px] text-signal-rose">
                          {finding.label}: <span className="text-slate-500">{finding.excerpt}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="What the integration drives" subtitle="Every SDK endpoint, and who is allowed to trigger it." dense>
            <div className="max-h-[420px] overflow-y-auto px-4 py-2">
              {["automated", "human", "owner_only"].map((exposure) => {
                const items = connection.capability.items.filter((item: any) => item.exposure === exposure);
                return (
                  <div key={exposure} className="mb-3">
                    <p className="label">
                      {exposure.replace("_", " ")} · {items.length}
                    </p>
                    <ul className="space-y-1">
                      {items.map((item: any) => (
                        <li key={item.path + item.method} className="text-[10.5px] leading-snug text-slate-500">
                          <span className="mono text-slate-400">{item.path}.{item.method}</span> — {item.purpose}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Outbound is gated, not automatic" dense>
            <div className="space-y-2 px-4 py-3 text-[11.5px] leading-relaxed text-slate-400">
              <p>
                A message needs a delegated capability for its intent and a clean content policy: verified recipient, business link, sourced claims, approved
                attachments, unused idempotency key.
              </p>
              <p>AI may issue RFQs and follow-ups. It may not send a final quotation, accept a contract, or move money — those resolve to a named human.</p>
              <p className="text-signal-amber">Refusals are written to the ledger with their reasons, so a blocked send is auditable.</p>
              <Link href="/communications" className="link text-[11px]">
                See the correspondence policy →
              </Link>
            </div>
          </Panel>

          {incomplete.length > 0 && (
            <Panel title="Documents that cannot be priced" dense>
              <ul className="divide-y divide-ink-700/40">
                {incomplete.map((document: any) => (
                  <li key={document.id} className="px-4 py-2">
                    <p className="text-[11.5px] text-slate-300">{document.filename}</p>
                    <p className="text-[11px] text-signal-rose">
                      critical missing: {(document.completeness.criticalFieldsMissing ?? []).map(fieldLabel).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}

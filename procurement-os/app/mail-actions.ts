"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loadStore } from "@/lib/data/store.mjs";
import { extractDocument } from "@/lib/extract/pipeline.mjs";
import { storeExtraction, syncMailbox } from "@/lib/integrations/agentmail/sync.mjs";

const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Extract an uploaded document and store the result against the procurement
 * record. The file is parsed before anything is written; an unreadable document
 * is still stored (with its reason), because "we received it and could not read
 * it" is a fact the bid gate needs.
 */
export async function uploadDocument(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/mail?error=" + encodeURIComponent("Choose a file to extract."));
  }

  if (file.size > MAX_BYTES) {
    redirect("/mail?error=" + encodeURIComponent("File is larger than 25 MB."));
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await extractDocument({ buffer, filename: file.name });
  const store = loadStore();
  const stored = storeExtraction(store, result, {
    source: "upload",
    opportunityId: String(formData.get("opportunityId") ?? "") || null,
  });

  revalidatePath("/mail");

  const documentId = stored.document?.id ?? "";
  const status = result.readable ? "read" : "unreadable";
  redirect(
    `/mail?document=${encodeURIComponent(documentId)}&status=${status}` +
      (result.reason ? `&reason=${encodeURIComponent(result.reason)}` : ""),
  );
}

/** Pull the mailbox into the local record. Never replies; read-only on AgentMail. */
export async function syncMail(formData: FormData) {
  const limit = Number(formData.get("limit") ?? 25);
  const result = await syncMailbox({ limit: Number.isFinite(limit) ? limit : 25, extract: true });
  revalidatePath("/mail");
  redirect(
    "/mail?sync=" +
      (result.ok ? "ok" : "failed") +
      (result.ok ? `&new=${result.newMessages}&docs=${result.documents}` : `&message=${encodeURIComponent(result.reason ?? "unknown")}`),
  );
}

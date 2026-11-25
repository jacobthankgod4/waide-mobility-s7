/**
 * Append-only, hash-chained audit ledger.
 *
 * Spec pages 65, 78. Every material action stores actor, tool, timestamp,
 * source snapshot, policy decision, approval and result, and cannot be rewritten.
 */

import { createHash } from "node:crypto";

const GENESIS = "0".repeat(64);

export function hashEvent(event, previousHash) {
  const payload = JSON.stringify({
    seq: event.seq,
    ts: event.ts,
    actor: event.actor,
    actorType: event.actorType,
    action: event.action,
    subject: event.subject,
    policyDecision: event.policyDecision,
    approval: event.approval,
    evidence: event.evidence,
    result: event.result,
    previousHash,
  });
  return createHash("sha256").update(payload).digest("hex");
}

/** Append and seal one event onto the chain. */
export function appendEvent(chain, event) {
  const seq = chain.length + 1;
  const previousHash = chain.length ? chain[chain.length - 1].hash : GENESIS;
  const base = {
    seq,
    ts: event.ts ?? new Date().toISOString(),
    actor: event.actor ?? "system",
    actorType: event.actorType ?? "system",
    action: event.action ?? "unspecified",
    subject: event.subject ?? null,
    policyDecision: event.policyDecision ?? null,
    approval: event.approval ?? null,
    evidence: event.evidence ?? null,
    result: event.result ?? null,
    payloadHash: event.payloadHash ?? null,
  };
  const hash = hashEvent(base, previousHash);
  chain.push({ ...base, previousHash, hash });
  return chain[chain.length - 1];
}

/** Full integrity verification, returning the first broken link. */
export function verifyChain(chain) {
  let prev = GENESIS;
  for (let i = 0; i < chain.length; i += 1) {
    const e = chain[i];
    if (e.seq !== i + 1) return { valid: false, brokenAt: i + 1, reason: "Sequence gap: an event was removed." };
    if (e.previousHash !== prev) return { valid: false, brokenAt: e.seq, reason: "Previous-hash mismatch: chain was rewritten." };
    const recomputed = hashEvent(e, prev);
    if (recomputed !== e.hash) return { valid: false, brokenAt: e.seq, reason: "Event hash does not match its stored content." };
    prev = e.hash;
  }
  return { valid: true, events: chain.length, head: prev };
}

/** Human-auditable explanation of why the system acted (page 65). */
export function explain(chain, subject) {
  const events = chain.filter((e) => e.subject === subject);
  return {
    subject,
    narrative: events.map((e) => ({
      at: e.ts,
      who: `${e.actor} (${e.actorType})`,
      did: e.action,
      decision: e.policyDecision,
      approval: e.approval,
      result: e.result,
      hash: e.hash.slice(0, 12),
    })),
    reconstructable: events.length > 0,
  };
}

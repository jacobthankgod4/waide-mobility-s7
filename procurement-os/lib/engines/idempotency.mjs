/**
 * Idempotency, event deduplication and duplicate-side-effect control.
 *
 * Spec pages 26, 63, 80. Webhooks are at-least-once and can arrive out of order;
 * sends, POs and payments must carry idempotency keys so retries cannot duplicate.
 */

export class EventInbox {
  constructor({ maxAttempts = 8 } = {}) {
    /** @type {Map<string, object>} */
    this.events = new Map();
    this.order = [];
    this.maxAttempts = maxAttempts;
    this.deadLetter = [];
  }

  /**
   * Persist-before-acknowledge ingest.
   * @returns {{accepted:boolean, duplicate:boolean, reason?:string, event?:object}}
   */
  ingest(event) {
    if (!event?.eventId) {
      return { accepted: false, duplicate: false, reason: "Event has no event_id; rejecting rather than risk a duplicate side effect." };
    }
    const existing = this.events.get(event.eventId);
    if (existing) {
      return { accepted: false, duplicate: true, reason: "Duplicate event_id ignored (at-least-once delivery).", event: existing };
    }
    const record = {
      ...event,
      receivedAt: new Date().toISOString(),
      attempts: 0,
      state: "pending",
    };
    this.events.set(event.eventId, record);
    this.order.push(record);
    return { accepted: true, duplicate: false, event: record };
  }

  /** Ordered processing with bounded retries and a dead-letter queue. */
  process(handler) {
    const results = [];
    for (const record of this.order) {
      if (record.state === "done") continue;
      record.attempts += 1;
      try {
        handler(record);
        record.state = "done";
        results.push({ eventId: record.eventId, ok: true, attempts: record.attempts });
      } catch (err) {
        record.lastError = String(err?.message ?? err);
        if (record.attempts >= this.maxAttempts) {
          record.state = "dead_letter";
          this.deadLetter.push(record);
          results.push({ eventId: record.eventId, ok: false, deadLettered: true, error: record.lastError });
        } else {
          record.state = "retry";
          results.push({ eventId: record.eventId, ok: false, willRetry: true, error: record.lastError });
        }
      }
    }
    return { results, deadLetterCount: this.deadLetter.length, health: this.health() };
  }

  /** Out-of-order arrivals: sequence is repaired by business timestamp, not arrival. */
  orderedByBusinessTime() {
    return [...this.order].sort((a, b) => String(a.occurredAt ?? "").localeCompare(String(b.occurredAt ?? "")));
  }

  health() {
    const pending = [...this.events.values()].filter((e) => e.state !== "done").length;
    return {
      received: this.events.size,
      processed: [...this.events.values()].filter((e) => e.state === "done").length,
      pending,
      deadLettered: this.deadLetter.length,
      healthy: this.deadLetter.length === 0,
      endpointDisabledRisk: this.deadLetter.length > 0,
    };
  }
}

/** Idempotent send ledger with business-event keys (pages 23, 26). */
export class SendLedger {
  constructor() {
    this.keys = new Map();
  }
  /** @returns {{sent:boolean, duplicate:boolean, key:string}} */
  send(idempotencyKey, payload) {
    if (!idempotencyKey) return { sent: false, duplicate: false, key: null, reason: "Idempotency key is mandatory for outbound correspondence." };
    if (this.keys.has(idempotencyKey)) {
      return { sent: false, duplicate: true, key: idempotencyKey, previous: this.keys.get(idempotencyKey) };
    }
    const record = { key: idempotencyKey, payload, sentAt: new Date().toISOString(), reconciled: false };
    this.keys.set(idempotencyKey, record);
    return { sent: true, duplicate: false, key: idempotencyKey, record };
  }
  reconcile(key, providerMessageId) {
    const rec = this.keys.get(key);
    if (!rec) return { reconciled: false, reason: "Unknown key." };
    rec.reconciled = true;
    rec.providerMessageId = providerMessageId;
    return { reconciled: true };
  }
}

/** Unique-identifier allocator for POs and payment instructions. */
export class SequenceAllocator {
  constructor(prefixes = { po: "PO", payment: "PAY", invoice: "INV" }) {
    this.prefixes = prefixes;
    this.counters = {};
    this.allocated = new Set();
  }
  allocate(kind, businessKey) {
    if (this.allocated.has(`${kind}:${businessKey}`)) {
      return { allocated: false, duplicate: true, id: this.allocated.get?.(`${kind}:${businessKey}`) };
    }
    this.counters[kind] = (this.counters[kind] ?? 0) + 1;
    const id = `${this.prefixes[kind] ?? kind.toUpperCase()}-${String(this.counters[kind]).padStart(5, "0")}`;
    this.allocated.add(`${kind}:${businessKey}`);
    return { allocated: true, duplicate: false, id };
  }
}

/** Workflow lock prevents concurrent duplicate obligations. */
export class WorkflowLock {
  constructor() {
    this.locks = new Set();
  }
  acquire(key) {
    if (this.locks.has(key)) return { acquired: false, reason: `Workflow lock held for ${key}: a duplicate side effect would otherwise be created.` };
    this.locks.add(key);
    return { acquired: true };
  }
  release(key) {
    this.locks.delete(key);
  }
}

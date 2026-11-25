/**
 * Deterministic state machines.
 *
 * Spec pages 79, 96. An LLM output or a UI click cannot perform an invalid
 * transition; entry criteria are checked in code.
 */

export const MACHINES = {
  opportunity: {
    initial: "discovered",
    states: ["discovered", "deduplicated", "analysed", "eligible", "on_hold", "no_bid", "bid_approved", "submitted", "awarded", "lost", "cancelled", "closed"],
    transitions: {
      discovered: ["deduplicated", "on_hold", "cancelled"],
      deduplicated: ["analysed", "on_hold", "cancelled"],
      analysed: ["eligible", "no_bid", "on_hold"],
      eligible: ["bid_approved", "no_bid", "on_hold"],
      on_hold: ["analysed", "eligible", "no_bid", "cancelled"],
      no_bid: ["closed"],
      bid_approved: ["submitted", "on_hold"],
      submitted: ["awarded", "lost", "cancelled"],
      awarded: ["closed"],
      lost: ["closed"],
      cancelled: ["closed"],
      closed: [],
    },
  },
  supplier: {
    initial: "S0",
    states: ["S0", "S1", "S2", "S3", "suspended", "rejected", "reinstatement_review"],
    transitions: {
      S0: ["S1", "rejected", "suspended"],
      S1: ["S2", "rejected", "suspended"],
      S2: ["S3", "suspended", "rejected"],
      S3: ["suspended", "rejected"],
      suspended: ["reinstatement_review"],
      reinstatement_review: ["S1", "S2", "S3", "rejected"],
      rejected: ["reinstatement_review"],
    },
  },
  bid: {
    initial: "drafting",
    states: ["drafting", "evidence_pending", "compliance_review", "commercial_review", "signatory_approval", "submission_ready", "submitted", "receipt_confirmed", "withdrawn"],
    transitions: {
      drafting: ["evidence_pending", "compliance_review", "withdrawn"],
      evidence_pending: ["compliance_review", "withdrawn"],
      compliance_review: ["commercial_review", "evidence_pending", "withdrawn"],
      commercial_review: ["signatory_approval", "compliance_review", "withdrawn"],
      signatory_approval: ["submission_ready", "commercial_review", "withdrawn"],
      submission_ready: ["submitted", "withdrawn"],
      submitted: ["receipt_confirmed", "withdrawn"],
      receipt_confirmed: [],
      withdrawn: [],
    },
  },
  contract: {
    initial: "award_pending",
    states: ["award_pending", "contract_review", "conditions_pending", "active", "fulfilment", "delivered", "acceptance_pending", "invoicing", "reconciliation", "closed", "disputed", "terminated"],
    transitions: {
      award_pending: ["contract_review", "terminated"],
      contract_review: ["conditions_pending", "active", "terminated"],
      conditions_pending: ["active", "terminated"],
      active: ["fulfilment", "terminated", "disputed"],
      fulfilment: ["delivered", "disputed"],
      delivered: ["acceptance_pending", "disputed"],
      acceptance_pending: ["invoicing", "disputed"],
      invoicing: ["reconciliation", "disputed"],
      reconciliation: ["closed", "disputed"],
      disputed: ["reconciliation", "terminated"],
      closed: [],
      terminated: [],
    },
  },
  payment: {
    initial: "draft",
    states: ["draft", "matched", "approval_pending", "approved", "released", "confirmed", "rejected", "held"],
    transitions: {
      draft: ["matched", "rejected"],
      matched: ["approval_pending", "held", "rejected"],
      approval_pending: ["approved", "rejected", "held"],
      approved: ["released", "held"],
      released: ["confirmed"],
      held: ["approval_pending", "rejected"],
      confirmed: [],
      rejected: [],
    },
  },
};

/**
 * @param {keyof MACHINES} machineId
 * @param {string} from
 * @param {string} to
 * @param {{actorRole?:string, prereqs?:Record<string,boolean>}} [context]
 */
export function transition(machineId, from, to, context = {}) {
  const machine = MACHINES[machineId];
  if (!machine) return { ok: false, reason: `Unknown state machine "${machineId}".` };
  if (!machine.states.includes(from)) return { ok: false, reason: `"${from}" is not a state of ${machineId}.` };
  if (!machine.states.includes(to)) return { ok: false, reason: `"${to}" is not a state of ${machineId}.` };
  if (!machine.transitions[from]?.includes(to)) {
    return { ok: false, reason: `Illegal transition ${machineId}: ${from} -> ${to}. Allowed: ${machine.transitions[from]?.join(", ") || "none"}.` };
  }

  const failed = Object.entries(context.prereqs ?? {})
    .filter(([, passed]) => !passed)
    .map(([key]) => key);

  if (failed.length) {
    return { ok: false, reason: `Entry criteria not met for ${from} -> ${to}: ${failed.join(", ")}.`, failedPrereqs: failed };
  }

  return { ok: true, machineId, from, to, reason: `Transition ${from} -> ${to} permitted.`, recordEvent: true };
}

/** Guard used where a side effect must be blocked unless the machine allows it. */
export function assertTransition(machineId, from, to, context) {
  const result = transition(machineId, from, to, context);
  if (!result.ok) throw new Error(result.reason);
  return result;
}

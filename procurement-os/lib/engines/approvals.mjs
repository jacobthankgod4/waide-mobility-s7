/**
 * Approval aggregation for the write path.
 *
 * A decision is recorded only when the approval is open, the actor's role is a
 * declared required authority, and that role has not already decided. Dual
 * control therefore means two distinct authorities, never the same one twice.
 * The function is pure: it returns the resulting state and the caller persists.
 */

const OPEN = new Set(["pending", "awaiting_second"]);

/**
 * @param {object} approval approval record (id, status, requiredRoles, decisions)
 * @param {{role: string, name?: string, decision?: string, rationale?: string}} input
 * @param {Date} [now]
 */
export function applyDecision(approval, input = {}, now = new Date()) {
  const decisions = (approval.decisions ?? []).map((d) => ({ ...d }));
  const requiredRoles = (approval.requiredRoles ?? []).filter(Boolean);
  const id = approval.id ?? "Approval";
  const role = input.role;
  const name = input.name ?? role;
  const rationale = String(input.rationale ?? "").slice(0, 600);

  if (!OPEN.has(approval.status)) {
    return {
      ok: false,
      status: approval.status,
      decisions,
      reason: `${id} is ${approval.status}; only an open approval may be decided.`,
    };
  }

  if (!requiredRoles.length) {
    return {
      ok: false,
      status: approval.status,
      decisions,
      reason: `${id} declares no required authority, so no decision can satisfy it.`,
    };
  }

  if (!requiredRoles.includes(role)) {
    return {
      ok: false,
      status: approval.status,
      decisions,
      reason: `${role} is not a required authority for ${id} (requires ${requiredRoles.join(" + ")}).`,
    };
  }

  const at = new Date(now).toISOString();

  if (input.decision === "reject") {
    return {
      ok: true,
      status: "rejected",
      decisions,
      decidedBy: name,
      decidedAt: at,
      rationale,
      reason: "Rejected.",
    };
  }

  if (decisions.some((d) => d.role === role)) {
    return {
      ok: false,
      status: approval.status,
      decisions,
      reason: `${role} has already decided ${id}. A distinct authority is required for the second decision.`,
    };
  }

  decisions.push({ role, by: name, at, rationale });
  const satisfied = new Set(decisions.map((d) => d.role));
  const missing = requiredRoles.filter((required) => !satisfied.has(required));

  if (missing.length === 0) {
    return {
      ok: true,
      status: "approved",
      decisions,
      decidedBy: decisions.map((d) => d.by).join(" + "),
      decidedAt: at,
      rationale,
      reason: "Authority satisfied; the action may proceed.",
    };
  }

  return {
    ok: true,
    status: "awaiting_second",
    decisions,
    secondApproverRole: missing[0],
    reason: `Awaiting ${missing[0]}.`,
  };
}

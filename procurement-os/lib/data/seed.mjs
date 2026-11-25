/**
 * Seed aggregator. Assembles the synthetic operational dataset and seals the
 * initial audit chain.
 */

import { clock, policy, legalEntity, users, sectors, countries } from "./seed-identity.mjs";
import { suppliers, documents } from "./seed-market.mjs";
import { opportunities, bidModels } from "./seed-opportunities.mjs";
import {
  contracts,
  purchaseOrders,
  shipments,
  invoices,
  payments,
  approvals,
  communications,
  screenings,
  conflicts,
  exceptions,
  notificationChannels,
  auditSeeds,
} from "./seed-operations.mjs";
import { appendEvent } from "../engines/ledger.mjs";

export function buildSeed() {
  const c = clock();

  const ledger = [];
  for (const seed of auditSeeds(c)) {
    appendEvent(ledger, { ...seed, ts: c.at(-1, 2) });
  }

  return {
    meta: {
      version: "1.0.0",
      dataset: "synthetic-demonstration",
      seededAt: new Date().toISOString(),
      disclaimer:
        "All companies, people, amounts, certificates and screening entries in this build are fabricated. Nothing here is a real supplier, approval, licence or market rate.",
    },
    policy: policy(),
    legalEntity: legalEntity(),
    users: users(),
    sectors: sectors(),
    countries: countries(c),
    suppliers: suppliers(c),
    documents: documents(c),
    opportunities: opportunities(c),
    bidModels: bidModels(c),
    contracts: contracts(c),
    purchaseOrders: purchaseOrders(c),
    shipments: shipments(c),
    invoices: invoices(c),
    payments: payments(c),
    approvals: approvals(c),
    communications: communications(c),
    screenings: screenings(c),
    conflicts: conflicts(c),
    exceptions: exceptions(c),
    notificationChannels: notificationChannels(c),
    settings: {
      startingCash: 240000,
      approvedFacility: 350000,
      costOfCapitalPct: 14,
      dualApprovalThreshold: 250000,
      currency: "USD",
    },
    ledger,
  };
}

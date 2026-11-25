/**
 * Incoterms 2020 and import-control intelligence.
 *
 * Spec pages 32, 51, 59. Cost/risk transfer is a data structure, not a label;
 * a bare "CIF" without a named place is an inconsistency the system blocks.
 */

export const INCOTERMS_2020 = {
  EXW: { freight: "Buyer", exportClearance: "Buyer", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Buyer (optional)", duties: "Buyer", deliveryPoint: "Seller premises" },
  FCA: { freight: "Buyer", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Buyer (optional)", duties: "Buyer", deliveryPoint: "Named place / carrier" },
  FAS: { freight: "Buyer", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Buyer (optional)", duties: "Buyer", deliveryPoint: "Alongside ship" },
  FOB: { freight: "Buyer", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Buyer (optional)", duties: "Buyer", deliveryPoint: "On board vessel" },
  CFR: { freight: "Seller", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Buyer", duties: "Buyer", deliveryPoint: "Destination port" },
  CIF: { freight: "Seller", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Seller (min cover)", duties: "Buyer", deliveryPoint: "Destination port" },
  CPT: { freight: "Seller", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Buyer", duties: "Buyer", deliveryPoint: "Named destination" },
  CIP: { freight: "Seller", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Buyer", insurance: "Seller (all-risk)", duties: "Buyer", deliveryPoint: "Named destination" },
  DAP: { freight: "Seller", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Seller", insurance: "Seller", duties: "Buyer", deliveryPoint: "Named place" },
  DPU: { freight: "Seller", exportClearance: "Seller", importClearance: "Buyer", transitRisk: "Seller", insurance: "Seller", duties: "Seller (unloaded)", deliveryPoint: "Named place, unloaded" },
  DDP: { freight: "Seller", exportClearance: "Seller", importClearance: "Seller", transitRisk: "Seller", insurance: "Seller", duties: "Seller", deliveryPoint: "Named place, duty paid" },
};

/**
 * @param {{rule:string, namedPlace?:string, version?:string, importerOfRecord?:string, sellerRole?:string, insuranceArranged?:string}} term
 */
export function checkIncoterm(term = {}) {
  const issues = [];
  const rule = String(term.rule ?? "").toUpperCase();
  const matrix = INCOTERMS_2020[rule];

  if (!matrix) issues.push({ code: "unknown_rule", severity: "critical", message: `Incoterm rule "${term.rule ?? ""}" is not an Incoterms 2020 rule.` });
  if (!term.namedPlace) issues.push({ code: "missing_named_place", severity: "critical", message: "Incoterm has no named place/port; shorthand labels are not acceptable." });
  if (term.version && term.version !== "2020") issues.push({ code: "version", severity: "medium", message: `Rule version "${term.version}" - specify Incoterms 2020.` });

  if (matrix && term.insuranceArranged) {
    const expected = matrix.insurance.toLowerCase();
    if (term.insuranceArranged === "buyer" && expected.startsWith("seller")) {
      issues.push({ code: "insurance_inconsistent", severity: "high", message: `Under ${rule}, the seller must arrange insurance; the model assigns it to the buyer.` });
    }
    if (term.insuranceArranged === "seller" && expected === "buyer") {
      issues.push({ code: "insurance_inconsistent", severity: "high", message: `Under ${rule}, the buyer bears insurance; the model assigns it to the seller (an unpriced cost).` });
    }
  }

  if (matrix && term.importerOfRecord === "seller" && matrix.importClearance === "Buyer") {
    issues.push({ code: "ior_conflict", severity: "high", message: `Waide is named importer of record but ${rule} places import clearance with the buyer.` });
  }

  return {
    rule,
    namedPlace: term.namedPlace ?? null,
    responsibilities: matrix ?? null,
    issues,
    valid: issues.filter((i) => i.severity === "critical").length === 0,
    blockingReason: issues.some((i) => i.severity === "critical") ? issues.find((i) => i.severity === "critical").message : null,
  };
}

/** Nigeria import control gate (page 32). */
export const NIGERIA_IMPORT_RULES = {
  formM: { required: true, authority: "CBN Foreign Exchange Manual (4th ed., 2026)", note: "All physical goods imports processed via Form M through an Authorised Dealer Bank, regardless of value or whether payment is involved." },
  valuerBasis: { required: true, basis: "CFR", note: "Manual states a CFR basis for imports, with an oil-importation exception; confirm against current rules for the exact transaction." },
  soncap: { required: true, note: "SONCAP applies to goods regulated under the scheme; a certificate is required for regulated imports." },
  nafdac: { requiredForMedical: true, note: "Medical devices must be registered before manufacture, importation, export or sale in Nigeria, subject to applicable provisions." },
};

/**
 * @param {object} shipment
 */
export function nigeriaImportGate(shipment = {}) {
  const blockers = [];
  const warnings = [];

  if (!shipment.importerOfRecord) blockers.push("Importer of record is not established.");
  if (!shipment.formM) blockers.push("Form M is not recorded for a Nigeria-bound physical import.");
  if (!shipment.formMBank) blockers.push("No Authorised Dealer Bank named on the Form M.");
  if (!shipment.proformaInvoice) blockers.push("Pro forma invoice is not attached.");
  if (!shipment.insuranceCertificate) blockers.push("Cargo insurance certificate is missing.");

  if (shipment.incotermRule && shipment.incotermRule !== "CFR") {
    warnings.push(`Import basis recorded as ${shipment.incotermRule}; CBN manual cites a CFR basis. Confirm the treatment with the Authorised Dealer Bank before shipment.`);
  }
  if (shipment.requiresNafdac && !shipment.nafdacRegistration) {
    blockers.push("NAFDAC product registration is missing for a regulated medical product.");
  }
  if (shipment.soncapApplicable && !shipment.soncapCertificate) {
    blockers.push("SONCAP certificate is missing for a regulated product.");
  }
  if (!shipment.hsCode || shipment.hsCodeVerifiedBy === "ai_guess") {
    blockers.push("HS classification is unverified; a competent customs professional must confirm it before release.");
  }
  if (!shipment.customsBroker) warnings.push("No licensed customs broker assigned.");

  return {
    released: blockers.length === 0,
    blockers,
    warnings,
    gate: "Nigeria import release gate",
    rules: NIGERIA_IMPORT_RULES,
    note: "Direct shipment does not remove import procedures: Form M, insurance, regulatory documents and banking coordination still apply.",
    verdict: blockers.length ? "shipment_held" : warnings.length ? "released_with_warnings" : "released",
  };
}

/** Present the importer/exporter/duty responsibility picture for a lane. */
export function logisticsResponsibility(term = {}) {
  const incoterm = checkIncoterm(term);
  return {
    incoterm,
    lane: {
      exporterOfRecord: term.exporterOfRecord ?? null,
      importerOfRecord: term.importerOfRecord ?? null,
      consignee: term.consignee ?? null,
      route: term.route ?? [],
      namedPlace: term.namedPlace ?? null,
    },
    costBearers: incoterm.responsibilities
      ? {
          freight: incoterm.responsibilities.freight,
          insurance: incoterm.responsibilities.insurance,
          exportClearance: incoterm.responsibilities.exportClearance,
          importClearance: incoterm.responsibilities.importClearance,
          duties: incoterm.responsibilities.duties,
          demurrage: "Contract-specific - must be allocated explicitly",
        }
      : null,
  };
}

/**
 * Synthetic demonstration dataset - policy, entity, users, sectors.
 * All companies, people and figures are fabricated for this build.
 */

const DAY = 86400000;

export function clock() {
  const now = Date.now();
  return {
    at: (days, hours = 0) => new Date(now + days * DAY + hours * 3600000).toISOString(),
    day: (days) => new Date(now + days * DAY).toISOString().slice(0, 10),
  };
}

export function policy() {
  return {
    version: "WAOC-1.0.0",
    title: "Waide Autonomous Operations Constitution",
    status: "draft_pending_board_approval",
    statusNote:
      "These are proposed company operating controls, not a signed board resolution, a legal opinion or evidence of statutory obligation. No capability is authorised until an authorised officer records approval.",
    effectiveFrom: null,
    reviewTriggers: [
      "Change in law or regulator guidance",
      "Change of legal entity, ownership or signatory authority",
      "New sector, country tier or product class",
      "Material security incident",
      "Margin thresholds recalibrated after 10-20 completed transactions per category",
    ],
    automatedLimits: {
      supplierPrepayment: 0,
      unconditionalPurchaseCommitment: 0,
      paymentGuarantee: 0,
      newCreditFacility: 0,
    },
    humanReservedActions: [
      "Final bid submission and final buyer quotation",
      "Contract signature, deeds and personal declarations",
      "Bid security, performance bonds and advance-payment guarantees",
      "Payment release, beneficiary change and new credit facilities",
      "Product equivalence and technical-compliance assertions",
    ],
  };
}

export function legalEntity() {
  return {
    id: "LE-WAIDE-NG",
    registeredName: "Waide Mobility Limited",
    tradingName: "Waide Mobility",
    rcNumber: "RC 1748293",
    jurisdiction: "NG",
    incorporationDate: "2019-06-11",
    registeredAddress: "Plot 14, Adetokunbo Ademola Crescent, Wuse II, Abuja, FCT, Nigeria",
    objectsSummary:
      "Procurement, supply and technology services. Business objects and borrowing powers must be confirmed against the filed Memorandum & Articles before a bid relies on them.",
    confirmationStatus: "pending_confirmation",
    confirmationNote:
      "The exact CAC-registered name, RC number, objects clause and board-delegated signatory authority must be confirmed by the Managing Director against CAC records. The system does not infer them and blocks final submission while confirmation is outstanding.",
    taxId: "TIN 20944187-0001",
    bppRegistration: "BPP/IRS/2026/0418 (recorded, pending current-portal revalidation)",
    signatoryRegister: [
      { id: "SIG-1", role: "Managing Director", scope: "Corporate signatory", limit: null, alternates: ["SIG-2"], status: "proposed_pending_board_resolution", mfa: "WebAuthn (target)" },
      { id: "SIG-2", role: "Finance Approver", scope: "Financial instruments only", limit: 250000, alternates: ["SIG-1"], status: "proposed_pending_board_resolution", mfa: "WebAuthn (target)" },
    ],
  };
}

export function users() {
  return [
    { id: "u-md", name: "Managing Director", role: "managing_director", title: "Authorised corporate signatory (proposed)" },
    { id: "u-fin", name: "Finance Approver", role: "finance_approver", title: "Payments, guarantees, banking" },
    { id: "u-legal", name: "Legal Reviewer", role: "legal_reviewer", title: "Liability, disputes, unusual commitments" },
    { id: "u-comp", name: "Compliance Officer", role: "compliance_officer", title: "Sanctions, conflicts, evidence integrity" },
    { id: "u-proc", name: "Procurement Officer", role: "procurement_officer", title: "Sourcing and bid preparation" },
    { id: "u-ai", name: "AI Procurement Agent", role: "ai_agent", title: "Reads, extracts, drafts, monitors - no signature or payment authority" },
  ];
}

export function sectors() {
  return [
    { code: "A1", label: "Geospatial, GIS & digital twins", approach: "Software licensing, implementation and services", targetMin: 30, targetMax: 40, floor: 25, priority: 1 },
    { code: "A2", label: "Medical supplies & consumables", approach: "Manufacturer-backed institutional supply", targetMin: 18, targetMax: 25, floor: 15, priority: 2 },
    { code: "A3", label: "Mobility & orthopaedic equipment", approach: "Product-specific sourcing and institutional supply", targetMin: 20, targetMax: 28, floor: 17, priority: 3 },
    { code: "A4", label: "Mining equipment, spares & safety", approach: "OEM-backed procurement and technical subcontracting", targetMin: 18, targetMax: 25, floor: 15, priority: 4 },
    { code: "A4S", label: "Mining safety equipment", approach: "Product-specific sourcing with hazardous-area evidence", targetMin: 20, targetMax: 28, floor: 17, priority: 5 },
    { code: "B1", label: "Construction & infrastructure supply", approach: "Equipment, engineering technology, specialist subcontracting", targetMin: 20, targetMax: 28, floor: 18, priority: 6 },
    { code: "B2", label: "Hospitality technology", approach: "Software integration and digital infrastructure", targetMin: 25, targetMax: 40, floor: 20, priority: 7 },
    { code: "B3", label: "Tourism technology", approach: "Booking, visitor technology and destination systems", targetMin: 25, targetMax: 40, floor: 20, priority: 8 },
    { code: "C", label: "Pharmaceuticals, controlled chemicals, explosives, radioactive material, defence", approach: "Excluded from autonomous trading at launch", targetMin: null, targetMax: null, floor: 100, priority: 99, excluded: true },
  ];
}

export function countries(c) {
  return [
    {
      code: "NG", name: "Nigeria", tier: 1, role: "Operating base", lastRefresh: c.day(-21),
      factors: { opportunityVolume: 88, legalEligibility: 82, buyerPayment: 58, supplierLogistics: 66, productRegulatory: 55, fxBanking: 48, politicalSanctions: 62, localPartner: 84 },
      hardStops: [],
      note: "Operating base. Form M, SONCAP and NAFDAC gates apply to inbound goods.",
    },
    {
      code: "KE", name: "Kenya", tier: 1, role: "Regional expansion", lastRefresh: c.day(-30),
      factors: { opportunityVolume: 76, legalEligibility: 62, buyerPayment: 74, supplierLogistics: 68, productRegulatory: 66, fxBanking: 61, politicalSanctions: 70, localPartner: 71 },
      hardStops: [],
      note: "Strong development-bank and utility pipeline. Local registration and tax status not yet confirmed.",
    },
    {
      code: "GH", name: "Ghana", tier: 1, role: "Regional expansion", lastRefresh: c.day(-44),
      factors: { opportunityVolume: 68, legalEligibility: 58, buyerPayment: 65, supplierLogistics: 63, productRegulatory: 60, fxBanking: 55, politicalSanctions: 72, localPartner: 64 },
      hardStops: [],
      note: "Health-sector framework opportunities. Local partner and after-sales capability limited.",
    },
    {
      code: "UG", name: "Uganda", tier: 1, role: "Regional expansion", lastRefresh: c.day(-52),
      factors: { opportunityVolume: 61, legalEligibility: 52, buyerPayment: 63, supplierLogistics: 55, productRegulatory: 57, fxBanking: 50, politicalSanctions: 66, localPartner: 55 },
      hardStops: [],
      note: "Development-bank funded health equipment. Confirm local-representative requirement.",
    },
    {
      code: "TZ", name: "Tanzania", tier: 1, role: "Regional expansion", lastRefresh: c.day(-58),
      factors: { opportunityVolume: 59, legalEligibility: 50, buyerPayment: 60, supplierLogistics: 54, productRegulatory: 55, fxBanking: 47, politicalSanctions: 64, localPartner: 52 },
      hardStops: [],
      note: "Tourism technology demand. Payment routes and FX exposure need modelling.",
    },
    {
      code: "ZM", name: "Zambia", tier: 1, role: "Regional expansion", lastRefresh: c.day(-26),
      factors: { opportunityVolume: 64, legalEligibility: 55, buyerPayment: 61, supplierLogistics: 58, productRegulatory: 49, fxBanking: 46, politicalSanctions: 68, localPartner: 57 },
      hardStops: [],
      note: "Mining supply chain. Dual-use equipment needs export-control classification.",
    },
    {
      code: "RW", name: "Rwanda", tier: 1, role: "Regional expansion", lastRefresh: c.day(-63),
      factors: { opportunityVolume: 54, legalEligibility: 48, buyerPayment: 67, supplierLogistics: 57, productRegulatory: 58, fxBanking: 52, politicalSanctions: 71, localPartner: 50 },
      hardStops: [],
      note: "Digital-government opportunities; small average contract sizes.",
    },
    {
      code: "ZA", name: "South Africa", tier: 2, role: "Selective expansion", lastRefresh: c.day(-35),
      factors: { opportunityVolume: 74, legalEligibility: 40, buyerPayment: 72, supplierLogistics: 78, productRegulatory: 68, fxBanking: 66, politicalSanctions: 74, localPartner: 68 },
      hardStops: [],
      note: "Activate only after local compliance, language and delivery-route assessment.",
    },
    {
      code: "BW", name: "Botswana", tier: 2, role: "Selective expansion", lastRefresh: null,
      factors: { opportunityVolume: 42, legalEligibility: 38, buyerPayment: 70, supplierLogistics: 52, productRegulatory: 60, fxBanking: 64, politicalSanctions: 80 },
      hardStops: [],
      note: "Local-partner capability factor not yet assessed - confidence reduced.",
    },
    {
      code: "RU", name: "Russian Federation", tier: 3, role: "Global procurement (restricted)", lastRefresh: c.day(-15),
      factors: { opportunityVolume: 30, legalEligibility: 5, buyerPayment: 30, supplierLogistics: 20, productRegulatory: 20, fxBanking: 5, politicalSanctions: 2, localPartner: 10 },
      hardStops: [{ code: "SANCTIONS_RESTRICTION", label: "Sanctions and payment restrictions make the transaction non-viable; legal prohibition overrides any score." }],
      note: "Illustrates a hard stop: a score can never override a legal prohibition.",
    },
  ];
}

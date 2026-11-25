/**
 * Synthetic demonstration dataset - suppliers and the corporate evidence vault.
 * Every certificate, bank detail and company is fabricated for this build.
 */

const CHECK_LABELS = [
  ["registration", "Company registration & legal entity"],
  ["ubo", "Ultimate beneficial ownership & directors"],
  ["contacts", "Independent contact verification"],
  ["factory", "Factory / manufacturer identity"],
  ["products", "Exact products offered verified"],
  ["authorisation", "Manufacturer authorisation (where relevant)"],
  ["certificates", "Product certificates verified with issuing body"],
  ["export", "Export & destination regulatory suitability"],
  ["pastSupply", "Genuine previous supply records"],
  ["capacity", "Financial & operational capacity"],
  ["sanctions", "Sanctions & debarment screening"],
  ["bank", "Bank account ownership verification"],
  ["quality", "Quality complaints, recalls & warranty history"],
  ["shipping", "Shipping & delivery record"],
  ["terms", "Written prices, validity & supply commitments"],
  ["conflict", "Conflict of interest declared"],
];

function checks(passed, notes = {}) {
  return CHECK_LABELS.map(([id, label]) => ({
    id,
    label,
    passed: passed.includes(id),
    evidence: passed.includes(id) ? notes[id] ?? "Evidence on file" : null,
    note: passed.includes(id) ? null : notes[id] ?? "Not yet evidenced",
  }));
}

export function suppliers(c) {
  return [
    {
      id: "SUP-KE-001", legalName: "Nairobi Geospatial Systems Ltd", country: "KE",
      roles: ["manufacturer", "implementer", "bank_beneficiary"], state: "S3", sectorCodes: ["A1"], sanctionsStatus: "clear",
      beneficiary: { name: "Nairobi Geospatial Systems Ltd", bank: "Equity Bank Kenya", accountLast4: "4417", verified: true, verifiedAt: c.at(-40) },
      checks: checks(["registration", "ubo", "contacts", "factory", "products", "authorisation", "certificates", "export", "pastSupply", "capacity", "sanctions", "bank", "quality", "shipping", "terms", "conflict"], {
        conflict: "Signed conflict-of-interest declaration, 2026-11-24",
      }),
      performance: { deliveries: 7, onTimePct: 96, qualityAcceptPct: 99, responseHours: 9, claims: 0, score: 92, confidence: "high" },
      products: [
        { model: "NGS-GIS-ENTERPRISE", description: "Enterprise GIS platform licence, 5-year, 40 named users", unit: "licence", hsCode: "4907.00" },
        { model: "NGS-TWIN-CORE", description: "Digital twin core module with asset registry", unit: "licence", hsCode: "4907.00" },
      ],
      notes: "Strategic supplier with signed terms and seven delivered contracts.",
    },
    {
      id: "SUP-NL-002", legalName: "Sahara Medical Supply BV", country: "NL",
      roles: ["exporter", "distributor", "bank_beneficiary"], state: "S2", sectorCodes: ["A2", "A3"], sanctionsStatus: "potential_match",
      beneficiary: { name: "Sahara Medical Supply BV", bank: "ABN AMRO", accountLast4: "8891", verified: true, verifiedAt: c.at(-12) },
      checks: checks(["registration", "ubo", "contacts", "products", "certificates", "export", "capacity", "bank", "terms"], {
        factory: "Distributor only: no manufacturing facility evidenced",
        authorisation: "Manufacturer letter is undated and not on letterhead",
        pastSupply: "Two delivery records, one disputed",
        quality: "One open warranty claim",
        shipping: "Partial shipment history only",
      }),
      performance: { deliveries: 2, onTimePct: 71, qualityAcceptPct: 88, responseHours: 26, claims: 1, score: 54, confidence: "medium" },
      products: [{ model: "SM-US900", description: "Portable ultrasound, 900 series", unit: "unit", hsCode: "9018.12" }],
      notes: "Potential screening match unresolved - workflows touching this supplier are frozen.",
    },
    {
      id: "SUP-DE-003", legalName: "Precision Orthopaedics GmbH", country: "DE",
      roles: ["manufacturer", "bank_beneficiary"], state: "S2", sectorCodes: ["A3"], sanctionsStatus: "clear",
      beneficiary: { name: "Precision Orthopaedics GmbH", bank: "Commerzbank", accountLast4: "2205", verified: true, verifiedAt: c.at(-18) },
      checks: checks(["registration", "ubo", "contacts", "factory", "products", "authorisation", "certificates", "export", "capacity", "sanctions", "bank", "quality", "shipping", "terms"], {
        pastSupply: "No prior supply record with Waide; two manufacturer references pending verification",
      }),
      performance: { deliveries: 0, onTimePct: null, qualityAcceptPct: null, responseHours: 14, claims: 0, score: null, confidence: "low" },
      products: [
        { model: "PO-HIP-420", description: "Total hip replacement system, sterile, 420 series", unit: "set", hsCode: "9021.31" },
        { model: "PO-KNEE-310", description: "Primary knee system, 310 series", unit: "set", hsCode: "9021.31" },
      ],
      notes: "Technically approved; strategic approval pending a signed supply agreement.",
    },
    {
      id: "SUP-NG-004", legalName: "Lagos Mobility Partners Ltd", country: "NG",
      roles: ["agent", "distributor"], state: "S1", sectorCodes: ["A3"], sanctionsStatus: "clear",
      beneficiary: { name: "LM Partners Ltd", bank: "Zenith Bank", accountLast4: "3312", verified: false, verifiedAt: null },
      checks: checks(["registration", "contacts", "sanctions"], {
        ubo: "Ownership chain stops at a nominee director",
        factory: "Claims OEM status but has no factory",
        products: "Catalogue claims OEM models without authorisation",
        authorisation: "No manufacturer letter",
        bank: "Account name differs from the contracting entity",
      }),
      performance: { deliveries: 0, onTimePct: null, qualityAcceptPct: null, responseHours: 48, claims: 0, score: null, confidence: "low" },
      products: [{ model: "PO-HIP-420 (claimed)", description: "Claims to supply Precision Orthopaedics hip system", unit: "set", hsCode: "9021.31" }],
      notes: "Reseller presenting as manufacturer. May not support a product-specific bid above S1.",
    },
    {
      id: "SUP-ZM-005", legalName: "Copperbelt Industrial Supplies Ltd", country: "ZM",
      roles: ["distributor", "bank_beneficiary"], state: "S1", sectorCodes: ["A4", "A4S"], sanctionsStatus: "clear",
      beneficiary: { name: "Copperbelt Industrial Supplies Ltd", bank: "Zanaco", accountLast4: "7710", verified: true, verifiedAt: c.at(-9) },
      checks: checks(["registration", "ubo", "contacts", "sanctions", "bank"], {
        factory: "Distributor only",
        products: "Product list not yet mapped to exact models",
        certificates: "No hazardous-area certificates supplied",
        capacity: "No financial statements provided",
        terms: "Indicative pricing only, 14-day validity",
      }),
      performance: { deliveries: 0, onTimePct: null, qualityAcceptPct: null, responseHours: 31, claims: 0, score: null, confidence: "low" },
      products: [{ model: "MINE-SENSOR-X2", description: "Mine environment sensor node (dual-use candidate)", unit: "unit", hsCode: "9027.80" }],
      notes: "Cannot support a bid until S2 checks and export classification are complete.",
    },
    {
      id: "SUP-TZ-006", legalName: "Arusha Digital Ventures Ltd", country: "TZ",
      roles: ["implementer"], state: "S0", sectorCodes: ["B3", "B2"], sanctionsStatus: "clear",
      beneficiary: { name: "Arusha Digital Ventures Ltd", bank: "CRDB Bank", accountLast4: "9902", verified: false, verifiedAt: null },
      checks: checks([], { registration: "Identified from a referral only" }),
      performance: { deliveries: 0, onTimePct: null, qualityAcceptPct: null, responseHours: null, claims: 0, score: null, confidence: "low" },
      products: [{ model: "ADV-BOOKING", description: "Destination booking and visitor management platform", unit: "licence", hsCode: "4907.00" }],
      notes: "Discovered only. No documents may be relied on in a binding bid.",
    },
  ];
}

export function documents(c) {
  return [
    {
      id: "DOC-001", title: "Certificate of Incorporation", class: "corporate_identity", docType: "Certificate",
      holderName: "Waide Mobility Limited", rcNumber: "RC 1748293", legalEntity: "Waide Mobility Limited",
      issuer: "Corporate Affairs Commission (CAC)", issued: c.day(-2680), expires: null,
      verifiedSource: "CAC public search", verificationStatus: "verified", lastVerifiedAt: c.at(-60),
      accessClass: "internal", permittedUses: ["registration", "bid_attachment", "identity"], hash: "sha256:9f2c…a71b",
      note: "Name and RC number recorded for confirmation against the current CAC status report.",
    },
    {
      id: "DOC-002", title: "CAC Company Status Report", class: "corporate_identity", docType: "Status report",
      holderName: "Waide Mobility Limited", rcNumber: "RC 1748293", legalEntity: "Waide Mobility Limited",
      issuer: "Corporate Affairs Commission (CAC)", issued: c.day(-330), expires: c.day(11),
      verifiedSource: "CAC public search", verificationStatus: "verified", lastVerifiedAt: c.at(-2),
      accessClass: "internal", permittedUses: ["registration", "bid_attachment", "identity"], hash: "sha256:1d84…b3c0",
      note: "Expires inside the bid window; renewal requested.",
    },
    {
      id: "DOC-003", title: "Tax Clearance Certificate (2025)", class: "tax_statutory", docType: "Tax evidence",
      holderName: "Waide Mobility Limited", rcNumber: "RC 1748293", legalEntity: "Waide Mobility Limited",
      issuer: "Federal Inland Revenue Service", issued: c.day(-420), expires: c.day(-41),
      verifiedSource: "FIRS portal", verificationStatus: "verified", lastVerifiedAt: c.at(-41),
      accessClass: "confidential", permittedUses: ["bid_attachment", "compliance"], hash: "sha256:77aa…0e5f",
      note: "Expired. Current 2026 tax-compliance evidence under the Tax Acts 2025 framework is required before any bid.",
    },
    {
      id: "DOC-004", title: "Audited Financial Statements FY2024", class: "financial", docType: "Audited accounts",
      holderName: "Waide Mobility Limited", rcNumber: "RC 1748293", legalEntity: "Waide Mobility Limited",
      issuer: "Independent auditor", issued: c.day(-300), expires: c.day(60),
      verifiedSource: "Signed auditor copy", verificationStatus: "verified", lastVerifiedAt: c.at(-90),
      accessClass: "restricted_financial", permittedUses: ["financial_disclosure", "bid_attachment"],
      hash: "sha256:5b21…cc90",
      note: "Turnover, net assets, cash and available credit are separate measures and are never interchanged.",
      financials: { currency: "USD", turnover: 4120000, netAssets: 860000, cash: 240000, availableCredit: 350000, period: "FY2024" },
    },
    {
      id: "DOC-005", title: "Bank Reference Letter", class: "financial", docType: "Bank reference",
      holderName: "Waide Mobility Limited", legalEntity: "Waide Mobility Limited",
      issuer: "Authorised Dealer Bank", issued: c.day(-70), expires: c.day(295),
      verifiedSource: "Bank-issued letter", verificationStatus: "verified", lastVerifiedAt: c.at(-70),
      accessClass: "restricted_financial", permittedUses: ["financial_disclosure", "bid_attachment"], hash: "sha256:aa03…41d7",
      note: "Confirms the account relationship only; it is not a credit facility.",
    },
    {
      id: "DOC-006", title: "NAFDAC Medical Device Registration - SM-US900", class: "sector_credential", docType: "Product registration",
      holderName: "Sahara Medical Supply BV", legalEntity: "Sahara Medical Supply BV",
      issuer: "NAFDAC", issued: c.day(-500), expires: c.day(210),
      verifiedSource: "NAFDAC registered-products database", verificationStatus: "verified", lastVerifiedAt: c.at(-20),
      accessClass: "confidential", permittedUses: ["bid_attachment", "product_compliance"],
      productModel: "SM-US900", hash: "sha256:c4d9…8e10",
      note: "Covers model SM-US900 only. It cannot support a bid for a different model or legal manufacturer.",
    },
    {
      id: "DOC-007", title: "ISO 13485 Quality Management Certificate", class: "sector_credential", docType: "Quality certificate",
      holderName: "Precision Orthopaedics GmbH", legalEntity: "Precision Orthopaedics GmbH",
      issuer: "Notified body (fixture)", issued: c.day(-800), expires: c.day(120),
      verifiedSource: "Issuer certificate register", verificationStatus: "verified", lastVerifiedAt: c.at(-30),
      accessClass: "confidential", permittedUses: ["bid_attachment", "product_compliance", "technical"], hash: "sha256:33bf…9a12",
      note: "Quality-system certificate, not a product approval for any destination market.",
    },
    {
      id: "DOC-008", title: "Manufacturer Authorisation - Precision Orthopaedics", class: "sector_credential", docType: "Authorisation letter",
      holderName: "Waide Mobility Limited", legalEntity: "Waide Mobility Limited",
      issuer: "Precision Orthopaedics GmbH", issued: c.day(-355), expires: c.day(6),
      verifiedSource: "Manufacturer letterhead + direct confirmation", verificationStatus: "verified", lastVerifiedAt: c.at(-355),
      accessClass: "confidential", permittedUses: ["bid_attachment", "product_compliance"], hash: "sha256:ba71…7c33",
      note: "Expires in 6 days and is limited to West Africa; an East African delivery would void reliance.",
    },
    {
      id: "DOC-009", title: "Completion Certificate - Regional Hospital Fit-out", class: "past_performance", docType: "Completion certificate",
      holderName: "Precision Orthopaedics GmbH", legalEntity: "Precision Orthopaedics GmbH",
      issuer: "Hospital client", issued: c.day(-420), expires: null,
      verifiedSource: "Client-signed certificate", verificationStatus: "verified", lastVerifiedAt: c.at(-120),
      accessClass: "confidential", permittedUses: ["bid_attachment", "references"],
      performingEntityId: "SUP-DE-003", performingEntityName: "Precision Orthopaedics GmbH", hash: "sha256:6ef1…209a",
      note: "Partner performance. May only be presented as partner experience with client consent and where the tender permits reliance.",
    },
    {
      id: "DOC-010", title: "Board Resolution - Delegated Signatory Authority", class: "signatory", docType: "Board resolution",
      holderName: "Waide Mobility Limited", legalEntity: "Waide Mobility Limited",
      issuer: "Board of Directors", issued: c.day(-400), expires: c.day(330),
      verifiedSource: "Signed board minutes", verificationStatus: "pending", lastVerifiedAt: c.at(-400),
      accessClass: "confidential", permittedUses: ["signatory_evidence"], hash: "sha256:0c9d…fe44",
      note: "Does not name any AI or automated system; AI signature authority remains none.",
    },
    {
      id: "DOC-011", title: "Marine Cargo Insurance Certificate", class: "insurance", docType: "Insurance",
      holderName: "Waide Mobility Limited", legalEntity: "Waide Mobility Limited",
      issuer: "Insurer (fixture)", issued: c.day(-360), expires: c.day(19),
      verifiedSource: "Insurer confirmation", verificationStatus: "verified", lastVerifiedAt: c.at(-45),
      accessClass: "confidential", permittedUses: ["bid_attachment", "insurance_evidence"], hash: "sha256:4410…d9ba",
      note: "Cover excludes temperature-controlled medical devices in transit; check wording before relying on it.",
    },
    {
      id: "DOC-012", title: "BPP Interim Registration Report", class: "registration", docType: "Procurement registration",
      holderName: "Waide Mobility Limited", legalEntity: "Waide Mobility Limited",
      issuer: "Bureau of Public Procurement", issued: c.day(-210), expires: c.day(155),
      verifiedSource: "BPP portal", verificationStatus: "verified", lastVerifiedAt: c.at(-30),
      accessClass: "internal", permittedUses: ["bid_attachment", "registration"], hash: "sha256:e7a2…1b08",
      note: "Applicable to Nigerian federal procurement routes only; revalidate on the current portal.",
    },
    {
      id: "DOC-013", title: "Certificate of Good Standing (third-party copy)", class: "corporate_identity", docType: "Certificate",
      holderName: "Waide Mobility Ltd", rcNumber: "RC 1748293", legalEntity: "Waide Mobility Limited",
      issuer: "Unverified third-party upload", issued: c.day(-150), expires: null,
      verifiedSource: null, verificationStatus: "unverified", lastVerifiedAt: null,
      accessClass: "internal", permittedUses: ["identity"], hash: "sha256:19fd…aa70",
      note: "Holder name uses the trading name and does not match the registered legal name: identity conflict.",
    },
  ];
}

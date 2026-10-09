/* Partner-Vereinbarung (Kurzfassung, englisch = verbindlich), die der Partner bei der Registrierung per Häkchen annimmt.
 * Gespeichert werden Zeitpunkt, IP, Browser und Version (partners.terms_at / terms_ip / terms_ua / terms_v).
 * Bei JEDER inhaltlichen Änderung TERMS_VERSION erhöhen – sonst ist nicht mehr nachweisbar, welchem Text zugestimmt wurde.
 * Langfassung (für große Partner in EU/UK): Doc „Löschpartner-Vereinbarung & Kunden-Onboarding", Teil A. */

export const TERMS_VERSION = "2026-10-09.2";

export const PARTNER_AGREEMENT = {
  title: "RapidRemove Partner Agreement",
  parties:
    "Between Simple Solution. OG (RapidRemove), Salzgasse 2, 5400 Hallein, Austria, FN 470700g (“RapidRemove”) and the partner registering in the RapidRemove partner app (“Partner”).",
  sections: [
    {
      h: "1. Scope",
      text: "Partner reports reviews and business profiles on Google and similar platforms on behalf of RapidRemove’s customers, who are the owners of these profiles. Partner works as an independent contractor, not as an employee, and is responsible for their own taxes.",
    },
    {
      h: "2. Legitimate methods only",
      text: "Partner, and everyone working for Partner:",
      items: [
        "only uses the platform’s official reporting, complaint and appeal channels;",
        "only gives true information in every report and never invents policy violations, legal violations or facts;",
        "never uses fake, bought, hacked or automatically created accounts and never pretends to be another person, an authority or a platform employee;",
        "never offers or gives any benefit to platform employees;",
        "never contacts, threatens or pressures reviewers, customers or their customers;",
        "never circumvents security measures, terms of use or technical limits of a platform;",
        "complies with all applicable laws, including consumer protection, data protection and criminal law in their own country, the EU, the USA (incl. 16 CFR Part 465) and the UK (incl. DMCC Act 2024).",
      ],
    },
    {
      h: "3. No genuine violation, no report",
      text: "If Partner cannot identify a genuine violation of the platform’s policies for a review, Partner does not report it and marks the task as not possible.",
    },
    {
      h: "4. Confidentiality and data",
      text: "Partner keeps all customer and order data confidential, uses it only for the task and deletes it when it is no longer needed or on request – also after this agreement ends.",
    },
    {
      h: "5. Incidents",
      text: "Partner informs RapidRemove within 48 hours about suspensions or warnings by a platform, requests from authorities or courts, and complaints by third parties related to RapidRemove tasks.",
    },
    {
      h: "6. Payment",
      text: "Partner is paid per verified removal at the agreed price. Partner only marks a task as “Removed” when the review or profile is really gone; RapidRemove checks every removal before paying. Payouts work with self-billing invoices under the separate self-billing agreement in the payout setup.",
    },
    {
      h: "7. Indemnity",
      text: "If Partner breaches sections 2 to 5, Partner indemnifies RapidRemove and holds it harmless against all resulting claims of third parties, legal and court costs, refunds to customers and – where legally permitted – fines.",
    },
    {
      h: "8. Subcontractors",
      text: "Partner may only use subcontractors with RapidRemove’s consent (email is enough) and only if they accept the same obligations. Partner is liable for them as for their own actions.",
    },
    {
      h: "9. Term and termination",
      text: "Either party can end this agreement at any time by email. If Partner breaches sections 2 to 5, RapidRemove can suspend or end the cooperation immediately and does not pay for the affected tasks.",
    },
    {
      h: "10. Law and changes",
      text: "Austrian law applies, excluding its conflict-of-law rules and the UN Convention on Contracts for the International Sale of Goods. RapidRemove may update this agreement for future tasks; Partner will be asked to accept the new version in the partner app.",
    },
  ] as { h: string; text: string; items?: string[] }[],
};

/** Kurzüberblick über dem Häkchen (die volle Fassung ist aufklappbar). */
export const TERMS_SUMMARY = [
  "I work as an independent contractor and I’m responsible for my own taxes.",
  "I only use the platforms’ official reporting channels, only give true information and never use fake or hacked accounts.",
  "I keep all customer and order data confidential and never contact reviewers or customers.",
  "I’m paid per verified removal; if I break these rules I’m liable for the damage and the cooperation can end immediately.",
];

/** Volltext als Zeilen (für die Bestätigungsmail). */
export function agreementLines(): string[] {
  const out = [PARTNER_AGREEMENT.title + ` (version ${TERMS_VERSION})`, PARTNER_AGREEMENT.parties];
  for (const s of PARTNER_AGREEMENT.sections) {
    out.push(s.h + " – " + s.text);
    for (const [i, it] of (s.items || []).entries()) out.push(`(${String.fromCharCode(97 + i)}) ${it}`);
  }
  return out;
}

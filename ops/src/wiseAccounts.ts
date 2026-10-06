/* Wise-Empfängerkonten (Railway-Variablen, nie im Repo): WISE_BANK_DETAILS (Konto 1) und WISE_BANK_DETAILS_2 (Konto 2).
   Zeilen mit „|" oder Zeilenumbruch getrennt, z. B. „Kontoinhaber: …|IBAN: …|BIC: …|Bank: …".
   Rotation je KUNDE (fest über die E-Mail-Adresse): ein Kunde sieht in allen Mails und im Dashboard immer dasselbe
   Konto – auch bei mehreren Aufträgen, die er in einer Summe überweist. */
import crypto from "crypto";

const parse = (v: unknown) => String(v || "").split(/\r?\n|\|/).map((l) => l.trim()).filter(Boolean);
export function wiseAccounts(): string[][] {
  return [process.env.WISE_BANK_DETAILS, process.env.WISE_BANK_DETAILS_2].map(parse).filter((a) => a.length);
}
export function wiseBankFor(email?: string | null): string[] {
  const acc = wiseAccounts();
  if (!acc.length) return [];
  const key = String(email || "").trim().toLowerCase();
  const n = crypto.createHash("sha256").update(key).digest()[0];
  return acc[n % acc.length];
}

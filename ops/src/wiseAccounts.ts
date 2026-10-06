/* Wise-Empfängerkonten (Railway-Variablen, nie im Repo): WISE_BANK_DETAILS (Konto 1) und WISE_BANK_DETAILS_2 (Konto 2).
   Zeilen mit „|" oder Zeilenumbruch getrennt, z. B. „Kontoinhaber: …|IBAN: …|BIC: …|Bank: …".
   Rotation: je Auftrag fest über die Auftragsnummer (gerade → Konto 1, ungerade → Konto 2) – Mail und Dashboard zeigen dasselbe Konto. */
const parse = (v: unknown) => String(v || "").split(/\r?\n|\|/).map((l) => l.trim()).filter(Boolean);
export function wiseAccounts(): string[][] {
  return [process.env.WISE_BANK_DETAILS, process.env.WISE_BANK_DETAILS_2].map(parse).filter((a) => a.length);
}
export function wiseBankFor(orderId?: string | null): string[] {
  const acc = wiseAccounts();
  if (!acc.length) return [];
  const id = String(orderId || "");
  const n = Number(id.replace(/\D/g, "")) || [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  return acc[n % acc.length];
}

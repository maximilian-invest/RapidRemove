/*
 * setupExpressLinks.ts — CLI-Wrapper um runExpressSetup() (siehe expressSetup.ts).
 * Legt die Stripe-Express-Zahlungslinks für alle Kombinationen an. Gleiche Logik wie der
 * Admin-Button (POST /admin/setup-express) — hier nur fürs Terminal.
 *
 * NUTZUNG (Umgebung MIT Stripe-Zugriff, z. B. lokal oder Railway-Shell):
 *   STRIPE_SECRET_KEY=sk_live_… npx tsx src/setupExpressLinks.ts            # Trockenlauf
 *   STRIPE_SECRET_KEY=sk_live_… npx tsx src/setupExpressLinks.ts --apply    # legt wirklich an
 *   …  --currency=eur     # nur eine Währung
 *   …  --service=remove   # nur eine Leistung
 */
import { runExpressSetup } from "./expressSetup";

const ARGS = new Set(process.argv.slice(2));
const apply = ARGS.has("--apply");
const currency = [...ARGS].find((a) => a.startsWith("--currency="))?.split("=")[1] as ("eur" | "usd" | undefined);
const service = [...ARGS].find((a) => a.startsWith("--service="))?.split("=")[1];

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("✗ STRIPE_SECRET_KEY fehlt. Beispiel:\n  STRIPE_SECRET_KEY=sk_live_… npx tsx src/setupExpressLinks.ts --apply");
    process.exit(1);
  }
  console.log(`\n=== RapidRemove · Express-Zahlungslinks ${apply ? "ANLEGEN" : "(Trockenlauf — nichts wird verändert)"} ===\n`);
  const report = await runExpressSetup({
    apply,
    currencies: currency ? [currency] : undefined,
    services: service ? [service] : undefined,
    log: (line) => console.log(line),
  });
  console.log(`\n── Für ops/src/paymentLinks.ts → EXPRESS_PAYMENT_LINKS (Schlüssel = service|express|protection|currency) ──`);
  console.log("export const EXPRESS_PAYMENT_LINKS: Record<string, string> = {");
  for (const [k, v] of Object.entries(report.links)) console.log(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  console.log("};");
}

main().catch((e) => { console.error("\n✗ Fehler:", e?.message || e); process.exit(1); });

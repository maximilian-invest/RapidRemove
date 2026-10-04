/* Root-Layout der Fremdsprachen-Seiten (/en, /es, … inkl. Magazin + Unterseiten):
   <html lang> = Sprache aus der URL. */
import RootShell, { rootMetadata, rootViewport } from "@/components/RootShell";
import { NON_DEFAULT_LOCALES } from "@/lib/locales-meta";

export const metadata = rootMetadata;
export const viewport = rootViewport;
// Keine dynamicParams-Sperre hier: Unbekannte Pfade (/tippfehler) rendern dieses
// Layout und landen über die Seiten (dynamicParams=false) in [lang]/not-found —
// so bleibt die gebrandete 404 erhalten (eine globale app/not-found braucht ein
// einziges Root-Layout, das es mit <html lang> je Sprache nicht mehr gibt).
export function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((lang) => ({ lang }));
}

export default function LangLayout({ children, params }) {
  const lang = NON_DEFAULT_LOCALES.includes(params && params.lang) ? params.lang : "de";
  return <RootShell lang={lang}>{children}</RootShell>;
}

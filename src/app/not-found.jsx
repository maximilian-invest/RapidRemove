/* RapidRemove — globale 404-Seite (App Router not-found).
   Server-renderbar (im Export-Build wird daraus 404.html); bewusst ohne
   Client-Komponenten/Sprach-Kontext, aber als vollwertige, gebrandete Seite
   mit Kopf (Logo → Start), hilfreichen Links und Fuß — kein leerer Body. */
import Link from "next/link";
import { asset } from "@/lib/base";

export const metadata = { title: "Seite nicht gefunden — RapidRemove", robots: { index: false } };

const QUICK_LINKS = [
  { href: "/", label: "Startseite" },
  { href: "/magazin", label: "Magazin" },
  { href: "/profil-pruefen", label: "Gratis-Check" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)", color: "var(--fg)" }}>
      <header style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", height: 64 }}>
          <Link href="/" aria-label="RapidRemove — Startseite" style={{ display: "inline-flex", alignItems: "center" }}>
            <img src={asset("/assets/rapidremove-icon.png")} alt="RapidRemove" style={{ height: 30, width: "auto" }} />
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 72, lineHeight: 1, color: "var(--primary)" }}>404</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, margin: "14px 0 8px" }}>Seite nicht gefunden</h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--fg-2)", margin: "0 0 4px" }}>
            Diese Seite existiert nicht oder wurde verschoben.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--fg-muted)", margin: "0 0 24px" }}>
            This page doesn&apos;t exist or has been moved.
          </p>
          <Link href="/" style={{ display: "inline-block", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 15, padding: "12px 28px", borderRadius: 999, textDecoration: "none" }}>
            Zur Startseite · Home
          </Link>
          <div style={{ marginTop: 30, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {QUICK_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg-2)", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--hairline)", padding: "22px 0", fontSize: 13, color: "var(--fg-muted)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          © 2026 Simple Solution. OG · RapidRemove
        </div>
      </footer>
    </div>
  );
}

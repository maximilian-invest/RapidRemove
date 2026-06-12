/* RapidRemove — globale 404-Seite (App Router not-found).
   Bewusst schlank und server-renderbar; im Export-Build wird daraus 404.html. */
import Link from "next/link";

export const metadata = { title: "Seite nicht gefunden — RapidRemove" };

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px", fontFamily: "var(--font-body)", color: "var(--fg)" }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 64, lineHeight: 1, color: "var(--primary)" }}>404</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, margin: "14px 0 8px" }}>Seite nicht gefunden</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--fg-2)", margin: "0 0 6px" }}>
          Diese Seite existiert nicht oder wurde verschoben.
        </p>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--fg-muted)", margin: "0 0 22px" }}>
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" style={{ display: "inline-block", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 15, padding: "12px 26px", borderRadius: "999px", textDecoration: "none" }}>
          Zur Startseite · Home
        </Link>
      </div>
    </div>
  );
}

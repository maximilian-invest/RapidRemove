# Cutover-Plan: Alt-Site → neue Next.js-Site (P0.1)

Ziel: Beim Launch der neuen Struktur dürfen keine indexierten Alt-URLs ins Leere laufen,
Sitemap/robots müssen auf die neue Struktur zeigen, und kein Staging-Host darf indexierbar bleiben.

## 1. 301-Mapping alte Live-URLs → neue Struktur

Vorgehen:
1. **Inventar ziehen** (vor dem Launch):
   - Alte Sitemap der Live-Site sichern (`https://www.rapid-remove.com/sitemap.xml`).
   - Google Search Console → Indexierte Seiten exportieren.
   - Top-URLs aus GSC-Leistungsbericht (Klicks/Impressionen, letzte 12 Monate) exportieren.
2. **Mapping-Tabelle pflegen** (alte URL → neue URL, eine Zeile pro URL). Bekannte/abgeleitete Kandidaten:

   | Alte URL (Live) | Neue URL | Anmerkung |
   |---|---|---|
   | `/order` | `/profil-pruefen/` | „order“ steckt noch im Schema-Markup (layout.jsx) |
   | `/en/magazine` | `/en/magazin/` | bereits als Redirect in `next.config.mjs` |
   | `/es/revista` | `/es/magazin/` | bereits als Redirect |
   | `/en/about` | `/en/about-us/` | bereits als Redirect |
   | *(ergänzen nach GSC-Export)* | | |

3. **Umsetzung:** Einträge in `next.config.mjs` → `redirects()` (permanent: true = 308/301).
   Wichtig: `redirects()` greift nur im Server-Build (Railway), **nicht** im statischen
   GitHub-Pages-Export (`GITHUB_PAGES=true`) — der Launch-Host muss der Server-Build sein.
4. **Host-Konsolidierung:** `www.rapid-remove.com` vs. `rapid-remove.com` festlegen
   (metadataBase nutzt aktuell `https://www.rapid-remove.com`, das Schema-Markup teils `www.`).
   Auf Host-Ebene (Railway/DNS) eine Variante per 301 auf die kanonische umleiten und
   das Schema-Markup vereinheitlichen.

## 2. Sitemap / robots umstellen

- Neue Site liefert `app/sitemap.js` und `app/robots.js` bereits dynamisch aus —
  prüfen, dass beide nach dem Launch unter der kanonischen Domain erreichbar sind.
- In der **Google Search Console**: neue Sitemap einreichen, alte Sitemap-Property
  entfernen/aktualisieren; Bing Webmaster Tools analog.
- Prüfen, dass die Sitemap nur kanonische URLs (eine Host-Variante, mit/ohne
  Trailing-Slash konsistent) enthält und die hreflang-Alternates stimmen.

## 3. Staging-noindex nach Launch

- Der GitHub-Pages-/Staging-Build (`GITHUB_PAGES=true`, `*.github.io/RapidRemove`)
  darf nach dem Launch **nicht** indexierbar bleiben:
  - In `app/robots.js` für den Pages-Build (`process.env.GITHUB_PAGES === "true"`)
    `disallow: "/"` ausliefern, oder
  - `<meta name="robots" content="noindex">` im Pages-Build setzen (layout, env-abhängig).
- Nach dem Launch via `site:`-Abfrage prüfen, ob Staging-URLs im Index sind, und ggf.
  in der GSC einen Entfernungsantrag stellen.

## 4. Launch-Checkliste (Kurzfassung)

1. GSC-/Sitemap-Inventar exportiert und Mapping-Tabelle vollständig.
2. `redirects()` deployed, Stichproben mit `curl -I` (301/308 + korrektes Ziel).
3. Kanonischer Host erzwungen (www vs. non-www), Schema-Markup angepasst.
4. Neue Sitemap in GSC/Bing eingereicht.
5. Staging auf noindex; Live-Site auf index (kein vergessenes globales noindex!).
6. 404-Stichproben: unbekannte URLs liefern die gestaltete `not-found`-Seite, Status 404.
7. 1–2 Wochen nach Launch: GSC-Abdeckungsbericht auf 404/Soft-404-Spikes prüfen und
   Mapping-Tabelle nachziehen.

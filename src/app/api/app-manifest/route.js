/* Manifest der Kunden-App (/my-reviews am Home-Bildschirm). Mit ?k=<Login-Code> startet die App
   gleich eingeloggt – auf dem iPhone hat die Home-Bildschirm-App einen eigenen Speicher. */
export const dynamic = "force-dynamic";

export function GET(req) {
  const k = new URL(req.url).searchParams.get("k") || "";
  const ok = /^[A-Za-z0-9_-]{20,80}$/.test(k);
  const body = {
    name: "RapidRemove",
    short_name: "RapidRemove",
    start_url: ok ? `/my-reviews?k=${k}&app=1` : "/my-reviews?app=1",
    scope: "/my-reviews",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/assets/rapidremove-icon.png", sizes: "408x404", type: "image/png", purpose: "any" },
      { src: "/assets/rapidremove-icon.png", sizes: "408x404", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/manifest+json", "cache-control": "private, no-store" } });
}

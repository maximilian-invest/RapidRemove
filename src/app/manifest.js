/* Web-App-Manifest – macht das Admin-Panel als eigenständige App installierbar
   (Home-Bildschirm, Standalone) und ist Voraussetzung für Web-Push auf iOS. */
export default function manifest() {
  return {
    name: "RapidRemove Admin",
    short_name: "RR Admin",
    description: "RapidRemove – Bestellungen & Admin",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#f6f3f0",
    theme_color: "#ff8000",
    icons: [
      { src: "/assets/rapidremove-icon.png", sizes: "408x404", type: "image/png", purpose: "any" },
      { src: "/assets/rapidremove-icon.png", sizes: "408x404", type: "image/png", purpose: "maskable" },
    ],
  };
}

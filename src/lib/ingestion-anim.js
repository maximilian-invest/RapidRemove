/* RapidRemove — Ingestion-Animation (aus dem Claude-Design portiert).
   Vanilla-JS-/SVG-Animation: zeigt, wie ein geloeschtes Profil zurueckkommt
   (Crowdsourcing / KI-Generierung / Daten-Feeds). Wird in Schritt 5 gezeigt,
   wenn der Schutz deaktiviert ist.
   Aufruf: const cleanup = mountIngestionAnim(containerEl, { lang }); // nur de/en, sonst en */
  var NS = "http://www.w3.org/2000/svg";
  var STYLE_ID = "iga-style";

  var ACC = { 0: "#4285F4", 1: "#EA4335", 2: "#34A853" };

  var T = {
    de: {
      title: "So kann Ihr gelöschtes Profil zurückkommen",
      inter: ["Möglichkeit 1 von 3", "Möglichkeit 2 von 3", "Möglichkeit 3 von 3"],
      caps: [
        { h: "Möglichkeit 1 · Crowdsourcing", p: "Jede Person kann Ihr Profil über „Ort hinzufügen“ in Minuten neu anlegen — oft versehentlich sogar eigene Kunden. Googles KI prüft kurz und schaltet den Eintrag live." },
        { h: "Möglichkeit 2 · KI-Generierung", p: "Googles Crawler finden Name, Adresse und Telefonnummer auf Ihrer Website oder in Branchenverzeichnissen — und erzeugen daraus vollautomatisch ein neues, unbeanspruchtes Profil." },
        { h: "Möglichkeit 3 · Daten-Feeds", p: "Handelsregister und Behörden liefern Ihre Unternehmensdaten gesammelt direkt an Google. Ihr Profil kann so jederzeit ohne Ihr Zutun wieder erscheinen." }
      ],
      kiCheck: "KI-Prüfung", kiOk: "✓ geprüft",
      src1: "Beliebiger Nutzer · Maps-App", src3: "Handelsregister / Behörde",
      srcA: "Website", srcB: "Branchenverzeichnis",
      conf: "Konfidenz-Score: ", claimed: "Unbeansprucht", auto: "Automatisch generiert · live",
      records: " Datensätze", syncRun: "SYNC läuft …", syncOk: "✓ 4.774 live"
    },
    en: {
      title: "How your deleted profile can come back",
      inter: ["Way 1 of 3", "Way 2 of 3", "Way 3 of 3"],
      caps: [
        { h: "Way 1 · Crowdsourcing", p: "Anyone can re-create your profile in minutes via “Add a place” — often even your own customers, by accident. Google's AI checks briefly and publishes the listing." },
        { h: "Way 2 · AI generation", p: "Google's crawlers find your name, address and phone number on your website or in business directories — and automatically generate a new, unclaimed profile from them." },
        { h: "Way 3 · Data feeds", p: "Trade registries and public authorities deliver your business data in bulk directly to Google. Your profile can reappear at any time without you doing anything." }
      ],
      kiCheck: "AI check", kiOk: "✓ verified",
      src1: "Any user · Maps app", src3: "Trade registry / authority",
      srcA: "Website", srcB: "Business directory",
      conf: "Confidence score: ", claimed: "Unclaimed", auto: "Auto-generated · live",
      records: " records", syncRun: "SYNC running …", syncOk: "✓ 4,774 live"
    }
  };

  var CSS = "" +
".iga{border:1px solid var(--hairline,#e9e3dd);border-radius:var(--r-lg,20px);background:var(--white,#fff);overflow:hidden;margin-top:14px;font-family:var(--font-body,sans-serif);}" +
".iga-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;border-bottom:1px solid var(--hairline,#e9e3dd);}" +
".iga-title{font-weight:800;font-size:14px;color:var(--fg,#1c1916);display:flex;align-items:center;gap:8px;min-width:0;}" +
".iga-title svg{flex:none;}" +
".iga-dots{display:flex;gap:6px;flex:none;}" +
".iga-dots i{width:7px;height:7px;border-radius:50%;background:var(--neutral-200,#e9e3dd);transition:background 0.3s,transform 0.3s;}" +
".iga-dots i.on{transform:scale(1.3);}" +
".iga-stage{position:relative;background:var(--neutral-50,#faf8f6);}" +
".iga-stage svg{display:block;width:100%;height:auto;}" +
".iga-stage svg text{font-family:var(--font-body,sans-serif);}" +
".iga-inter{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;background:rgba(250,248,246,0.94);opacity:0;pointer-events:none;transition:opacity 0.35s ease;}" +
".iga-inter.show{opacity:1;}" +
".iga-inter .n{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:#fff;font-family:var(--font-display,sans-serif);font-weight:600;font-size:23px;}" +
".iga-inter .l{font-weight:800;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;}" +
".iga-cap{padding:12px 16px 14px;border-top:1px solid var(--hairline,#e9e3dd);}" +
".iga-cap b{display:block;font-size:13.5px;margin-bottom:3px;transition:color 0.3s;}" +
".iga-cap span{font-size:13px;line-height:1.55;color:var(--fg-2,#6b635c);}" +
".iga-hid{opacity:0;}" +
".iga-pop{transform-box:fill-box;transform-origin:center bottom;animation:igaPop 0.5s cubic-bezier(0.22,1,0.36,1) both;}" +
"@keyframes igaPop{0%{opacity:0;transform:translateY(-12px) scale(0.4);}62%{opacity:1;transform:translateY(2px) scale(1.08);}100%{opacity:1;transform:translateY(0) scale(1);}}" +
".iga-scalein{transform-box:fill-box;transform-origin:center;animation:igaScaleIn 0.5s cubic-bezier(0.22,1,0.36,1) both;}" +
"@keyframes igaScaleIn{from{opacity:0;transform:scale(0.84);}to{opacity:1;transform:scale(1);}}" +
".iga-fadein{animation:igaFade 0.4s ease both;}" +
"@keyframes igaFade{from{opacity:0;}to{opacity:1;}}" +
".iga-pulse{transform-box:fill-box;transform-origin:center;animation:igaPulse 0.45s cubic-bezier(0.22,1,0.36,1);}" +
"@keyframes igaPulse{0%{transform:scale(1);}45%{transform:scale(1.08);}100%{transform:scale(1);}}" +
".iga-ripple{transform-box:fill-box;transform-origin:center;animation:igaRipple 1.2s ease-out both;}" +
".iga-ripple.r2{animation-delay:0.3s;}" +
"@keyframes igaRipple{0%{opacity:0.55;transform:scale(0.25);}100%{opacity:0;transform:scale(1.9);}}" +
".iga-tap{transform-box:fill-box;transform-origin:center;animation:igaTap 0.75s ease-out 2 both;}" +
"@keyframes igaTap{0%{opacity:0.6;transform:scale(0.3);}100%{opacity:0;transform:scale(2);}}" +
".iga-scan{opacity:0;}" +
".iga-scan.run{opacity:1;animation:igaScan 1.4s ease-in-out 2 both;}" +
"@keyframes igaScan{0%{transform:translateY(0);}50%{transform:translateY(var(--scan-h,70px));}100%{transform:translateY(0);}}" +
".iga-ring{transform-box:fill-box;transform-origin:center;opacity:0;}" +
".iga-ring.run{animation:igaRing 1s ease-out 3 both;}" +
".iga-ring.r2.run{animation-delay:0.4s;}" +
"@keyframes igaRing{0%{opacity:0.5;transform:scale(0.9);}100%{opacity:0;transform:scale(1.5);}}" +
".iga-core.run{transform-box:fill-box;transform-origin:center;animation:igaThrob 0.85s cubic-bezier(0.22,1,0.36,1) 3;}" +
"@keyframes igaThrob{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}" +
".iga-flow{opacity:0;}" +
".iga-flow.run{opacity:1;stroke-dasharray:8 13;animation:igaDash 0.7s linear infinite;}" +
"@keyframes igaDash{to{stroke-dashoffset:-21;}}" +
".iga-glow{opacity:0;transition:opacity 0.4s ease;}" +
".iga-glow.run{opacity:0.22;}" +
".iga-fill{transition:none;}" +
".iga-fill.run{transition:width 1.8s linear;width:112px !important;}" +
"@media (prefers-reduced-motion: reduce){.iga-pop,.iga-scalein,.iga-fadein,.iga-pulse,.iga-ripple,.iga-tap,.iga-scan.run,.iga-ring.run,.iga-core.run,.iga-flow.run{animation:none !important;opacity:1;}.iga-fill.run{transition:none;}}";

  function svgMarkup(L) {
    return '' +
'<svg viewBox="0 0 720 400" role="img" aria-hidden="true">' +
'<defs>' +
'<symbol id="iga-gpin" viewBox="-16 -42 32 44"><path d="M0 0 C -8.5 -11.5 -14 -18.5 -14 -27 A 14 14 0 1 1 14 -27 C 14 -18.5 8.5 -11.5 0 0 Z" fill="#EA4335"/><circle cx="0" cy="-27" r="5.4" fill="#fff"/></symbol>' +
'<symbol id="iga-dbcyl" viewBox="0 0 48 52"><ellipse cx="24" cy="9" rx="20" ry="8" fill="#4285F4"/><path d="M4 9 v16 a20 8 0 0 0 40 0 V9" fill="#4285F4" opacity="0.82"/><path d="M4 25 v16 a20 8 0 0 0 40 0 V25" fill="#4285F4" opacity="0.6"/><ellipse cx="24" cy="9" rx="20" ry="8" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1.6"/></symbol>' +
'</defs>' +

/* ---------- Szene 1: Crowdsourcing ---------- */
'<g class="iga-scene" data-sc="0">' +
'<path data-id="s1r1" d="M150,248 C 230,185 255,170 304,166" fill="none" stroke="none"/>' +
'<path data-id="s1r2" d="M416,160 C 480,130 500,128 548,140" fill="none" stroke="none"/>' +
'<path d="M150,248 C 230,185 255,170 304,166" fill="none" stroke="var(--hairline,#e9e3dd)" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>' +
'<path d="M416,160 C 480,130 500,128 548,140" fill="none" stroke="var(--hairline,#e9e3dd)" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>' +
'<g transform="translate(64,76)">' +
'<rect x="-8" y="-8" width="106" height="206" rx="18" fill="#2e2a26"/>' +
'<rect x="0" y="0" width="90" height="190" rx="12" fill="#fff"/>' +
'<rect x="5" y="8" width="80" height="150" rx="8" fill="#eef3ec"/>' +
'<path d="M5 50 H85 M5 110 H85 M38 8 V158 M64 8 V158" stroke="#fff" stroke-width="5"/>' +
'<rect x="15" y="164" width="60" height="24" rx="12" fill="#4285F4"/>' +
'<text x="45" y="181.5" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">+</text>' +
'<circle data-id="s1tap" class="iga-hid" cx="45" cy="176" r="16" fill="none" stroke="#4285F4" stroke-width="2.5"/>' +
'</g>' +
'<text x="109" y="296" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--fg,#1c1916)">' + L.src1 + '</text>' +
'<g data-id="s1db"><rect x="312" y="118" width="96" height="96" rx="24" fill="#fff" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5" filter="drop-shadow(0 6px 14px rgba(28,25,22,0.10))"/><use href="#iga-dbcyl" x="336" y="140" width="48" height="52"/></g>' +
'<g data-id="s1prog" class="iga-hid">' +
'<rect x="304" y="238" width="112" height="8" rx="4" fill="var(--neutral-100,#f4f0ec)"/>' +
'<rect data-id="s1fill" class="iga-fill" x="304" y="238" height="8" rx="4" fill="#4285F4" style="width:0px"/>' +
'<text data-id="s1plabel" x="360" y="264" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--fg-2,#6b635c)">' + L.kiCheck + '</text>' +
'</g>' +
'<g transform="translate(540,86)">' +
'<rect x="0" y="0" width="160" height="168" rx="14" fill="#eef3ec" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5"/>' +
'<path d="M0 52 H160 M0 116 H160 M52 0 V168 M112 0 V168" stroke="#fff" stroke-width="6"/>' +
'<rect x="64" y="62" width="40" height="44" rx="5" fill="#dcead6"/>' +
'<circle data-id="s1rip1" class="iga-hid" cx="84" cy="92" r="18" fill="none" stroke="#EA4335" stroke-width="2.5"/>' +
'<circle data-id="s1rip2" class="iga-hid r2" cx="84" cy="92" r="18" fill="none" stroke="#EA4335" stroke-width="2.5"/>' +
'<use data-id="s1pin" class="iga-hid" href="#iga-gpin" x="72" y="59" width="24" height="33"/>' +
'</g>' +
'</g>' +

/* ---------- Szene 2: KI-Generierung ---------- */
'<g class="iga-scene" data-sc="1" style="display:none">' +
'<path data-id="s2ra" d="M200,130 C 270,150 290,152 320,160" fill="none" stroke="none"/>' +
'<path data-id="s2rb" d="M200,252 C 270,230 290,200 322,180" fill="none" stroke="none"/>' +
'<path data-id="s2rc" d="M400,168 C 460,160 490,150 544,150" fill="none" stroke="none"/>' +
'<path d="M200,130 C 270,150 290,152 320,160" fill="none" stroke="var(--hairline,#e9e3dd)" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>' +
'<path d="M200,252 C 270,230 290,200 322,180" fill="none" stroke="var(--hairline,#e9e3dd)" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>' +
'<path d="M400,168 C 460,160 490,150 544,150" fill="none" stroke="var(--hairline,#e9e3dd)" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>' +
'<g transform="translate(44,64)">' +
'<rect x="0" y="0" width="152" height="108" rx="12" fill="#fff" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5" filter="drop-shadow(0 4px 10px rgba(28,25,22,0.07))"/>' +
'<rect x="0" y="0" width="152" height="22" rx="12" fill="var(--neutral-100,#f4f0ec)"/><rect x="0" y="11" width="152" height="11" fill="var(--neutral-100,#f4f0ec)"/>' +
'<circle cx="12" cy="11" r="2.8" fill="#EA4335"/><circle cx="22" cy="11" r="2.8" fill="#FBBC04"/><circle cx="32" cy="11" r="2.8" fill="#34A853"/>' +
'<rect x="12" y="34" width="86" height="8" rx="4" fill="var(--neutral-300,#d6cec6)"/>' +
'<rect x="12" y="50" width="118" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<rect x="12" y="63" width="100" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<rect x="12" y="76" width="70" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<line data-id="s2scanA" class="iga-scan" style="--scan-h:72px" x1="6" y1="26" x2="146" y2="26" stroke="#EA4335" stroke-width="2.2" stroke-linecap="round"/>' +
'</g>' +
'<text x="120" y="190" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--fg,#1c1916)">' + L.srcA + '</text>' +
'<g transform="translate(44,206)">' +
'<rect x="0" y="0" width="152" height="100" rx="12" fill="#fff" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5" filter="drop-shadow(0 4px 10px rgba(28,25,22,0.07))"/>' +
'<circle cx="26" cy="30" r="14" fill="var(--neutral-100,#f4f0ec)"/>' +
'<circle cx="26" cy="26" r="5" fill="var(--neutral-300,#d6cec6)"/><path d="M16 38 a10 7 0 0 1 20 0" fill="var(--neutral-300,#d6cec6)"/>' +
'<rect x="48" y="22" width="70" height="8" rx="4" fill="var(--neutral-300,#d6cec6)"/>' +
'<rect x="48" y="38" width="50" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<rect x="12" y="62" width="110" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<rect x="12" y="76" width="90" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<line data-id="s2scanB" class="iga-scan" style="--scan-h:66px" x1="6" y1="14" x2="146" y2="14" stroke="#EA4335" stroke-width="2.2" stroke-linecap="round"/>' +
'</g>' +
'<text x="120" y="326" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--fg,#1c1916)">' + L.srcB + '</text>' +
'<g>' +
'<circle data-id="s2ring1" class="iga-ring" cx="360" cy="168" r="46" fill="none" stroke="#EA4335" stroke-width="2.2"/>' +
'<circle data-id="s2ring2" class="iga-ring r2" cx="360" cy="168" r="46" fill="none" stroke="#FBBC04" stroke-width="2.2"/>' +
'<g data-id="s2core" class="iga-core">' +
'<circle cx="360" cy="168" r="38" fill="#fff" filter="drop-shadow(0 6px 14px rgba(28,25,22,0.10))"/>' +
'<circle cx="360" cy="168" r="38" fill="none" stroke="#4285F4" stroke-width="3.5" stroke-dasharray="59.69 179.07" stroke-dashoffset="0" stroke-linecap="round"/>' +
'<circle cx="360" cy="168" r="38" fill="none" stroke="#EA4335" stroke-width="3.5" stroke-dasharray="59.69 179.07" stroke-dashoffset="-59.69" stroke-linecap="round"/>' +
'<circle cx="360" cy="168" r="38" fill="none" stroke="#FBBC04" stroke-width="3.5" stroke-dasharray="59.69 179.07" stroke-dashoffset="-119.38" stroke-linecap="round"/>' +
'<circle cx="360" cy="168" r="38" fill="none" stroke="#34A853" stroke-width="3.5" stroke-dasharray="59.69 179.07" stroke-dashoffset="-179.07" stroke-linecap="round"/>' +
'<path d="M360 150 l4.5 11.5 11.5 4.5 -11.5 4.5 -4.5 11.5 -4.5 -11.5 -11.5 -4.5 11.5 -4.5 Z" fill="#4285F4"/>' +
'</g>' +
'<text data-id="s2conf" class="iga-hid" x="360" y="232" text-anchor="middle" font-size="12" font-weight="800" fill="#34A853">' + L.conf + '0,00</text>' +
'</g>' +
'<g transform="translate(540,70)"><g data-id="s2card" class="iga-hid">' +
'<rect x="0" y="0" width="164" height="200" rx="14" fill="#fff" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5" filter="drop-shadow(0 8px 18px rgba(28,25,22,0.12))"/>' +
'<rect x="0" y="0" width="164" height="52" rx="14" fill="#eef3ec"/><rect x="0" y="26" width="164" height="26" fill="#eef3ec"/>' +
'<path d="M0 34 H164 M92 0 V52" stroke="#fff" stroke-width="5"/>' +
'<use href="#iga-gpin" x="71" y="12" width="22" height="30"/>' +
'<rect x="14" y="66" width="84" height="9" rx="4.5" fill="var(--neutral-300,#d6cec6)"/>' +
'<rect x="14" y="84" width="120" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<rect x="14" y="97" width="98" height="7" rx="3.5" fill="var(--neutral-100,#f4f0ec)"/>' +
'<line x1="14" y1="116" x2="150" y2="116" stroke="var(--hairline,#e9e3dd)"/>' +
'<rect x="14" y="128" width="104" height="20" rx="10" fill="#fff4e0"/>' +
'<text x="66" y="141.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#b45309">' + L.claimed + '</text>' +
'<text x="14" y="170" font-size="9.5" font-weight="700" fill="#34A853">' + L.auto + '</text>' +
'</g></g>' +
'</g>' +

/* ---------- Szene 3: Daten-Feeds ---------- */
'<g class="iga-scene" data-sc="2" style="display:none">' +
'<path data-id="s3r1" d="M204,150 C 250,152 270,158 308,162" fill="none" stroke="none"/>' +
'<path data-id="s3r2" d="M416,150 C 470,120 500,112 544,122" fill="none" stroke="none"/>' +
'<path d="M416,150 C 470,120 500,112 544,122" fill="none" stroke="var(--hairline,#e9e3dd)" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>' +
'<path data-id="s3glow" class="iga-glow" d="M204,150 C 250,152 270,158 308,162" fill="none" stroke="#34A853" stroke-width="14" stroke-linecap="round"/>' +
'<path data-id="s3flow" class="iga-flow" d="M204,150 C 250,152 270,158 308,162" fill="none" stroke="#34A853" stroke-width="3.5" stroke-linecap="round"/>' +
'<g transform="translate(48,84)">' +
'<rect x="0" y="0" width="152" height="132" rx="14" fill="#fff" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5" filter="drop-shadow(0 4px 10px rgba(28,25,22,0.07))"/>' +
'<g transform="translate(30,22)">' +
'<path d="M46 0 L92 24 H0 Z" fill="var(--neutral-200,#e9e3dd)"/>' +
'<path d="M46 7 L80 24 H12 Z" fill="#fff"/>' +
'<circle cx="46" cy="17" r="3.5" fill="#34A853"/>' +
'<rect x="2" y="24" width="88" height="6" fill="var(--neutral-300,#d6cec6)"/>' +
'<rect x="8" y="30" width="8" height="44" fill="var(--neutral-200,#e9e3dd)"/>' +
'<rect x="28" y="30" width="8" height="44" fill="var(--neutral-200,#e9e3dd)"/>' +
'<rect x="50" y="30" width="8" height="44" fill="var(--neutral-200,#e9e3dd)"/>' +
'<rect x="72" y="30" width="8" height="44" fill="var(--neutral-200,#e9e3dd)"/>' +
'<rect x="-2" y="74" width="96" height="6" fill="var(--neutral-300,#d6cec6)"/>' +
'<rect x="-6" y="80" width="104" height="6" fill="var(--neutral-200,#e9e3dd)"/>' +
'</g>' +
'</g>' +
'<text x="124" y="240" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--fg,#1c1916)">' + L.src3 + '</text>' +
'<text data-id="s3count" class="iga-hid" x="256" y="126" text-anchor="middle" font-size="12.5" font-weight="800" fill="#34A853"></text>' +
'<g data-id="s3db"><rect x="312" y="118" width="96" height="96" rx="24" fill="#fff" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5" filter="drop-shadow(0 6px 14px rgba(28,25,22,0.10))"/><use href="#iga-dbcyl" x="336" y="140" width="48" height="52"/></g>' +
'<g data-id="s3sync" class="iga-hid">' +
'<rect x="296" y="240" width="128" height="24" rx="12" fill="#1a1512"/>' +
'<text data-id="s3synct" x="360" y="256" text-anchor="middle" font-size="10.5" font-weight="700" fill="#7ee2a1" font-family="var(--font-mono,monospace)">' + L.syncRun + '</text>' +
'</g>' +
'<g transform="translate(540,70)">' +
'<rect x="0" y="0" width="164" height="200" rx="14" fill="#eef3ec" stroke="var(--hairline,#e9e3dd)" stroke-width="1.5"/>' +
'<path d="M0 50 H164 M0 105 H164 M0 155 H164 M45 0 V200 M92 0 V200 M130 0 V200" stroke="#fff" stroke-width="5"/>' +
'<g data-id="s3dots" fill="#34A853">' +
'<circle class="iga-hid" cx="26" cy="28" r="5.5"/><circle class="iga-hid" cx="112" cy="24" r="5.5"/>' +
'<circle class="iga-hid" cx="66" cy="72" r="5.5"/><circle class="iga-hid" cx="146" cy="80" r="5.5"/>' +
'<circle class="iga-hid" cx="28" cy="128" r="5.5"/><circle class="iga-hid" cx="108" cy="130" r="5.5"/>' +
'<circle class="iga-hid" cx="70" cy="178" r="5.5"/><circle class="iga-hid" cx="142" cy="172" r="5.5"/>' +
'</g>' +
'</g>' +
'</g>' +

'<g data-id="particles"></g>' +
'</svg>';
  }

  function buildHTML(L) {
    return '' +
'<div class="iga">' +
'<div class="iga-head">' +
'<span class="iga-title">' +
'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e23b3b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 4 3 9 8 9"></polyline></svg>' +
L.title + '</span>' +
'<span class="iga-dots"><i></i><i></i><i></i></span>' +
'</div>' +
'<div class="iga-stage">' + svgMarkup(L) +
'<div class="iga-inter"><span class="n">1</span><span class="l"></span></div>' +
'</div>' +
'<div class="iga-cap"><b></b><span></span></div>' +
'</div>';
  }

export function mountIngestionAnim(container, opts) {
    opts = opts || {};
    var L = T[opts.lang === "en" ? "en" : "de"];

    if (!document.getElementById(STYLE_ID)) {
      var st = document.createElement("style");
      st.id = STYLE_ID;
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    container.innerHTML = buildHTML(L);
    var root = container.firstElementChild;
    var q = function (id) { return root.querySelector('[data-id="' + id + '"]'); };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var timers = [];
    var token = 0;
    var alive = true;
    function sched(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function schedInt(ms, fn) { var id = setInterval(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function fly(pathId, o) {
      var path = q(pathId), len = path.getTotalLength(), my = token;
      var el = document.createElementNS(NS, "circle");
      el.setAttribute("r", o.r || 5);
      el.setAttribute("fill", o.color || "#4285F4");
      el.setAttribute("opacity", "0");
      q("particles").appendChild(el);
      var t0 = performance.now(), dur = o.dur || 900;
      (function tick(now) {
        if (my !== token || !alive) { el.remove(); return; }
        var p = (performance.now() - t0) / dur;
        if (p >= 1) { el.remove(); if (o.onDone) o.onDone(); return; }
        var pt = path.getPointAtLength(ease(Math.max(p, 0)) * len);
        el.setAttribute("cx", pt.x); el.setAttribute("cy", pt.y);
        el.setAttribute("opacity", p < 0.1 ? p / 0.1 : (p > 0.9 ? (1 - p) / 0.1 : 1));
        requestAnimationFrame(tick);
      })(t0);
    }

    function flyChip(pathId, letter, color, dur, onDone) {
      var path = q(pathId), len = path.getTotalLength(), my = token;
      var g = document.createElementNS(NS, "g");
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("r", 11); c.setAttribute("fill", color);
      var t = document.createElementNS(NS, "text");
      t.setAttribute("text-anchor", "middle"); t.setAttribute("y", 4);
      t.setAttribute("font-size", "11.5"); t.setAttribute("font-weight", "800");
      t.setAttribute("fill", "#fff"); t.textContent = letter;
      g.appendChild(c); g.appendChild(t);
      g.setAttribute("opacity", "0");
      q("particles").appendChild(g);
      var t0 = performance.now();
      (function tick() {
        if (my !== token || !alive) { g.remove(); return; }
        var p = (performance.now() - t0) / dur;
        if (p >= 1) { g.remove(); if (onDone) onDone(); return; }
        var pt = path.getPointAtLength(ease(Math.max(p, 0)) * len);
        g.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ")");
        g.setAttribute("opacity", p < 0.1 ? p / 0.1 : (p > 0.9 ? (1 - p) / 0.1 : 1));
        requestAnimationFrame(tick);
      })();
    }

    function restart(el, cls) {
      el.classList.remove(cls, "iga-hid");
      void el.getBoundingClientRect();
      el.classList.add(cls);
    }
    function pulse(el) {
      el.classList.remove("iga-pulse");
      void el.getBoundingClientRect();
      el.classList.add("iga-pulse");
    }

    var dots = root.querySelectorAll(".iga-dots i");
    var inter = root.querySelector(".iga-inter");
    var interN = inter.querySelector(".n");
    var interL = inter.querySelector(".l");
    var capB = root.querySelector(".iga-cap b");
    var capS = root.querySelector(".iga-cap span");

    function resetScenes() {
      clearTimers();
      token++;
      q("particles").innerHTML = "";
      // S1
      ["s1tap", "s1prog", "s1pin", "s1rip1", "s1rip2"].forEach(function (id) {
        var el = q(id);
        el.classList.remove("iga-tap", "iga-pop", "iga-ripple", "iga-fadein");
        el.classList.add("iga-hid");
      });
      var f = q("s1fill");
      f.classList.remove("run");
      f.style.width = "0px";
      q("s1plabel").textContent = L.kiCheck;
      q("s1plabel").setAttribute("fill", "var(--fg-2,#6b635c)");
      // S2
      ["s2scanA", "s2scanB", "s2ring1", "s2ring2", "s2core"].forEach(function (id) { q(id).classList.remove("run"); });
      q("s2conf").classList.add("iga-hid");
      q("s2conf").textContent = L.conf + (opts.lang === "en" ? "0.00" : "0,00");
      q("s2card").classList.remove("iga-scalein");
      q("s2card").classList.add("iga-hid");
      // S3
      q("s3flow").classList.remove("run");
      q("s3glow").classList.remove("run");
      q("s3count").classList.add("iga-hid");
      q("s3sync").classList.add("iga-hid");
      q("s3synct").textContent = L.syncRun;
      root.querySelectorAll('[data-id="s3dots"] circle').forEach(function (c) {
        c.classList.remove("iga-pop"); c.classList.add("iga-hid");
      });
      inter.classList.remove("show");
    }

    /* ---- Szenen-Timelines (Start nach Interstitial) ---- */
    function sc1() {
      sched(200, function () { restart(q("s1tap"), "iga-tap"); });
      sched(600, function () {
        fly("s1r1", { color: "#4285F4", r: 6, dur: 1000, onDone: function () { pulse(q("s1db")); } });
      });
      sched(1700, function () {
        var prog = q("s1prog");
        prog.classList.remove("iga-hid");
        restart(prog, "iga-fadein");
        requestAnimationFrame(function () { q("s1fill").classList.add("run"); });
      });
      sched(3600, function () {
        q("s1plabel").textContent = L.kiOk;
        q("s1plabel").setAttribute("fill", "#16a34a");
      });
      sched(3900, function () { fly("s1r2", { color: "#34A853", r: 6, dur: 850 }); });
      sched(4800, function () {
        restart(q("s1pin"), "iga-pop");
        restart(q("s1rip1"), "iga-ripple");
        var r2 = q("s1rip2");
        r2.classList.remove("iga-hid", "iga-ripple");
        void r2.getBoundingClientRect();
        r2.classList.add("iga-ripple");
      });
      sched(6300, next);
    }

    function sc2() {
      sched(150, function () {
        q("s2scanA").classList.add("run");
        q("s2scanB").classList.add("run");
      });
      [[500, "s2ra", "N", "#4285F4"], [850, "s2ra", "A", "#EA4335"], [1200, "s2ra", "P", "#FBBC04"],
       [1650, "s2rb", "A", "#EA4335"], [2000, "s2rb", "P", "#FBBC04"]].forEach(function (c) {
        sched(c[0], function () { flyChip(c[1], c[2], c[3], 950, function () { pulse(q("s2core")); }); });
      });
      sched(3100, function () {
        q("s2ring1").classList.add("run");
        q("s2ring2").classList.add("run");
        q("s2core").classList.add("run");
        q("s2conf").classList.remove("iga-hid");
        var my = token, t0 = performance.now(), dur = 1600;
        (function count() {
          if (my !== token || !alive) return;
          var p = Math.min((performance.now() - t0) / dur, 1);
          var v = (ease(p) * 0.93).toFixed(2);
          if (opts.lang !== "en") v = v.replace(".", ",");
          q("s2conf").textContent = L.conf + v;
          if (p < 1) requestAnimationFrame(count);
        })();
      });
      sched(4900, function () { fly("s2rc", { color: "#34A853", r: 6, dur: 800 }); });
      sched(5750, function () {
        var card = q("s2card");
        card.classList.remove("iga-hid");
        restart(card, "iga-scalein");
      });
      sched(7300, next);
    }

    function sc3() {
      sched(200, function () {
        q("s3sync").classList.remove("iga-hid");
        q("s3count").classList.remove("iga-hid");
        q("s3count").textContent = "+0" + L.records;
      });
      sched(450, function () {
        q("s3glow").classList.add("run");
        q("s3flow").classList.add("run");
        var n = 0;
        var id = schedInt(120, function () {
          n++;
          if (n > 18) { clearInterval(id); return; }
          fly("s3r1", {
            color: "#34A853", r: 2.5 + Math.random() * 2.5,
            dur: 650 + Math.random() * 250,
            onDone: n % 5 === 0 ? function () { pulse(q("s3db")); } : null
          });
        });
        var my = token, t0 = performance.now(), dur = 2200;
        (function count() {
          if (my !== token || !alive) return;
          var p = Math.min((performance.now() - t0) / dur, 1);
          var v = Math.round(ease(p) * 4812);
          var str = v.toLocaleString(opts.lang === "en" ? "en-US" : "de-DE");
          q("s3count").textContent = "+" + str + L.records;
          if (p < 1) requestAnimationFrame(count);
        })();
      });
      sched(2900, function () {
        q("s3flow").classList.remove("run");
        q("s3glow").classList.remove("run");
        q("s3synct").textContent = L.syncOk;
      });
      sched(3000, function () {
        for (var i = 0; i < 3; i++) {
          (function (i) { sched(i * 200, function () { fly("s3r2", { color: "#34A853", r: 5, dur: 750 }); }); })(i);
        }
      });
      sched(3700, function () {
        root.querySelectorAll('[data-id="s3dots"] circle').forEach(function (c, i) {
          sched(i * 150, function () { restart(c, "iga-pop"); });
        });
      });
      sched(6200, next);
    }

    var SCENES = [sc1, sc2, sc3];
    var cur = 0;

    function next() { play((cur + 1) % 3); }

    function play(i) {
      if (!alive) return;
      resetScenes();
      cur = i;
      root.querySelectorAll(".iga-scene").forEach(function (g) {
        g.style.display = g.getAttribute("data-sc") == i ? "" : "none";
      });
      dots.forEach(function (d, j) {
        d.classList.toggle("on", j === i);
        d.style.background = j === i ? ACC[i] : "";
      });
      capB.textContent = L.caps[i].h;
      capB.style.color = ACC[i];
      capS.textContent = L.caps[i].p;
      interN.textContent = i + 1;
      interN.style.background = ACC[i];
      interL.textContent = L.inter[i];
      interL.style.color = ACC[i];
      requestAnimationFrame(function () { inter.classList.add("show"); });
      sched(reduced ? 600 : 1400, function () {
        inter.classList.remove("show");
        SCENES[i]();
      });
    }

    play(0);

    return function cleanup() {
      alive = false;
      clearTimers();
      token++;
      container.innerHTML = "";
    };
  }

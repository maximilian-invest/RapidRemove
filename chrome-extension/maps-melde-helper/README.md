# RapidRemove Maps Melde-Helper

Chrome-Extension zur Automatisierung der Google Maps "Existiert nicht"-Meldung für den RapidRemove Admin-Workflow.

**Unterstützte Sprachen:** Englisch, Deutsch

## Funktionsweise

Die Extension automatisiert den legalen "Änderung vorschlagen"-Flow in Google Maps:

1. Öffnet "Suggest an edit" / "Änderung vorschlagen" im Google Maps Profil
2. Wählt "Place is closed or not here" / "Geschlossen oder nicht vorhanden"
3. Wählt "Doesn't exist here" / "Never existed" / "Existiert nicht"
4. Füllt einen optionalen Grund-Text aus
5. **Zeigt einen Bestätigungsdialog** ("Meldung absenden?")
6. Erst nach Bestätigung wird "Submit" / "Senden" geklickt

**Wichtig:** Der finale Submit erfolgt nur nach manueller Bestätigung. Dies ist ein legaler Suggest-Edit-Flow, keine Automatisierung von Reviews oder CAPTCHA-Umgehung.

## 🧪 Testmodus

Der **Testmodus** ermöglicht sicheres Testen auf beliebigen Profilen:

- Stoppt **vor** dem finalen Submit
- Zeigt einen Erfolgs-Dialog ohne "Absenden"-Option
- Kein Profil wird tatsächlich gemeldet
- Perfekt zum Verifizieren der UI-Selektoren

### Testmodus aktivieren:
- **Popup:** Toggle "🧪 Testmodus" einschalten
- **URL-Parameter:** `&rr_test=1` hinzufügen
- **Konsole:** `window.rrStartReport('grund', 'order-id', true)`

## Installation (Chrome)

1. Öffne Chrome und navigiere zu `chrome://extensions/`
2. Aktiviere oben rechts den **Entwicklermodus**
3. Klicke auf **Entpackte Erweiterung laden**
4. Wähle den Ordner `chrome-extension/maps-melde-helper`
5. Die Extension erscheint in der Toolbar

## Verwendung

### Methode 1: Popup (manuell)

1. Öffne ein Google Maps Unternehmensprofil
2. Klicke auf das Extension-Icon in der Toolbar
3. Optional: Aktiviere den Testmodus
4. Optional: Gib einen Grund und Auftrags-ID ein
5. Klicke "Meldung starten" bzw. "🧪 Test starten"
6. Im Echtmodus: Bestätige im Dialog mit "Ja, absenden"

### Methode 2: URL-Parameter (vom Admin aus)

Füge diese Parameter an die Google Maps URL an:

```
?rr_melden=1&rr_reason=GRUND&rr_order=AUFTRAGS-ID&rr_test=1
```

**Beispiele:**

Echtmodus:
```
https://www.google.com/maps/place/...?rr_melden=1&rr_reason=Firma+existiert+nicht+mehr&rr_order=RR-12345
```

Testmodus:
```
https://www.google.com/maps/place/...?rr_melden=1&rr_reason=Test&rr_test=1
```

### Methode 3: Konsolen-Befehl (Debug)

In der Browser-Konsole (F12):

```javascript
// Echtmodus
window.rrStartReport('Firma existiert nicht mehr', 'RR-12345', false);

// Testmodus
window.rrStartReport('Test', 'RR-TEST', true);

// Debug: Alle sichtbaren Buttons anzeigen
window.rrDebugButtons();
```

## Sprachunterstützung

Die Extension erkennt automatisch die UI-Sprache anhand von Text-Patterns:

| Schritt | Englisch | Deutsch |
|---------|----------|---------|
| Dialog öffnen | "Suggest an edit" | "Änderung vorschlagen" |
| Option 1 | "Place is closed or not here" | "Geschlossen oder nicht vorhanden" |
| Option 2 | "Doesn't exist here" / "Never existed" | "Existiert nicht" |
| Absenden | "Submit" / "Send" | "Senden" |

Die Text-Patterns sind in `selectors.js` unter `TEXT_PATTERNS` definiert.

## Integration ins RapidRemove Admin

### Option A: Deep-Link Button

```javascript
function openMeldeLink(order, testMode = false) {
  const mapsUrl = order.mapsUri;
  const reason = encodeURIComponent('Profil existiert nicht mehr');
  const orderId = encodeURIComponent(order.id);
  const test = testMode ? '&rr_test=1' : '';
  
  const meldeUrl = `${mapsUrl}${mapsUrl.includes('?') ? '&' : '?'}rr_melden=1&rr_reason=${reason}&rr_order=${orderId}${test}`;
  
  window.open(meldeUrl, '_blank');
}
```

### Option B: Beispiel-Integration in OrdersScreens.jsx

Der "Melden"-Button ist bereits in `OrderInfoScreen` integriert:

```jsx
{o.mapsUri ? (
  <a 
    className="ir" 
    href={`${o.mapsUri}?rr_melden=1&rr_reason=...&rr_order=${o.id}`}
    target="_blank"
  >
    <Flag /> Als „existiert nicht" melden
  </a>
) : null}
```

## Bekannte Einschränkungen

### Google Maps UI kann sich ändern

Google Maps ist eine Single-Page-Application und ändert regelmäßig ihre Oberfläche.

**Wenn die Extension nicht funktioniert:**

1. Öffne die Browser-Konsole (F12)
2. Suche nach `[RR-MeldeHelper]` Logs
3. Nutze `window.rrDebugButtons()` um alle sichtbaren Buttons aufzulisten
4. Aktualisiere die Patterns in `selectors.js`

### So findest du die richtigen Selektoren

1. Öffne ein Google Maps Profil
2. Öffne Chrome DevTools (F12)
3. Klicke manuell durch den "Suggest an edit"-Flow
4. Inspiziere jedes Element und notiere:
   - Den **exakten Text** (für `TEXT_PATTERNS`)
   - `aria-label` Attribute
   - `data-value` Attribute
5. Aktualisiere `selectors.js`

### Struktur von selectors.js

```javascript
// Text-Patterns für verschiedene Sprachen
const TEXT_PATTERNS = {
  suggestEdit: ['suggest an edit', 'änderung vorschlagen'],
  closedOrNotHere: ['place is closed or not here', 'geschlossen oder nicht vorhanden'],
  doesntExist: ["doesn't exist here", 'never existed', 'existiert nicht'],
  submit: ['submit', 'send', 'senden'],
  // ...
};

// CSS-Selektoren (strukturell, sprachunabhängig wenn möglich)
const SELECTORS = {
  suggestEditButton: ['button[aria-label*="Suggest" i]', ...],
  // ...
};
```

## Dateien

```
maps-melde-helper/
├── manifest.json      # Extension-Konfiguration (Manifest V3)
├── background.js      # Service Worker
├── content.js         # Hauptlogik (injiziert in Maps)
├── selectors.js       # UI-Selektoren + Text-Patterns (HIER ANPASSEN!)
├── styles.css         # Dialog-Styles
├── popup.html         # Popup-UI mit Testmodus-Toggle
├── popup.js           # Popup-Logik
├── icons/             # Extension-Icons
└── README.md          # Diese Datei
```

## Sicherheitshinweise

- Die Extension funktioniert nur mit dem bereits in Chrome angemeldeten Google-Konto
- Keine Speicherung von Anmeldedaten
- Keine Netzwerkanfragen außer zu Google Maps
- Alle Aktionen sind im Suggest-Edit-Flow von Google Maps sichtbar
- Der finale Submit erfordert immer manuelle Bestätigung (außer im Testmodus, wo gar nicht submitted wird)

## Fehlerbehebung

### "Button nicht gefunden"

1. Ist ein Google Maps Profil geöffnet (nicht nur die Karte)?
2. Ist das Profil vollständig geladen?
3. Welche Sprache hat deine Maps-UI? (EN/DE werden unterstützt)
4. Nutze `window.rrDebugButtons()` in der Konsole
5. Sind die Text-Patterns in `selectors.js` aktuell?

### Dialog erscheint nicht

1. Prüfe ob der Content-Script geladen wurde (Konsole: `[RR-MeldeHelper] Maps Melde-Helper initialisiert`)
2. Versuche die Seite neu zu laden
3. Prüfe ob die Extension aktiviert ist

### Testmodus zum Debuggen

Aktiviere den Testmodus um den Flow sicher zu testen ohne etwas zu melden:
- Der Flow läuft komplett durch
- Stoppt vor dem Submit
- Zeigt welche Schritte erfolgreich waren

## Lizenz

Intern für RapidRemove. Nicht zur Veröffentlichung im Chrome Web Store vorgesehen.

## Änderungshistorie

- **v1.1.0** (Oktober 2026): 
  - Englisch + Deutsch Support
  - Testmodus (stoppt vor Submit)
  - Verbesserte Text-Pattern-Erkennung
  - Debug-Funktion `rrDebugButtons()`
  
- **v1.0.0** (Oktober 2026): Initiale Version

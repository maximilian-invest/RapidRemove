# RapidRemove Maps Melde-Helper

Chrome-Extension zur Automatisierung der Google Maps "Existiert nicht"-Meldung für den RapidRemove Admin-Workflow.

## Funktionsweise

Die Extension automatisiert den legalen "Änderung vorschlagen"-Flow in Google Maps:

1. Öffnet "Änderung vorschlagen" im Google Maps Profil
2. Wählt "Geschlossen oder nicht vorhanden"
3. Wählt "Existiert nicht"
4. Füllt einen optionalen Grund-Text aus
5. **Zeigt einen Bestätigungsdialog** ("Meldung absenden?")
6. Erst nach Bestätigung wird "Senden" geklickt

**Wichtig:** Der finale Submit erfolgt nur nach manueller Bestätigung. Dies ist ein legaler Suggest-Edit-Flow, keine Automatisierung von Reviews oder CAPTCHA-Umgehung.

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
3. Optional: Gib einen Grund und Auftrags-ID ein
4. Klicke "Meldung starten"
5. Bestätige im Dialog mit "Ja, absenden"

### Methode 2: URL-Parameter (vom Admin aus)

Füge diese Parameter an die Google Maps URL an:

```
?rr_melden=1&rr_reason=GRUND&rr_order=AUFTRAGS-ID
```

**Beispiel:**
```
https://www.google.com/maps/place/...?rr_melden=1&rr_reason=Firma+existiert+nicht+mehr&rr_order=RR-12345
```

Wenn die Seite mit diesen Parametern geladen wird, startet die Extension automatisch den Melde-Flow (nach 3 Sekunden Wartezeit für das Laden der Seite).

### Methode 3: Konsolen-Befehl (Debug)

In der Browser-Konsole (F12):

```javascript
window.rrStartReport('Firma existiert nicht mehr', 'RR-12345');
```

## Integration ins RapidRemove Admin

### Option A: Deep-Link Button

Füge im Admin bei Profil-Aufträgen einen "Melden"-Button hinzu, der einen Link wie diesen öffnet:

```javascript
// Beispiel: Button-Handler im Admin
function openMeldeLink(order) {
  const mapsUrl = order.mapsUri; // z.B. https://www.google.com/maps/place/...
  const reason = encodeURIComponent('Profil existiert nicht mehr');
  const orderId = encodeURIComponent(order.id);
  
  const meldeUrl = `${mapsUrl}${mapsUrl.includes('?') ? '&' : '?'}rr_melden=1&rr_reason=${reason}&rr_order=${orderId}`;
  
  window.open(meldeUrl, '_blank');
}
```

### Option B: Beispiel-Integration in OrdersScreens.jsx

```jsx
// In OrderInfoScreen oder OrderDetail
{!isRev && o.mapsUri && (
  <a 
    className="ir" 
    href={`${o.mapsUri}${o.mapsUri.includes('?') ? '&' : '?'}rr_melden=1&rr_reason=${encodeURIComponent('Profil existiert nicht')}&rr_order=${encodeURIComponent(o.id)}`}
    target="_blank" 
    rel="noopener noreferrer"
  >
    <span className="ico"><Flag /></span>
    <span className="t">
      <span>Melden</span>
      <b>Als "existiert nicht" melden</b>
    </span>
    <ChevronRight />
  </a>
)}
```

## Bekannte Einschränkungen

### Google Maps UI kann sich ändern

Google Maps ist eine Single-Page-Application und ändert regelmäßig ihre Oberfläche. Die Extension verwendet CSS-Selektoren und Text-Matching, um die UI-Elemente zu finden.

**Wenn die Extension nicht funktioniert:**

1. Prüfe die Browser-Konsole (F12) auf Fehlermeldungen mit `[RR-MeldeHelper]`
2. Öffne `selectors.js` und aktualisiere die Selektoren

### So findest du die richtigen Selektoren

1. Öffne ein Google Maps Profil
2. Öffne Chrome DevTools (F12)
3. Klicke manuell durch den "Änderung vorschlagen"-Flow
4. Inspiziere jedes Element und notiere:
   - `aria-label` Attribute
   - `data-value` Attribute
   - Eindeutige Klassen oder IDs
5. Aktualisiere die Arrays in `selectors.js`

### Struktur von selectors.js

```javascript
const SELECTORS = {
  // Button "Änderung vorschlagen"
  suggestEditButton: [
    'button[aria-label*="Änderung vorschlagen"]',
    // ... weitere Selektoren als Fallback
  ],
  
  // Option "Geschlossen oder nicht vorhanden"
  closedOrDoesntExistOption: [
    'button[data-value="Close or remove"]',
    // ...
  ],
  
  // usw.
};
```

Die Extension probiert jeden Selektor im Array der Reihe nach, bis einer funktioniert.

## Dateien

```
maps-melde-helper/
├── manifest.json      # Extension-Konfiguration
├── background.js      # Service Worker
├── content.js         # Hauptlogik (injiziert in Maps)
├── selectors.js       # Alle UI-Selektoren (HIER ANPASSEN!)
├── styles.css         # Dialog-Styles
├── popup.html         # Popup-UI
├── popup.js           # Popup-Logik
├── icons/             # Extension-Icons
└── README.md          # Diese Datei
```

## Sicherheitshinweise

- Die Extension funktioniert nur mit dem bereits in Chrome angemeldeten Google-Konto
- Keine Speicherung von Anmeldedaten
- Keine Netzwerkanfragen außer zu Google Maps
- Alle Aktionen sind im Suggest-Edit-Flow von Google Maps sichtbar
- Der finale Submit erfordert immer manuelle Bestätigung

## Fehlerbehebung

### "Button nicht gefunden"

1. Ist ein Google Maps Profil geöffnet (nicht nur die Karte)?
2. Ist das Profil vollständig geladen?
3. Sind die Selektoren aktuell? (siehe oben)

### Dialog erscheint nicht

1. Prüfe ob der Content-Script geladen wurde (Konsole: `[RR-MeldeHelper] Maps Melde-Helper initialisiert`)
2. Versuche die Seite neu zu laden
3. Prüfe ob die Extension aktiviert ist

### Bestätigungsdialog wird überdeckt

Der Dialog hat `z-index: 9999999`. Falls er trotzdem überdeckt wird, erhöhe den Wert in `styles.css`.

## Lizenz

Intern für RapidRemove. Nicht zur Veröffentlichung im Chrome Web Store vorgesehen.

## Änderungshistorie

- **v1.0.0** (Oktober 2026): Initiale Version

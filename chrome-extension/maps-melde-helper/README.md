# RapidRemove Maps Melde-Helper

Chrome-Extension zur Automatisierung aller Google Maps "Operating Status"-Meldungen für den RapidRemove Admin-Workflow.

**Unterstützte Sprachen:** Englisch 🇬🇧 + Deutsch 🇩🇪

## Unterstützte Melde-Typen

Alle 8 Operating Status Optionen werden unterstützt:

| Typ-ID | Deutsch | English |
|--------|---------|---------|
| `doesnt_exist` | Existiert hier nicht | Doesn't exist here |
| `temporarily_closed` | Vorübergehend geschlossen | Temporarily closed |
| `permanently_closed` | Dauerhaft geschlossen | Permanently closed |
| `duplicate` | Duplikat eines anderen Orts | Duplicate of another place |
| `moved` | An einen neuen Standort umgezogen | Moved to a new location |
| `offensive` | Anstößig, schädlich oder irreführend | Offensive, harmful or misleading |
| `not_public` | Nicht öffentlich zugänglich | Not open to the public |
| `other` | Sonstiges | Other |

## Funktionsweise

Die Extension automatisiert den "Suggest an edit"-Flow in Google Maps:

1. Öffnet "Suggest an edit" / "Änderung vorschlagen"
2. Wählt "Place is closed or not here" / "Geschlossen oder nicht vorhanden"
3. Wählt die gewählte Operating-Status-Option
4. Handhabt Follow-up-Felder (Duplikat-Ziel, neuer Standort, etc.):
   - Füllt automatisch aus wenn `rr_reason` angegeben
   - **Pausiert** und lässt den Benutzer manuell ausfüllen wenn nicht
5. **Zeigt einen Bestätigungsdialog** ("Meldung absenden?")
6. Erst nach Bestätigung wird "Submit" geklickt

**Wichtig:** 
- Der finale Submit erfolgt nur nach manueller Bestätigung
- Genau EINE Meldung pro Durchlauf (keine Verkettung)
- Kein Auto-Start weiterer Meldungen

## 🧪 Testmodus

Der **Testmodus** ermöglicht sicheres Testen auf beliebigen Profilen:

- Stoppt **vor** dem finalen Submit
- Zeigt einen Erfolgs-Dialog ohne "Absenden"-Option
- Kein Profil wird tatsächlich gemeldet
- Perfekt zum Verifizieren der UI-Selektoren

### Testmodus aktivieren:
- **Popup:** Toggle "🧪 Testmodus" einschalten
- **URL-Parameter:** `&rr_test=1` hinzufügen
- **Konsole:** `window.rrStartReport('doesnt_exist', 'grund', 'order-id', true)`

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
3. Wähle den gewünschten **Melde-Typ** (Radio-Buttons)
4. Optional: Aktiviere den Testmodus
5. Optional: Gib Zusatzinfos und Auftrags-ID ein
6. Klicke "Meldung starten"
7. Im Echtmodus: Bestätige im Dialog mit "Ja, absenden"

### Methode 2: URL-Parameter (vom Admin aus)

```
?rr_melden=1&rr_type=TYPE&rr_reason=TEXT&rr_order=ID&rr_test=1
```

**Parameter:**
- `rr_melden=1` - Aktiviert den Melde-Flow (erforderlich)
- `rr_type=TYPE` - Melde-Typ (siehe Tabelle oben)
- `rr_reason=TEXT` - Zusatzinfo/Grund
- `rr_order=ID` - Auftrags-ID
- `rr_test=1` - Testmodus aktivieren

**Beispiele:**

```
# Existiert nicht melden
https://www.google.com/maps/place/...?rr_melden=1&rr_type=doesnt_exist&rr_order=RR-12345

# Duplikat melden (mit Grund)
https://www.google.com/maps/place/...?rr_melden=1&rr_type=duplicate&rr_reason=Duplikat+von+XYZ

# Testmodus: Umgezogen
https://www.google.com/maps/place/...?rr_melden=1&rr_type=moved&rr_test=1
```

### Methode 3: Konsolen-Befehl (Debug)

```javascript
// Syntax: window.rrStartReport(reportType, reason, orderId, testMode)

// Existiert nicht (Echtmodus)
window.rrStartReport('doesnt_exist', '', 'RR-12345', false);

// Duplikat (Testmodus)
window.rrStartReport('duplicate', 'Duplikat von Place XYZ', '', true);

// Debug: Alle sichtbaren Buttons
window.rrDebugButtons();
```

## Integration ins RapidRemove Admin

### Deep-Link Button

```javascript
function openMeldeLink(order, reportType = 'doesnt_exist', testMode = false) {
  const mapsUrl = order.mapsUri;
  const type = encodeURIComponent(reportType);
  const reason = encodeURIComponent('...');
  const orderId = encodeURIComponent(order.id);
  const test = testMode ? '&rr_test=1' : '';
  
  const url = `${mapsUrl}${mapsUrl.includes('?') ? '&' : '?'}rr_melden=1&rr_type=${type}&rr_reason=${reason}&rr_order=${orderId}${test}`;
  
  window.open(url, '_blank');
}
```

### Bereits integriert in OrdersScreens.jsx

Der "Melden"-Button in `OrderInfoScreen` öffnet:
```
{mapsUri}?rr_melden=1&rr_type=doesnt_exist&rr_reason=...&rr_order={orderId}
```

## Follow-up-Felder

Einige Melde-Typen benötigen zusätzliche Informationen:

| Typ | Follow-up |
|-----|-----------|
| `duplicate` | Ziel-Ort auswählen |
| `moved` | Neuen Standort eingeben |
| `other` | Freitext-Grund eingeben |

**Verhalten:**
- Wenn `rr_reason` angegeben: Feld wird automatisch ausgefüllt
- Wenn nicht: Extension **pausiert** und zeigt Dialog "Bitte das Feld ausfüllen"
- Nach manueller Eingabe: "Weiter" klicken

## Struktur von selectors.js

```javascript
// Report-Typen mit Metadaten
const REPORT_TYPES = {
  doesnt_exist: {
    id: 'doesnt_exist',
    labelDE: 'Existiert hier nicht',
    labelEN: "Doesn't exist here",
    hasFollowUp: false,
  },
  duplicate: {
    id: 'duplicate',
    labelDE: 'Duplikat eines anderen Orts',
    labelEN: 'Duplicate of another place',
    hasFollowUp: true,
    followUpHint: 'Bitte das Duplikat-Ziel auswählen',
  },
  // ...
};

// Text-Patterns für verschiedene Sprachen
const TEXT_PATTERNS = {
  doesnt_exist: ["doesn't exist here", 'existiert hier nicht', ...],
  duplicate: ['duplicate of another place', 'duplikat', ...],
  // ...
};
```

## Dateien

```
maps-melde-helper/
├── manifest.json      # Extension-Konfiguration (Manifest V3)
├── background.js      # Service Worker
├── content.js         # Hauptlogik (injiziert in Maps)
├── selectors.js       # UI-Selektoren, Text-Patterns, Report-Typen
├── styles.css         # Dialog-Styles
├── popup.html/js      # Popup-UI mit Typ-Auswahl + Testmodus
├── icons/             # Extension-Icons
└── README.md          # Diese Datei
```

## Fehlerbehebung

### "Option nicht gefunden"

1. Öffne die Browser-Konsole (F12)
2. Suche nach `[RR-MeldeHelper]` Logs
3. Prüfe die Text-Patterns in `selectors.js` → `TEXT_PATTERNS`

**Wichtig:** Der Edit-Dialog von Google Maps lädt oft in einem **Iframe**. 
Die Extension unterstützt Multi-Frame-Koordination:
- `[RR-MeldeHelper] [TOP]` = Logs aus dem Hauptfenster
- `[RR-MeldeHelper] [IFRAME]` = Logs aus einem Iframe

Die Extension sucht automatisch in allen Frames nach den Radio-Optionen.

### Dialog erscheint nicht

1. Prüfe ob Content-Script geladen wurde: `[RR-MeldeHelper] [TOP] Content script loaded in: ...`
2. Seite neu laden
3. Extension aktiviert?
4. Prüfe ob Iframes erkannt werden: `[RR-MeldeHelper] [IFRAME] Content script loaded in: ...`

### Testmodus zum Debuggen

Der Testmodus zeigt:
- Welche Schritte erfolgreich waren
- Den gewählten Typ
- Stoppt sicher vor Submit

### Cross-Origin Iframe Probleme

Falls der Dialog in einem Cross-Origin Iframe lädt, den die Extension nicht erreicht:
1. Prüfe `manifest.json` `host_permissions` für die Iframe-Origin
2. Der Debug-Log zeigt: `[RR-MeldeHelper] [TOP] === DEBUG: All interactive elements ===`
3. Wenn nur Haupt-UI-Elemente (Zoom, Street View...) gelistet werden, ist der Dialog in einem nicht erreichten Frame

## Sicherheitshinweise

- Funktioniert nur mit dem angemeldeten Google-Konto
- Keine Speicherung von Credentials
- Alle Aktionen manuell bestätigbar
- Genau EINE Meldung pro Durchlauf

## Lizenz

Intern für RapidRemove. Nicht zur Veröffentlichung im Chrome Web Store vorgesehen.

## Änderungshistorie

- **v1.2.4** (Oktober 2026):
  - **DOM-Struktur erkannt**: span.GoAIrd für Optionstext, div[jsaction] als klickbarer Container
  - Material Icon Namen als sprach-unabhängiger Fallback (z.B. `wrong_location` = Doesn't exist)
  - Irrelevante Frames werden übersprungen (accounts.google.com, RotateCookiesPage)
  - Timeout statt Endlosschleife bei Suche
  - Debug-Logging: outerHTML von Elementen mit Optionstext

- **v1.2.3** (Oktober 2026):
  - Multi-Frame Support: Dialog-Erkennung in Iframes
  - Frame-zu-Frame-Koordination via Background Service Worker
  - Erweiterte `host_permissions` für alle Google-Domains
  - `all_frames: true`, `match_about_blank: true`, `match_origin_as_fallback: true`

- **v1.2.0** (Oktober 2026):
  - Alle 8 Operating Status Optionen
  - Radio-Button Auswahl im Popup
  - URL-Parameter `rr_type` für Typ-Auswahl
  - Follow-up-Feld Handling mit Pause-Dialog
  - Speichert zuletzt gewählten Typ

- **v1.1.0** (Oktober 2026): 
  - Englisch + Deutsch Support
  - Testmodus
  - Debug-Funktion `rrDebugButtons()`
  
- **v1.0.0** (Oktober 2026): Initiale Version

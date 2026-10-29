/**
 * Google Maps UI-Selektoren für den "Änderung vorschlagen" → "Existiert nicht"-Flow.
 * 
 * WICHTIG: Google Maps ist eine SPA und ändert die UI regelmäßig.
 * Bei Problemen diese Selektoren aktualisieren!
 * 
 * Letzte Aktualisierung: Oktober 2026
 * 
 * So findest du die richtigen Selektoren:
 * 1. Öffne ein Google Maps Profil
 * 2. Öffne Chrome DevTools (F12)
 * 3. Klicke auf das Element und inspiziere den HTML-Code
 * 4. Suche nach stabilen Attributen wie data-value, aria-label, role
 */

const SELECTORS = {
  // "Änderung vorschlagen" / "Suggest an edit" Button im Profil-Panel
  // Kann als Button oder als Link erscheinen
  suggestEditButton: [
    'button[aria-label*="Änderung vorschlagen"]',
    'button[aria-label*="Suggest an edit"]',
    'button[data-value="Suggest an edit"]',
    'button[data-value="Änderung vorschlagen"]',
    '[data-item-id="suggest_edit"] button',
    'a[aria-label*="Änderung vorschlagen"]',
    'a[aria-label*="Suggest an edit"]',
    // Fallback: Text-basierte Suche
  ],

  // "Geschlossen oder nicht vorhanden" / "Close or remove" Option
  closedOrDoesntExistOption: [
    'button[data-value="Close or remove"]',
    'button[data-value="Schließen oder entfernen"]',
    'button[aria-label*="Geschlossen oder nicht vorhanden"]',
    'button[aria-label*="Close or remove"]',
    '[role="menuitemradio"][data-value="CLOSED_REMOVED"]',
    // Div mit Text
  ],

  // "Existiert nicht" / "Doesn't exist" Radio-Button
  doesntExistOption: [
    'button[data-value="Place does not exist"]',
    'button[data-value="Ort existiert nicht"]',
    '[role="menuitemradio"][data-value="DOES_NOT_EXIST"]',
    'label[data-value="DOES_NOT_EXIST"]',
    // Generischer Radio-Button
  ],

  // Textfeld für den Grund
  reasonInput: [
    'textarea[aria-label*="Grund"]',
    'textarea[aria-label*="reason"]',
    'textarea[aria-label*="additional"]',
    'textarea[aria-label*="Weitere"]',
    'textarea[placeholder*="Optional"]',
    'input[aria-label*="Grund"]',
    'input[aria-label*="reason"]',
    // Fallback: erstes Textarea im Dialog
    '.section-editplace-reason textarea',
  ],

  // "Senden" / "Submit" Button
  submitButton: [
    'button[aria-label*="Senden"]',
    'button[aria-label*="Submit"]',
    'button[data-value="Send"]',
    'button[data-value="Senden"]',
    'button[jsaction*="send"]',
    // Generischer Button mit Submit-Text
  ],

  // Dialog/Modal Container
  editDialog: [
    '[role="dialog"]',
    '.section-editplace',
    '[aria-label*="Änderung vorschlagen"]',
    '[aria-label*="Suggest an edit"]',
  ],

  // "Zurück" / "Back" Button im Dialog
  backButton: [
    'button[aria-label*="Zurück"]',
    'button[aria-label*="Back"]',
    'button[data-value="Back"]',
  ],

  // Schließen-Button
  closeButton: [
    'button[aria-label*="Schließen"]',
    'button[aria-label*="Close"]',
    'button[aria-label*="Abbrechen"]',
    'button[aria-label*="Cancel"]',
  ],
};

// Hilfsfunktion: Findet ein Element mit mehreren möglichen Selektoren
function findElement(selectorArray, context = document) {
  for (const selector of selectorArray) {
    try {
      const el = context.querySelector(selector);
      if (el && el.offsetParent !== null) { // sichtbar
        return el;
      }
    } catch (e) {
      // Ungültiger Selektor, überspringen
    }
  }
  return null;
}

// Hilfsfunktion: Findet ein Element anhand von Text-Inhalt
function findByText(text, tagName = '*', context = document) {
  const normalizedText = text.toLowerCase().trim();
  const elements = context.querySelectorAll(tagName);
  for (const el of elements) {
    const elText = (el.textContent || el.innerText || '').toLowerCase().trim();
    if (elText.includes(normalizedText) && el.offsetParent !== null) {
      return el;
    }
  }
  return null;
}

// Hilfsfunktion: Wartet auf ein Element
function waitForElement(selectorArray, timeout = 10000, interval = 200) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const el = findElement(selectorArray);
      if (el) {
        resolve(el);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element nicht gefunden: ${selectorArray.join(', ')}`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

// Hilfsfunktion: Wartet auf Element anhand von Text
function waitForText(text, tagName = 'button', timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const el = findByText(text, tagName);
      if (el) {
        resolve(el);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element mit Text "${text}" nicht gefunden`));
        return;
      }
      
      setTimeout(check, 200);
    };
    
    check();
  });
}

// Exportiere für content.js
if (typeof window !== 'undefined') {
  window.MAPS_SELECTORS = SELECTORS;
  window.findElement = findElement;
  window.findByText = findByText;
  window.waitForElement = waitForElement;
  window.waitForText = waitForText;
}

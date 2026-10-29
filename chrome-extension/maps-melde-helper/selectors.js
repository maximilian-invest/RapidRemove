/**
 * Google Maps UI-Selektoren für den "Änderung vorschlagen" → "Existiert nicht"-Flow.
 * 
 * WICHTIG: Google Maps ist eine SPA und ändert die UI regelmäßig.
 * Bei Problemen diese Selektoren aktualisieren!
 * 
 * Letzte Aktualisierung: Oktober 2026
 * Unterstützte Sprachen: Englisch, Deutsch
 * 
 * So findest du die richtigen Selektoren:
 * 1. Öffne ein Google Maps Profil
 * 2. Öffne Chrome DevTools (F12)
 * 3. Klicke auf das Element und inspiziere den HTML-Code
 * 4. Suche nach stabilen Attributen wie data-value, aria-label, role
 */

// ============================================================================
// TEXT-PATTERNS FÜR VERSCHIEDENE SPRACHEN
// ============================================================================

const TEXT_PATTERNS = {
  // "Änderung vorschlagen" / "Suggest an edit" Button
  suggestEdit: [
    'suggest an edit',
    'änderung vorschlagen',
  ],

  // "Geschlossen oder nicht vorhanden" / "Place is closed or not here"
  // Dies ist die ERSTE Option die geklickt werden muss
  closedOrNotHere: [
    'place is closed or not here',      // EN - exact text from Max's screenshot
    'closed or not here',                // EN - partial match
    'close or remove',                   // EN - alternative wording
    'geschlossen oder nicht vorhanden',  // DE
    'schließen oder entfernen',          // DE - alternative
  ],

  // "Existiert nicht" / "Doesn't exist here" / "Never existed"
  // Dies sind die Optionen auf dem ZWEITEN Screen
  doesntExist: [
    "doesn't exist here",                // EN - primary
    'does not exist here',               // EN - alternative
    'never existed',                     // EN - alternative option
    "doesn't exist",                     // EN - short form
    'does not exist',                    // EN - short form
    'place does not exist',              // EN - full form
    'existiert nicht',                   // DE
    'existiert hier nicht',              // DE
    'ort existiert nicht',               // DE
    'nie existiert',                     // DE - "never existed"
  ],

  // "Senden" / "Submit" / "Send" Button
  submit: [
    'submit',
    'send',
    'senden',
    'absenden',
  ],

  // "Abbrechen" / "Cancel" / "Close"
  cancel: [
    'cancel',
    'close',
    'abbrechen',
    'schließen',
  ],
};

// ============================================================================
// CSS-SELEKTOREN
// ============================================================================

const SELECTORS = {
  // "Änderung vorschlagen" / "Suggest an edit" Button im Profil-Panel
  suggestEditButton: [
    // Aria-labels (sprachunabhängig wenn möglich)
    'button[aria-label*="Suggest an edit" i]',
    'button[aria-label*="Änderung vorschlagen" i]',
    'a[aria-label*="Suggest an edit" i]',
    'a[aria-label*="Änderung vorschlagen" i]',
    // Data-values
    'button[data-value="Suggest an edit"]',
    'button[data-value="Änderung vorschlagen"]',
    // Item-ID (strukturell, sprachunabhängig)
    '[data-item-id="suggest_edit"] button',
    '[data-item-id="suggest_edit"]',
  ],

  // "Geschlossen oder nicht vorhanden" - erste Option
  // Google zeigt dies oft als letzten Eintrag in einer Liste
  closedOrNotHereOption: [
    // Strukturelle Selektoren (sprachunabhängig)
    '[role="menuitemradio"][data-value*="CLOSED"]',
    '[role="menuitemradio"][data-value*="REMOVE"]',
    '[role="listitem"]:last-child button',
    // Aria-labels
    'button[aria-label*="closed" i]',
    'button[aria-label*="not here" i]',
    'button[aria-label*="remove" i]',
    'button[aria-label*="geschlossen" i]',
    // Data-values
    'button[data-value*="close" i]',
    'button[data-value*="remove" i]',
  ],

  // "Existiert nicht" / "Doesn't exist" - zweiter Screen
  doesntExistOption: [
    // Strukturelle Selektoren
    '[role="menuitemradio"][data-value*="NOT_EXIST"]',
    '[role="menuitemradio"][data-value*="DOES_NOT"]',
    '[role="menuitemradio"][data-value*="NEVER"]',
    '[role="radio"][data-value*="NOT_EXIST"]',
    // Aria-labels
    'button[aria-label*="exist" i]',
    'label[aria-label*="exist" i]',
    '[role="menuitemradio"][aria-label*="exist" i]',
  ],

  // Textfeld für den Grund
  reasonInput: [
    'textarea[aria-label*="reason" i]',
    'textarea[aria-label*="Grund" i]',
    'textarea[aria-label*="additional" i]',
    'textarea[aria-label*="Weitere" i]',
    'textarea[aria-label*="details" i]',
    'textarea[placeholder*="Optional" i]',
    'input[aria-label*="reason" i]',
    'input[aria-label*="Grund" i]',
    // Fallback: Textarea im Dialog
    '[role="dialog"] textarea',
    'form textarea',
  ],

  // "Senden" / "Submit" Button
  submitButton: [
    'button[aria-label*="Submit" i]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Senden" i]',
    'button[data-value="Submit"]',
    'button[data-value="Send"]',
    'button[data-value="Senden"]',
    // Strukturell: Primary button im Dialog
    '[role="dialog"] button[class*="primary" i]',
    'form button[type="submit"]',
  ],

  // Dialog/Modal Container
  editDialog: [
    '[role="dialog"]',
    '[aria-modal="true"]',
    '.section-editplace',
    '[aria-label*="Suggest an edit" i]',
    '[aria-label*="Änderung vorschlagen" i]',
    '[aria-label*="edit" i][role="dialog"]',
  ],

  // Schließen/Abbrechen Button
  closeButton: [
    'button[aria-label*="Close" i]',
    'button[aria-label*="Cancel" i]',
    'button[aria-label*="Schließen" i]',
    'button[aria-label*="Abbrechen" i]',
    'button[aria-label*="Back" i]',
    'button[aria-label*="Zurück" i]',
    // X-Button in Dialogen
    '[role="dialog"] button[aria-label*="close" i]',
    '[role="dialog"] button:first-child',
  ],
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

/**
 * Findet ein Element mit mehreren möglichen CSS-Selektoren
 */
function findElement(selectorArray, context = document) {
  for (const selector of selectorArray) {
    try {
      const el = context.querySelector(selector);
      if (el && isVisible(el)) {
        return el;
      }
    } catch (e) {
      // Ungültiger Selektor, überspringen
    }
  }
  return null;
}

/**
 * Prüft ob ein Element sichtbar ist
 */
function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         el.offsetParent !== null;
}

/**
 * Findet ein Element anhand von Text-Inhalt (case-insensitive)
 */
function findByText(text, tagName = '*', context = document) {
  const normalizedText = text.toLowerCase().trim();
  const elements = context.querySelectorAll(tagName);
  for (const el of elements) {
    const elText = (el.textContent || el.innerText || '').toLowerCase().trim();
    if (elText.includes(normalizedText) && isVisible(el)) {
      return el;
    }
  }
  return null;
}

/**
 * Findet ein Element anhand eines Arrays von möglichen Text-Patterns
 * Gibt das erste gefundene Element zurück
 */
function findByAnyText(textPatterns, tagName = '*', context = document) {
  for (const text of textPatterns) {
    const el = findByText(text, tagName, context);
    if (el) {
      console.log(`[RR-MeldeHelper] Gefunden mit Text: "${text}"`);
      return el;
    }
  }
  return null;
}

/**
 * Findet ein klickbares Element (button, a, [role="button"]) anhand von Text-Patterns
 */
function findClickableByText(textPatterns, context = document) {
  // Erst in Buttons suchen
  let el = findByAnyText(textPatterns, 'button', context);
  if (el) return el;
  
  // Dann in Links
  el = findByAnyText(textPatterns, 'a', context);
  if (el) return el;
  
  // Dann in divs mit role="button" oder role="menuitemradio"
  el = findByAnyText(textPatterns, '[role="button"]', context);
  if (el) return el;
  
  el = findByAnyText(textPatterns, '[role="menuitemradio"]', context);
  if (el) return el;
  
  el = findByAnyText(textPatterns, '[role="radio"]', context);
  if (el) return el;
  
  // Fallback: irgendein klickbares Element
  el = findByAnyText(textPatterns, '[tabindex]', context);
  if (el) return el;
  
  // Letzter Fallback: beliebiges Element
  return findByAnyText(textPatterns, '*', context);
}

/**
 * Wartet auf ein Element (Selektoren oder Text-Patterns)
 */
function waitForElement(selectorArray, timeout = 10000, interval = 300) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const el = findElement(selectorArray);
      if (el) {
        resolve(el);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element nicht gefunden (Selektoren): ${selectorArray.slice(0, 3).join(', ')}...`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

/**
 * Wartet auf ein Element anhand von Text-Patterns
 */
function waitForAnyText(textPatterns, timeout = 10000, interval = 300) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const el = findClickableByText(textPatterns);
      if (el) {
        resolve(el);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element nicht gefunden (Texte): ${textPatterns.slice(0, 3).join(', ')}...`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
  window.MAPS_SELECTORS = SELECTORS;
  window.MAPS_TEXT_PATTERNS = TEXT_PATTERNS;
  window.findElement = findElement;
  window.findByText = findByText;
  window.findByAnyText = findByAnyText;
  window.findClickableByText = findClickableByText;
  window.waitForElement = waitForElement;
  window.waitForAnyText = waitForAnyText;
  window.isVisible = isVisible;
}

/**
 * Google Maps UI-Selektoren für den "Änderung vorschlagen" → Operating Status Flow.
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
// REPORT-TYPEN (alle 8 Operating Status Optionen)
// ============================================================================

const REPORT_TYPES = {
  temporarily_closed: {
    id: 'temporarily_closed',
    labelDE: 'Vorübergehend geschlossen',
    labelEN: 'Temporarily closed',
    hasFollowUp: false,
  },
  permanently_closed: {
    id: 'permanently_closed',
    labelDE: 'Dauerhaft geschlossen',
    labelEN: 'Permanently closed',
    hasFollowUp: false,
  },
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
    hasFollowUp: true, // Needs target place
    followUpHint: 'Bitte das Duplikat-Ziel auswählen',
  },
  offensive: {
    id: 'offensive',
    labelDE: 'Anstößig, schädlich oder irreführend',
    labelEN: 'Offensive, harmful or misleading',
    hasFollowUp: false,
  },
  not_public: {
    id: 'not_public',
    labelDE: 'Nicht öffentlich zugänglich',
    labelEN: 'Not open to the public',
    hasFollowUp: false,
  },
  moved: {
    id: 'moved',
    labelDE: 'An einen neuen Standort umgezogen',
    labelEN: 'Moved to a new location',
    hasFollowUp: true, // Needs new location
    followUpHint: 'Bitte den neuen Standort eingeben',
  },
  other: {
    id: 'other',
    labelDE: 'Sonstiges',
    labelEN: 'Other',
    hasFollowUp: true, // Needs free text
    followUpHint: 'Bitte den Grund eingeben',
  },
};

// Default type for backwards compatibility
const DEFAULT_REPORT_TYPE = 'doesnt_exist';

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
    'place is closed or not here',
    'closed or not here',
    'close or remove',
    'geschlossen oder nicht vorhanden',
    'schließen oder entfernen',
  ],

  // === Operating Status Optionen (8 Typen) ===
  
  temporarily_closed: [
    'temporarily closed',
    'vorübergehend geschlossen',
  ],
  
  permanently_closed: [
    'permanently closed',
    'dauerhaft geschlossen',
  ],
  
  doesnt_exist: [
    "doesn't exist here",
    'does not exist here',
    'never existed',
    "doesn't exist",
    'does not exist',
    'place does not exist',
    'existiert hier nicht',
    'existiert nicht',
    'ort existiert nicht',
    'nie existiert',
  ],
  
  duplicate: [
    'duplicate of another place',
    'duplicate',
    'duplikat eines anderen orts',
    'duplikat',
  ],
  
  offensive: [
    'offensive, harmful or misleading',
    'offensive',
    'harmful',
    'misleading',
    'anstößig, schädlich oder irreführend',
    'anstößig',
    'schädlich',
    'irreführend',
  ],
  
  not_public: [
    'not open to the public',
    'not public',
    'private',
    'nicht öffentlich zugänglich',
    'nicht öffentlich',
    'privat',
  ],
  
  moved: [
    'moved to a new location',
    'moved',
    'relocated',
    'an einen neuen standort umgezogen',
    'umgezogen',
    'neuer standort',
  ],
  
  other: [
    'other',
    'sonstiges',
    'anderer grund',
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
    'button[aria-label*="Suggest an edit" i]',
    'button[aria-label*="Änderung vorschlagen" i]',
    'a[aria-label*="Suggest an edit" i]',
    'a[aria-label*="Änderung vorschlagen" i]',
    'button[data-value="Suggest an edit"]',
    'button[data-value="Änderung vorschlagen"]',
    '[data-item-id="suggest_edit"] button',
    '[data-item-id="suggest_edit"]',
  ],

  // "Geschlossen oder nicht vorhanden" - erste Option
  closedOrNotHereOption: [
    '[role="menuitemradio"][data-value*="CLOSED"]',
    '[role="menuitemradio"][data-value*="REMOVE"]',
    '[role="listitem"]:last-child button',
    'button[aria-label*="closed" i]',
    'button[aria-label*="not here" i]',
    'button[aria-label*="remove" i]',
    'button[aria-label*="geschlossen" i]',
    'button[data-value*="close" i]',
    'button[data-value*="remove" i]',
  ],

  // Radio-Buttons für Operating Status (strukturell)
  statusRadioButtons: [
    '[role="menuitemradio"]',
    '[role="radio"]',
    'input[type="radio"]',
    '[role="option"]',
  ],

  // Textfeld für den Grund / Follow-up Input
  reasonInput: [
    'textarea[aria-label*="reason" i]',
    'textarea[aria-label*="Grund" i]',
    'textarea[aria-label*="additional" i]',
    'textarea[aria-label*="Weitere" i]',
    'textarea[aria-label*="details" i]',
    'textarea[placeholder*="Optional" i]',
    'input[aria-label*="reason" i]',
    'input[aria-label*="Grund" i]',
    'input[aria-label*="location" i]',
    'input[aria-label*="Standort" i]',
    'input[aria-label*="place" i]',
    '[role="dialog"] textarea',
    '[role="dialog"] input[type="text"]',
    'form textarea',
    'form input[type="text"]',
  ],

  // "Senden" / "Submit" Button
  submitButton: [
    'button[aria-label*="Submit" i]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Senden" i]',
    'button[data-value="Submit"]',
    'button[data-value="Send"]',
    'button[data-value="Senden"]',
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
 * Findet alle Elemente mit mehreren möglichen CSS-Selektoren
 */
function findAllElements(selectorArray, context = document) {
  const results = [];
  for (const selector of selectorArray) {
    try {
      const els = context.querySelectorAll(selector);
      els.forEach(el => {
        if (isVisible(el) && !results.includes(el)) {
          results.push(el);
        }
      });
    } catch (e) {
      // Ungültiger Selektor, überspringen
    }
  }
  return results;
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
  
  el = findByAnyText(textPatterns, '[role="option"]', context);
  if (el) return el;
  
  // Fallback: irgendein klickbares Element
  el = findByAnyText(textPatterns, '[tabindex]', context);
  if (el) return el;
  
  // Label-Elemente (oft bei Radio-Buttons)
  el = findByAnyText(textPatterns, 'label', context);
  if (el) return el;
  
  // Span/Div mit dem Text (und dann den Parent-Button finden)
  el = findByAnyText(textPatterns, 'span', context);
  if (el) {
    // Suche nach klickbarem Parent
    let parent = el.parentElement;
    while (parent) {
      if (parent.tagName === 'BUTTON' || 
          parent.getAttribute('role') === 'menuitemradio' ||
          parent.getAttribute('role') === 'radio' ||
          parent.getAttribute('role') === 'button') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return el; // Gib das Span zurück wenn kein Button-Parent gefunden
  }
  
  // Letzter Fallback: beliebiges Element
  return findByAnyText(textPatterns, '*', context);
}

/**
 * Findet eine spezifische Operating-Status-Option anhand des Typs
 */
function findStatusOption(reportType) {
  const type = REPORT_TYPES[reportType];
  if (!type) {
    console.error(`[RR-MeldeHelper] Unbekannter Report-Typ: ${reportType}`);
    return null;
  }
  
  const patterns = TEXT_PATTERNS[reportType];
  if (!patterns) {
    console.error(`[RR-MeldeHelper] Keine Text-Patterns für: ${reportType}`);
    return null;
  }
  
  return findClickableByText(patterns);
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

/**
 * Wartet auf eine Status-Option
 */
function waitForStatusOption(reportType, timeout = 10000, interval = 300) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const el = findStatusOption(reportType);
      if (el) {
        resolve(el);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        const type = REPORT_TYPES[reportType];
        reject(new Error(`Option nicht gefunden: "${type?.labelEN}" / "${type?.labelDE}"`));
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
  window.MAPS_REPORT_TYPES = REPORT_TYPES;
  window.MAPS_DEFAULT_TYPE = DEFAULT_REPORT_TYPE;
  window.findElement = findElement;
  window.findAllElements = findAllElements;
  window.findByText = findByText;
  window.findByAnyText = findByAnyText;
  window.findClickableByText = findClickableByText;
  window.findStatusOption = findStatusOption;
  window.waitForElement = waitForElement;
  window.waitForAnyText = waitForAnyText;
  window.waitForStatusOption = waitForStatusOption;
  window.isVisible = isVisible;
}

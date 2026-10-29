/**
 * Google Maps UI-Selektoren für den "Änderung vorschlagen" → Operating Status Flow.
 * 
 * WICHTIG: Google Maps ist eine SPA und ändert die UI regelmäßig.
 * Bei Problemen diese Selektoren aktualisieren!
 * 
 * Letzte Aktualisierung: Oktober 2026
 * Unterstützte Sprachen: Englisch, Deutsch
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
    hasFollowUp: true,
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
    hasFollowUp: true,
    followUpHint: 'Bitte den neuen Standort eingeben',
  },
  other: {
    id: 'other',
    labelDE: 'Sonstiges',
    labelEN: 'Other',
    hasFollowUp: true,
    followUpHint: 'Bitte den Grund eingeben',
  },
};

const DEFAULT_REPORT_TYPE = 'doesnt_exist';

// ============================================================================
// TEXT-PATTERNS FÜR VERSCHIEDENE SPRACHEN
// Alle Patterns werden normalisiert (lowercase, apostrophe-unified)
// ============================================================================

const TEXT_PATTERNS = {
  suggestEdit: [
    'suggest an edit',
    'änderung vorschlagen',
  ],

  closedOrNotHere: [
    'place is closed or not here',
    'closed or not here',
    'close or remove',
    'geschlossen oder nicht vorhanden',
    'schließen oder entfernen',
  ],

  // Operating Status Optionen
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
    "doesnt exist here",
    "doesn t exist here",
    'does not exist here',
    'never existed',
    "doesn't exist",
    "doesnt exist",
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
    'offensive harmful or misleading',
    'offensive',
    'harmful',
    'misleading',
    'anstößig, schädlich oder irreführend',
    'anstößig schädlich oder irreführend',
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

  submit: [
    'submit',
    'send',
    'senden',
    'absenden',
  ],

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

  // Radio-Buttons für Operating Status
  statusRadioButtons: [
    '[role="radio"]',
    '[role="menuitemradio"]',
    '[role="option"]',
    'input[type="radio"]',
    '[role="radiogroup"] > *',
  ],

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

  editDialog: [
    '[role="dialog"]',
    '[aria-modal="true"]',
    '.section-editplace',
    '[aria-label*="Suggest an edit" i]',
    '[aria-label*="Änderung vorschlagen" i]',
    '[aria-label*="edit" i][role="dialog"]',
  ],

  closeButton: [
    'button[aria-label*="Close" i]',
    'button[aria-label*="Cancel" i]',
    'button[aria-label*="Schließen" i]',
    'button[aria-label*="Abbrechen" i]',
    'button[aria-label*="Back" i]',
    'button[aria-label*="Zurück" i]',
    '[role="dialog"] button[aria-label*="close" i]',
  ],
};

// ============================================================================
// TEXT-NORMALISIERUNG
// ============================================================================

/**
 * Normalisiert Text für Vergleiche:
 * - Lowercase
 * - Ersetzt typografische Apostrophe (', ʻ, ʼ, ʽ, ʾ, ʿ, ˈ, ˊ, ʹ, ′) durch normale
 * - Kollabiert mehrere Leerzeichen
 * - Trimmt
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u02BB\u02BC\u02BD\u02BE\u02BF\u02C8\u02CA\u0027\u0060\u00B4\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrahiert den gesamten sichtbaren Text aus einem Element (inkl. Kinder)
 */
function getFullText(el) {
  if (!el) return '';
  // textContent holt alles, auch aus verschachtelten Spans
  return normalizeText(el.textContent || el.innerText || '');
}

/**
 * Holt aria-label falls vorhanden
 */
function getAriaLabel(el) {
  if (!el) return '';
  return normalizeText(el.getAttribute('aria-label') || '');
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function isVisible(el) {
  if (!el) return false;
  // offsetParent null check first (most common case)
  if (el.offsetParent === null && el.style?.position !== 'fixed') {
    return false;
  }
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         parseFloat(style.opacity) > 0;
}

function findElement(selectorArray, context = document) {
  for (const selector of selectorArray) {
    try {
      const el = context.querySelector(selector);
      if (el && isVisible(el)) {
        return el;
      }
    } catch (e) {
      // Invalid selector
    }
  }
  return null;
}

function findAllElements(selectorArray, context = document) {
  const results = [];
  const seen = new Set();
  
  for (const selector of selectorArray) {
    try {
      const els = context.querySelectorAll(selector);
      els.forEach(el => {
        if (isVisible(el) && !seen.has(el)) {
          seen.add(el);
          results.push(el);
        }
      });
    } catch (e) {
      // Invalid selector
    }
  }
  return results;
}

/**
 * Prüft ob ein normalisierter Text eines der Patterns enthält
 */
function textMatchesAnyPattern(text, patterns) {
  const normalizedText = normalizeText(text);
  for (const pattern of patterns) {
    const normalizedPattern = normalizeText(pattern);
    if (normalizedText.includes(normalizedPattern)) {
      return pattern; // Return matched pattern for debugging
    }
  }
  return null;
}

/**
 * Findet ein Element anhand von Text-Patterns (normalisiert)
 */
function findByText(text, tagName = '*', context = document) {
  const normalizedSearch = normalizeText(text);
  const elements = context.querySelectorAll(tagName);
  
  for (const el of elements) {
    if (!isVisible(el)) continue;
    
    const fullText = getFullText(el);
    if (fullText.includes(normalizedSearch)) {
      return el;
    }
    
    // Auch aria-label prüfen
    const ariaLabel = getAriaLabel(el);
    if (ariaLabel.includes(normalizedSearch)) {
      return el;
    }
  }
  return null;
}

/**
 * Findet ein Element anhand mehrerer Text-Patterns
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
 * Debug: Loggt alle Radio-Buttons und deren Text
 */
function debugLogRadioOptions(context = document) {
  console.log('[RR-MeldeHelper] === DEBUG: Suche Radio-Optionen ===');
  
  // Alle möglichen Radio-Elemente finden
  const selectors = [
    '[role="radio"]',
    '[role="menuitemradio"]',
    '[role="option"]',
    'input[type="radio"]',
    '[role="radiogroup"] > *',
    '[aria-checked]',
  ];
  
  const seen = new Set();
  
  selectors.forEach(sel => {
    try {
      const els = context.querySelectorAll(sel);
      els.forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        
        const fullText = getFullText(el);
        const ariaLabel = getAriaLabel(el);
        const checked = el.getAttribute('aria-checked');
        const role = el.getAttribute('role');
        const visible = isVisible(el);
        
        console.log(`[RR-MeldeHelper]   [${sel}] visible=${visible} role=${role} checked=${checked}`);
        console.log(`[RR-MeldeHelper]     text: "${fullText.substring(0, 80)}"`);
        if (ariaLabel) {
          console.log(`[RR-MeldeHelper]     aria-label: "${ariaLabel}"`);
        }
      });
    } catch (e) {}
  });
  
  console.log('[RR-MeldeHelper] === END DEBUG ===');
}

/**
 * Findet ein klickbares Element anhand von Text-Patterns
 * Sucht in Radio-Buttons, Buttons, Links, etc.
 */
function findClickableByText(textPatterns, context = document) {
  // Normalisiere alle Patterns
  const normalizedPatterns = textPatterns.map(p => normalizeText(p));
  
  // 1. Suche in Radio-Elementen (häufigster Fall bei Operating Status)
  const radioSelectors = [
    '[role="radio"]',
    '[role="menuitemradio"]',
    '[role="option"]',
    '[aria-checked]',
  ];
  
  for (const selector of radioSelectors) {
    try {
      const radios = context.querySelectorAll(selector);
      for (const radio of radios) {
        if (!isVisible(radio)) continue;
        
        const fullText = getFullText(radio);
        const ariaLabel = getAriaLabel(radio);
        
        for (const pattern of normalizedPatterns) {
          if (fullText.includes(pattern) || ariaLabel.includes(pattern)) {
            console.log(`[RR-MeldeHelper] Gefunden via ${selector}: "${pattern}" in "${fullText.substring(0, 50)}"`);
            return radio;
          }
        }
      }
    } catch (e) {}
  }
  
  // 2. Suche in Buttons
  const buttons = context.querySelectorAll('button');
  for (const btn of buttons) {
    if (!isVisible(btn)) continue;
    
    const fullText = getFullText(btn);
    const ariaLabel = getAriaLabel(btn);
    
    for (const pattern of normalizedPatterns) {
      if (fullText.includes(pattern) || ariaLabel.includes(pattern)) {
        console.log(`[RR-MeldeHelper] Gefunden via button: "${pattern}"`);
        return btn;
      }
    }
  }
  
  // 3. Suche in Links
  const links = context.querySelectorAll('a');
  for (const link of links) {
    if (!isVisible(link)) continue;
    
    const fullText = getFullText(link);
    const ariaLabel = getAriaLabel(link);
    
    for (const pattern of normalizedPatterns) {
      if (fullText.includes(pattern) || ariaLabel.includes(pattern)) {
        console.log(`[RR-MeldeHelper] Gefunden via a: "${pattern}"`);
        return link;
      }
    }
  }
  
  // 4. Suche in beliebigen klickbaren Elementen
  const clickables = context.querySelectorAll('[tabindex], [role="button"], label');
  for (const el of clickables) {
    if (!isVisible(el)) continue;
    
    const fullText = getFullText(el);
    const ariaLabel = getAriaLabel(el);
    
    for (const pattern of normalizedPatterns) {
      if (fullText.includes(pattern) || ariaLabel.includes(pattern)) {
        console.log(`[RR-MeldeHelper] Gefunden via clickable: "${pattern}"`);
        return el;
      }
    }
  }
  
  // 5. Suche in Spans/Divs und finde klickbaren Parent
  const spans = context.querySelectorAll('span, div');
  for (const span of spans) {
    if (!isVisible(span)) continue;
    
    const fullText = getFullText(span);
    
    for (const pattern of normalizedPatterns) {
      if (fullText.includes(pattern)) {
        // Suche klickbaren Parent
        let parent = span.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          const role = parent.getAttribute('role');
          if (parent.tagName === 'BUTTON' || 
              role === 'radio' || 
              role === 'menuitemradio' ||
              role === 'button' ||
              role === 'option' ||
              parent.hasAttribute('aria-checked')) {
            console.log(`[RR-MeldeHelper] Gefunden via span-parent: "${pattern}"`);
            return parent;
          }
          parent = parent.parentElement;
        }
        // Kein klickbarer Parent, aber Text gefunden - gib das Element zurück
        console.log(`[RR-MeldeHelper] Gefunden via span (kein parent): "${pattern}"`);
        return span;
      }
    }
  }
  
  return null;
}

/**
 * Findet eine spezifische Operating-Status-Option
 */
function findStatusOption(reportType, context = document) {
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
  
  console.log(`[RR-MeldeHelper] Suche Option: ${type.labelEN} / ${type.labelDE}`);
  console.log(`[RR-MeldeHelper] Patterns: ${patterns.slice(0, 3).join(', ')}...`);
  
  const el = findClickableByText(patterns, context);
  
  if (!el) {
    console.log(`[RR-MeldeHelper] Option nicht gefunden, debug Radio-Optionen:`);
    debugLogRadioOptions(context);
  }
  
  return el;
}

/**
 * Wartet auf ein Element mit Polling
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
        reject(new Error(`Element nicht gefunden: ${selectorArray.slice(0, 2).join(', ')}...`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

/**
 * Wartet auf eine Status-Option mit Polling und Debug-Output
 */
function waitForStatusOption(reportType, timeout = 8000, interval = 400) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const type = REPORT_TYPES[reportType];
    let attempts = 0;
    
    const check = () => {
      attempts++;
      console.log(`[RR-MeldeHelper] Suche Option "${reportType}" (Versuch ${attempts})...`);
      
      const el = findStatusOption(reportType);
      if (el) {
        console.log(`[RR-MeldeHelper] Option gefunden nach ${attempts} Versuchen`);
        resolve(el);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.error(`[RR-MeldeHelper] Timeout nach ${attempts} Versuchen`);
        reject(new Error(`"${type?.labelEN}" / "${type?.labelDE}" Option nicht gefunden`));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    // Erste Prüfung nach kurzem Delay (Dialog muss rendern)
    setTimeout(check, 200);
  });
}

/**
 * Wartet auf Text-Pattern mit Polling
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
        reject(new Error(`Element nicht gefunden: ${textPatterns.slice(0, 2).join(', ')}...`));
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
  
  window.normalizeText = normalizeText;
  window.getFullText = getFullText;
  window.getAriaLabel = getAriaLabel;
  window.isVisible = isVisible;
  
  window.findElement = findElement;
  window.findAllElements = findAllElements;
  window.findByText = findByText;
  window.findByAnyText = findByAnyText;
  window.findClickableByText = findClickableByText;
  window.findStatusOption = findStatusOption;
  
  window.waitForElement = waitForElement;
  window.waitForAnyText = waitForAnyText;
  window.waitForStatusOption = waitForStatusOption;
  
  window.debugLogRadioOptions = debugLogRadioOptions;
}

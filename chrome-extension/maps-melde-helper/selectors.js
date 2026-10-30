/**
 * Google Maps UI-Selektoren für den "Änderung vorschlagen" → Operating Status Flow.
 * Version 1.2.4
 * 
 * DOM-Struktur (Oktober 2026):
 * <div class="ATgAzb" jsaction="JIbuQc:iktSbe;">
 *   <i class="google-material-icons">wrong_location</i>
 *   <label class="ZPCMMc">
 *     <span class="GoAIrd">Doesn't exist here</span>
 *     <div class="VfPpkd-dgl2Hf-ppHlrf-sM5MNb" data-is-touch-wrapper="true">
 *       (Material radio input inside)
 *     </div>
 *   </label>
 * </div>
 */

// ============================================================================
// REPORT-TYPEN MIT MATERIAL ICON NAMES (sprach-unabhängig)
// ============================================================================

const REPORT_TYPES = {
  temporarily_closed: {
    id: 'temporarily_closed',
    de: 'Vorübergehend geschlossen',
    en: 'Temporarily closed',
    icon: 'schedule', // or 'access_time'
    hasFollowUp: false,
  },
  permanently_closed: {
    id: 'permanently_closed',
    de: 'Dauerhaft geschlossen',
    en: 'Permanently closed',
    icon: 'block', // or 'cancel'
    hasFollowUp: false,
  },
  doesnt_exist: {
    id: 'doesnt_exist',
    de: 'Existiert hier nicht',
    en: "Doesn't exist here",
    icon: 'wrong_location',
    hasFollowUp: false,
  },
  duplicate: {
    id: 'duplicate',
    de: 'Duplikat eines anderen Orts',
    en: 'Duplicate of another place',
    icon: 'content_copy', // or 'file_copy'
    hasFollowUp: true,
    followUpHint: 'Bitte das Duplikat-Ziel auswählen',
  },
  offensive: {
    id: 'offensive',
    de: 'Anstößig, schädlich oder irreführend',
    en: 'Offensive, harmful or misleading',
    icon: 'report', // or 'warning'
    hasFollowUp: false,
  },
  not_public: {
    id: 'not_public',
    de: 'Nicht öffentlich zugänglich',
    en: 'Not open to the public',
    icon: 'lock', // or 'lock_outline'
    hasFollowUp: false,
  },
  moved: {
    id: 'moved',
    de: 'An einen neuen Standort umgezogen',
    en: 'Moved to a new location',
    icon: 'moving', // or 'swap_horiz'
    hasFollowUp: true,
    followUpHint: 'Bitte den neuen Standort eingeben',
  },
  other: {
    id: 'other',
    de: 'Sonstiges',
    en: 'Other',
    icon: 'more_horiz', // or 'help_outline'
    hasFollowUp: true,
    followUpHint: 'Bitte den Grund eingeben',
  },
};

const DEFAULT_REPORT_TYPE = 'doesnt_exist';

// ============================================================================
// TEXT-PATTERNS FÜR VERSCHIEDENE SPRACHEN
// ============================================================================

const TEXT_PATTERNS = {
  suggest_edit: [
    'suggest an edit',
    'änderung vorschlagen',
    'edit information',
    'informationen bearbeiten',
  ],

  place_closed: [
    'place is closed or not here',
    'closed or not here',
    'close or remove',
    'geschlossen oder nicht vorhanden',
    'schließen oder entfernen',
    'operating status',
    'betriebsstatus',
  ],

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
    'existiert hier nicht',
    'existiert nicht',
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
    'anstößig, schädlich oder irreführend',
    'anstößig',
  ],
  
  not_public: [
    'not open to the public',
    'not public',
    'nicht öffentlich zugänglich',
    'nicht öffentlich',
  ],
  
  moved: [
    'moved to a new location',
    'moved',
    'an einen neuen standort umgezogen',
    'umgezogen',
  ],
  
  other: [
    'other',
    'sonstiges',
  ],

  submit: ['submit', 'send', 'senden', 'absenden'],
  cancel: ['cancel', 'close', 'abbrechen', 'schließen'],
};

// ============================================================================
// DOM SELEKTOREN (basierend auf Oktober 2026 DOM-Struktur)
// Klassen sind obfuskiert - Text/Icon/Struktur bevorzugen!
// ============================================================================

const SELECTORS = {
  // Option row container
  optionRow: '[jsaction*="iktSbe"]', // div.ATgAzb with jsaction
  optionRowAlt: '.ATgAzb', // Fallback class
  
  // Option text span
  optionTextSpan: '.GoAIrd', // span with option text
  optionLabel: '.ZPCMMc', // label element
  
  // Material icon
  materialIcon: '.google-material-icons, .material-icons, [class*="material-icons"]',
  
  // Radio wrapper
  radioWrapper: '[data-is-touch-wrapper="true"]',
  radioInput: 'input[type="radio"]',
  
  // Expanded description after selection
  expandedSection: '[data-expanded="true"]',
  
  // "Suggest an edit" button
  suggestEdit: [
    'button[aria-label*="Suggest an edit" i]',
    'button[aria-label*="Änderung vorschlagen" i]',
    '[data-item-id="suggest_edit"]',
    'a[aria-label*="Suggest an edit" i]',
  ],

  // "Place is closed or not here" option
  placeClosedOption: [
    'button[aria-label*="closed" i]',
    'button[aria-label*="not here" i]',
    'button[aria-label*="geschlossen" i]',
  ],

  // Submit/Cancel buttons
  submitButton: [
    'button[aria-label*="Submit" i]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Senden" i]',
  ],
};

// ============================================================================
// MATERIAL ICON NAME MAPPING (language-independent)
// ============================================================================

const ICON_TO_TYPE = {
  'wrong_location': 'doesnt_exist',
  'location_off': 'doesnt_exist',
  'schedule': 'temporarily_closed',
  'access_time': 'temporarily_closed',
  'hourglass_empty': 'temporarily_closed',
  'block': 'permanently_closed',
  'cancel': 'permanently_closed',
  'do_not_disturb': 'permanently_closed',
  'content_copy': 'duplicate',
  'file_copy': 'duplicate',
  'filter_none': 'duplicate',
  'report': 'offensive',
  'warning': 'offensive',
  'flag': 'offensive',
  'lock': 'not_public',
  'lock_outline': 'not_public',
  'vpn_lock': 'not_public',
  'moving': 'moved',
  'swap_horiz': 'moved',
  'compare_arrows': 'moved',
  'place': 'moved',
  'more_horiz': 'other',
  'help_outline': 'other',
  'help': 'other',
};

// ============================================================================
// TEXT-NORMALISIERUNG
// ============================================================================

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u02BB\u02BC\u02BD\u02BE\u02BF\u02C8\u02CA\u0027\u0060\u00B4\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFullText(el) {
  if (!el) return '';
  return normalizeText(el.textContent || el.innerText || '');
}

function getAriaLabel(el) {
  if (!el) return '';
  return normalizeText(el.getAttribute('aria-label') || '');
}

// ============================================================================
// ELEMENT HELPERS
// ============================================================================

function isVisible(el) {
  if (!el) return false;
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
      if (el && isVisible(el)) return el;
    } catch (e) {}
  }
  return null;
}

function findClickableByText(textPatterns, context = document) {
  const normalizedPatterns = textPatterns.map(p => normalizeText(p));
  
  // Search in buttons, links, and clickable elements
  const clickables = context.querySelectorAll('button, a, [role="button"], [tabindex], [jsaction]');
  
  for (const el of clickables) {
    if (!isVisible(el)) continue;
    
    const fullText = getFullText(el);
    const ariaLabel = getAriaLabel(el);
    
    for (const pattern of normalizedPatterns) {
      if (fullText.includes(pattern) || ariaLabel.includes(pattern)) {
        console.log(`[RR-MeldeHelper] Found clickable: "${pattern}" in "${fullText.substring(0, 50)}"`);
        return el;
      }
    }
  }
  
  // Search in spans and find clickable parent
  const spans = context.querySelectorAll('span, div');
  for (const span of spans) {
    if (!isVisible(span)) continue;
    
    const fullText = getFullText(span);
    
    for (const pattern of normalizedPatterns) {
      if (fullText.includes(pattern)) {
        // Find clickable parent
        let parent = span.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          if (parent.tagName === 'BUTTON' || parent.tagName === 'A' ||
              parent.hasAttribute('jsaction') || parent.hasAttribute('tabindex')) {
            return parent;
          }
          parent = parent.parentElement;
        }
        return span;
      }
    }
  }
  
  return null;
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
  window.REPORT_TYPES = REPORT_TYPES;
  window.TEXT_PATTERNS = TEXT_PATTERNS;
  window.SELECTORS = SELECTORS;
  window.ICON_TO_TYPE = ICON_TO_TYPE;
  window.DEFAULT_REPORT_TYPE = DEFAULT_REPORT_TYPE;
  
  window.normalizeText = normalizeText;
  window.getFullText = getFullText;
  window.getAriaLabel = getAriaLabel;
  window.isVisible = isVisible;
  window.findElement = findElement;
  window.findClickableByText = findClickableByText;
}

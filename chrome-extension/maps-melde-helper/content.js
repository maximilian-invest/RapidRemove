/**
 * RapidRemove Maps Melde-Helper - Content Script v1.2.4
 * 
 * DOM-Struktur für Operating Status Optionen (Oktober 2026):
 * <div class="ATgAzb" jsaction="JIbuQc:iktSbe;">
 *   <i class="google-material-icons">wrong_location</i>
 *   <label class="ZPCMMc">
 *     <span class="GoAIrd">Doesn't exist here</span>
 *     <div data-is-touch-wrapper="true">...</div>
 *   </label>
 * </div>
 */

(() => {
  'use strict';
  
  const FRAME_URL = window.location.href;
  const IS_TOP = window === window.top;
  const FRAME_ID = IS_TOP ? 'TOP' : 'IFRAME';
  
  // ==========================================
  // Frame Filtering - nur relevante Frames
  // ==========================================
  
  function isIrrelevantFrame() {
    const url = FRAME_URL.toLowerCase();
    
    // Ausschließen: Cookie-Rotation, Accounts, Consent
    if (url.includes('accounts.google.com')) return true;
    if (url.includes('rotatecookiespage')) return true;
    if (url.includes('consent.google.com')) return true;
    if (url.includes('ogs.google.com')) return true;
    if (url.includes('play.google.com')) return true;
    if (url === 'about:blank') return true;
    if (url === 'about:srcdoc') return true;
    
    // Für Iframes: nur Maps/Local relevant
    if (!IS_TOP) {
      const isRelevant = url.includes('/maps') || url.includes('/local');
      if (!isRelevant) return true;
    }
    
    return false;
  }
  
  if (isIrrelevantFrame()) {
    console.log(`[RR-MeldeHelper] Skipping irrelevant frame: ${FRAME_URL.substring(0, 60)}`);
    return;
  }
  
  console.log(`[RR-MeldeHelper] [${FRAME_ID}] Loaded in: ${FRAME_URL.substring(0, 80)}`);
  
  // Verhindere mehrfache Initialisierung
  if (window.__RR_MELDE_HELPER_LOADED__) return;
  window.__RR_MELDE_HELPER_LOADED__ = true;
  
  let statusOverlay = null;
  
  // ==========================================
  // Status Overlay
  // ==========================================
  
  function showStatus(text, isError = false) {
    removeStatus();
    statusOverlay = document.createElement('div');
    statusOverlay.className = `rr-status-overlay ${isError ? 'rr-error' : ''}`;
    statusOverlay.textContent = text;
    document.body.appendChild(statusOverlay);
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Status: ${text}${isError ? ' (ERROR)' : ''}`);
  }
  
  function removeStatus() {
    statusOverlay?.remove();
    statusOverlay = null;
    document.querySelectorAll('.rr-status-overlay').forEach(el => el.remove());
  }
  
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  // ==========================================
  // Operating Status Option Finder (neue Logik)
  // ==========================================
  
  /**
   * Findet eine Operating Status Option anhand:
   * 1. Text in span.GoAIrd (oder ähnliche Text-Spans)
   * 2. Material Icon Name als Fallback
   */
  function findOperatingStatusOption(targetType) {
    const patterns = TEXT_PATTERNS[targetType];
    const reportType = REPORT_TYPES[targetType];
    
    if (!patterns) {
      console.error(`[RR-MeldeHelper] Unknown type: ${targetType}`);
      return null;
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Finding option for: ${targetType}`);
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Patterns:`, patterns.slice(0, 3));
    
    // Method 1: Finde span.GoAIrd mit passendem Text
    const optionSpans = document.querySelectorAll('span.GoAIrd, span[class*="GoAIrd"], label span');
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found ${optionSpans.length} option spans`);
    
    for (const span of optionSpans) {
      const text = normalizeText(span.textContent || '');
      
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        if (text.includes(normalizedPattern) || text === normalizedPattern) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] MATCH: "${text}" ~ "${pattern}"`);
          return findClickableParent(span);
        }
      }
    }
    
    // Method 2: Finde über Material Icon
    if (reportType?.icon) {
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] Trying icon fallback: ${reportType.icon}`);
      const icons = document.querySelectorAll('.google-material-icons, .material-icons, i[class*="material"]');
      
      for (const icon of icons) {
        const iconText = (icon.textContent || '').trim().toLowerCase();
        if (iconText === reportType.icon || ICON_TO_TYPE[iconText] === targetType) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] MATCH via icon: ${iconText}`);
          return findClickableParent(icon);
        }
      }
    }
    
    // Method 3: Suche in allen Textelementen
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Trying full text search...`);
    const allElements = document.querySelectorAll('span, div, label');
    
    for (const el of allElements) {
      if (!isVisible(el)) continue;
      
      const text = normalizeText(el.textContent || '');
      // Nur kleine Elemente prüfen (keine großen Container)
      if (text.length > 100) continue;
      
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        if (text === normalizedPattern || (text.length < normalizedPattern.length * 2 && text.includes(normalizedPattern))) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] MATCH in ${el.tagName}: "${text}"`);
          return findClickableParent(el);
        }
      }
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] No match found for ${targetType}`);
    return null;
  }
  
  /**
   * Findet den klickbaren Parent für ein gefundenes Element
   * Priorität: div[jsaction] > label > input[type=radio]
   */
  function findClickableParent(el) {
    let current = el;
    
    // Gehe hoch bis zu 6 Ebenen
    for (let i = 0; i < 6 && current; i++) {
      // div mit jsaction ist der Haupt-Container
      if (current.hasAttribute('jsaction')) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Clickable: div[jsaction]`, current.className);
        return current;
      }
      current = current.parentElement;
    }
    
    // Fallback: Suche input[type=radio] im selben Container
    current = el;
    for (let i = 0; i < 6 && current; i++) {
      const radio = current.querySelector('input[type="radio"]');
      if (radio) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Clickable: input[type=radio]`);
        return radio;
      }
      
      // Oder label als Clickable
      if (current.tagName === 'LABEL') {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Clickable: label`);
        return current;
      }
      
      current = current.parentElement;
    }
    
    // Letzter Fallback: das Element selbst
    return el;
  }
  
  /**
   * Debug: Logge alle Option-Elemente
   */
  function debugLogOptionElements() {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] === DEBUG: Option Elements ===`);
    
    // Log span.GoAIrd elements
    const spans = document.querySelectorAll('span.GoAIrd, span[class*="GoAIrd"]');
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] span.GoAIrd elements: ${spans.length}`);
    
    spans.forEach((span, i) => {
      const text = span.textContent?.trim();
      const parent = span.closest('[jsaction]');
      const icon = parent?.querySelector('.google-material-icons, .material-icons');
      console.log(`[RR-MeldeHelper] [${FRAME_ID}]   ${i}: "${text}" | icon: "${icon?.textContent?.trim() || 'none'}"`);
    });
    
    // Log all material icons and their parent text
    const icons = document.querySelectorAll('.google-material-icons, .material-icons');
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Material icons: ${icons.length}`);
    
    icons.forEach((icon, i) => {
      const iconName = icon.textContent?.trim();
      const row = icon.closest('[jsaction]');
      const rowText = row?.textContent?.substring(0, 60).replace(/\s+/g, ' ').trim();
      if (rowText?.length > 10) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}]   ${i}: icon="${iconName}" | row="${rowText}"`);
      }
    });
    
    // Debug: Elemente mit "doesn't" oder "existiert"
    const searchTerms = ["doesn't", "doesn", "exist", "existiert", "closed", "geschlossen"];
    for (const term of searchTerms) {
      const elements = [...document.querySelectorAll('*')].filter(el => 
        el.textContent?.toLowerCase().includes(term) && 
        el.textContent.length < 150 &&
        el.children.length < 3
      );
      if (elements.length > 0 && elements.length < 10) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Elements with "${term}":`);
        elements.forEach(el => {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}]   <${el.tagName.toLowerCase()} class="${el.className}">: "${el.textContent?.substring(0, 80)}"`);
          console.log(`[RR-MeldeHelper] [${FRAME_ID}]   outerHTML: ${el.outerHTML?.substring(0, 300)}`);
        });
      }
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] === END DEBUG ===`);
  }
  
  async function waitForOperatingStatusOption(targetType, timeout = 12000) {
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < timeout) {
      attempts++;
      
      // Debug bei erstem Versuch
      if (attempts === 1) {
        debugLogOptionElements();
      }
      
      const option = findOperatingStatusOption(targetType);
      if (option) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found after ${attempts} attempts`);
        return option;
      }
      
      // Log progress alle 5 Versuche
      if (attempts % 5 === 0) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Attempt ${attempts}...`);
      }
      
      await sleep(400);
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Timeout after ${attempts} attempts`);
    debugLogOptionElements(); // Final debug
    return null;
  }
  
  // ==========================================
  // Click Helper
  // ==========================================
  
  function clickElement(el) {
    if (!el) return false;
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Click: <${el.tagName.toLowerCase()}> class="${(el.className || '').substring(0, 40)}"`);
    
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
    
    // Focus + Click
    el.focus?.();
    el.click();
    
    // MouseEvents
    ['mousedown', 'mouseup', 'click'].forEach(type => {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    });
    
    // Für Inputs
    if (el.type === 'radio') {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    return true;
  }
  
  // ==========================================
  // Confirmation Dialog
  // ==========================================
  
  function showConfirmDialog(reportType, testMode) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'rr-confirm-overlay';
      
      const dialog = document.createElement('div');
      dialog.className = 'rr-confirm-dialog';
      
      const typeLabel = REPORT_TYPES[reportType]?.de || reportType;
      
      if (testMode) {
        dialog.innerHTML = `
          <div class="rr-confirm-title">🧪 Test abgeschlossen</div>
          <div class="rr-confirm-text">
            Option "<strong>${typeLabel}</strong>" wurde ausgewählt.<br>
            <em>Im Test-Modus wird NICHT abgesendet.</em>
          </div>
          <div class="rr-confirm-buttons">
            <button class="rr-btn rr-btn-primary" data-action="ok">OK</button>
          </div>
        `;
      } else {
        dialog.innerHTML = `
          <div class="rr-confirm-title">⚠️ Meldung absenden?</div>
          <div class="rr-confirm-text">
            "<strong>${typeLabel}</strong>" an Google senden?<br>
            <em>Kann nicht rückgängig gemacht werden.</em>
          </div>
          <div class="rr-confirm-buttons">
            <button class="rr-btn rr-btn-cancel" data-action="no">Abbrechen</button>
            <button class="rr-btn rr-btn-danger" data-action="yes">Ja, absenden</button>
          </div>
        `;
      }
      
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      dialog.addEventListener('click', (e) => {
        const action = e.target.dataset?.action;
        if (action) {
          overlay.remove();
          resolve(action === 'yes' || action === 'ok');
        }
      });
    });
  }
  
  // ==========================================
  // Submit Button
  // ==========================================
  
  function findSubmitButton() {
    const patterns = ['submit', 'senden', 'absenden', 'send'];
    const buttons = document.querySelectorAll('button');
    
    for (const btn of buttons) {
      if (!isVisible(btn)) continue;
      
      const text = normalizeText(btn.textContent || '');
      const aria = normalizeText(btn.getAttribute('aria-label') || '');
      
      for (const p of patterns) {
        if ((text.includes(p) || aria.includes(p)) && !text.includes('cancel') && !text.includes('abbrechen')) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] Submit: "${text}"`);
          return btn;
        }
      }
    }
    return null;
  }
  
  // ==========================================
  // Main Flow
  // ==========================================
  
  async function executeRadioSelection(reportType, reason, orderId, testMode) {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Select: ${reportType}`);
    
    showStatus(`Suche "${REPORT_TYPES[reportType]?.de || reportType}"...`);
    
    const option = await waitForOperatingStatusOption(reportType, 12000);
    
    if (!option) {
      showStatus(`"${REPORT_TYPES[reportType]?.de}" nicht gefunden`, true);
      chrome.runtime.sendMessage({
        type: 'REPORT_ERROR', reportType, orderId,
        error: `Option nicht gefunden`, url: FRAME_URL, testMode,
      });
      return false;
    }
    
    showStatus(`Wähle: ${REPORT_TYPES[reportType]?.de}`);
    clickElement(option);
    await sleep(1000);
    
    // Follow-up fields
    if (reason) {
      await sleep(500);
      const inputs = document.querySelectorAll('textarea, input[type="text"]');
      for (const input of inputs) {
        if (isVisible(input)) {
          input.value = reason;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
    
    if (testMode) {
      showStatus('🧪 Test OK (kein Submit)');
      await showConfirmDialog(reportType, true);
      removeStatus();
      chrome.runtime.sendMessage({ type: 'TEST_COMPLETE', reportType, orderId, url: FRAME_URL });
      return true;
    }
    
    const confirmed = await showConfirmDialog(reportType, false);
    
    if (!confirmed) {
      showStatus('Abgebrochen');
      chrome.runtime.sendMessage({ type: 'REPORT_ABORTED', reportType, orderId, url: FRAME_URL });
      await sleep(2000);
      removeStatus();
      return false;
    }
    
    const submitBtn = findSubmitButton();
    if (submitBtn) {
      showStatus('Sende...');
      clickElement(submitBtn);
      await sleep(1500);
      showStatus('✓ Gesendet!');
      chrome.runtime.sendMessage({ type: 'REPORT_SUCCESS', reportType, orderId, url: FRAME_URL });
    } else {
      showStatus('Submit nicht gefunden', true);
      chrome.runtime.sendMessage({ type: 'REPORT_ERROR', reportType, orderId, error: 'Submit fehlt', url: FRAME_URL });
    }
    
    await sleep(3000);
    removeStatus();
    return true;
  }
  
  async function startReport(reportType, reason, orderId, testMode) {
    console.log(`[RR-MeldeHelper] [TOP] Start: ${reportType}`);
    
    // Step 1: "Suggest an edit"
    showStatus('Suche "Änderung vorschlagen"...');
    
    const suggestBtn = await waitForElement(() => findClickableByText(TEXT_PATTERNS.suggest_edit), 5000);
    
    if (!suggestBtn) {
      showStatus('"Änderung vorschlagen" nicht gefunden', true);
      chrome.runtime.sendMessage({ type: 'REPORT_ERROR', reportType, orderId, error: '"Suggest edit" fehlt', url: FRAME_URL, testMode });
      return;
    }
    
    showStatus('Klicke "Änderung vorschlagen"...');
    clickElement(suggestBtn);
    await sleep(1500);
    
    // Step 2: "Place is closed or not here"
    showStatus('Suche "Geschlossen oder nicht vorhanden"...');
    
    const closedBtn = await waitForElement(() => findClickableByText(TEXT_PATTERNS.place_closed), 5000);
    
    if (!closedBtn) {
      showStatus('"Geschlossen" nicht gefunden', true);
      chrome.runtime.sendMessage({ type: 'REPORT_ERROR', reportType, orderId, error: '"Closed" fehlt', url: FRAME_URL, testMode });
      return;
    }
    
    showStatus('Klicke "Geschlossen oder nicht vorhanden"...');
    clickElement(closedBtn);
    await sleep(1500);
    
    // Step 3: Select operating status option
    await executeRadioSelection(reportType, reason, orderId, testMode);
  }
  
  async function waitForElement(finder, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const el = finder();
      if (el) return el;
      await sleep(200);
    }
    return null;
  }
  
  // ==========================================
  // Message Handler
  // ==========================================
  
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Msg: ${msg.type}`);
    
    if ((msg.type === 'REPORT_START' || msg.type === 'START_MELDE_FLOW') && IS_TOP) {
      startReport(msg.reportType, msg.reason, msg.orderId, msg.testMode);
      sendResponse({ received: true });
    } else if (msg.type === 'PING') {
      sendResponse({ pong: true, isTop: IS_TOP });
    }
    return true;
  });
  
  // ==========================================
  // Init
  // ==========================================
  
  function init() {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Init`);
    
    // Auto-start von URL
    if (IS_TOP) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('rr_melden') === '1') {
        const reportType = params.get('rr_type') || 'doesnt_exist';
        const reason = params.get('rr_reason') || '';
        const orderId = params.get('rr_order') || '';
        const testMode = params.get('rr_test') === '1';
        
        console.log(`[RR-MeldeHelper] [TOP] Auto-start: ${reportType}`);
        setTimeout(() => startReport(reportType, reason, orderId, testMode), 2000);
      }
    }
    
    chrome.runtime.sendMessage({ type: 'FRAME_READY', frameUrl: FRAME_URL, isTop: IS_TOP }).catch(() => {});
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

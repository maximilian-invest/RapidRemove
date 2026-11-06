/**
 * RapidRemove Maps Melde-Helper - Content Script v1.2.5
 * 
 * Fixes:
 * - Status overlay in closed shadow root (isoliert von DOM-Suche)
 * - Eigene UI-Elemente von Suche ausgeschlossen
 * - Explizites Handling: Edit Info → Operating Status → Option auswählen
 * - Nur Google-Dialog-Elemente werden durchsucht
 */

(() => {
  'use strict';
  
  const FRAME_URL = window.location.href;
  const IS_TOP = window === window.top;
  const FRAME_ID = IS_TOP ? 'TOP' : 'IFRAME';
  
  // ==========================================
  // Frame Filtering
  // ==========================================
  
  function isIrrelevantFrame() {
    const url = FRAME_URL.toLowerCase();
    if (url.includes('accounts.google.com')) return true;
    if (url.includes('rotatecookiespage')) return true;
    if (url.includes('consent.google.com')) return true;
    if (url.includes('ogs.google.com')) return true;
    if (url.includes('play.google.com')) return true;
    if (url === 'about:blank' || url === 'about:srcdoc') return true;
    
    if (!IS_TOP && !url.includes('/maps') && !url.includes('/local')) return true;
    
    return false;
  }
  
  if (isIrrelevantFrame()) {
    console.log(`[RR-MeldeHelper] Skip: ${FRAME_URL.substring(0, 60)}`);
    return;
  }
  
  console.log(`[RR-MeldeHelper] [${FRAME_ID}] v1.2.5 in: ${FRAME_URL.substring(0, 80)}`);
  
  if (window.__RR_MELDE_HELPER_LOADED__) return;
  window.__RR_MELDE_HELPER_LOADED__ = true;
  
  // ==========================================
  // Status Overlay in Shadow DOM (isoliert)
  // ==========================================
  
  let overlayHost = null;
  let shadowRoot = null;
  
  function createOverlayHost() {
    if (overlayHost) return;
    
    overlayHost = document.createElement('rr-melde-helper');
    overlayHost.id = 'rr-melde-helper-host';
    overlayHost.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; pointer-events: none;';
    document.body.appendChild(overlayHost);
    
    // Closed shadow root - nicht von außen durchsuchbar
    shadowRoot = overlayHost.attachShadow({ mode: 'closed' });
    
    // Styles in shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      .rr-status-overlay {
        position: fixed;
        top: 16px;
        right: 16px;
        background: #1a73e8;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font: 14px/1.4 Roboto, Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 2147483647;
        pointer-events: auto;
      }
      .rr-status-overlay.rr-error {
        background: #d93025;
      }
      .rr-confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
        pointer-events: auto;
      }
      .rr-confirm-dialog {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        font-family: Roboto, Arial, sans-serif;
      }
      .rr-confirm-title {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 12px;
      }
      .rr-confirm-text {
        font-size: 14px;
        color: #5f6368;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .rr-confirm-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      .rr-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }
      .rr-btn-cancel { background: #f1f3f4; color: #5f6368; }
      .rr-btn-danger { background: #d93025; color: white; }
      .rr-btn-primary { background: #1a73e8; color: white; }
    `;
    shadowRoot.appendChild(style);
  }
  
  function showStatus(text, isError = false) {
    createOverlayHost();
    removeStatus();
    
    const overlay = document.createElement('div');
    overlay.className = `rr-status-overlay ${isError ? 'rr-error' : ''}`;
    overlay.textContent = text;
    shadowRoot.appendChild(overlay);
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Status: ${text}${isError ? ' (ERROR)' : ''}`);
  }
  
  function removeStatus() {
    if (shadowRoot) {
      shadowRoot.querySelectorAll('.rr-status-overlay').forEach(el => el.remove());
    }
  }
  
  function showConfirmDialog(reportType, testMode) {
    createOverlayHost();
    
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
      shadowRoot.appendChild(overlay);
      
      dialog.addEventListener('click', (e) => {
        const action = e.target.dataset?.action;
        if (action) {
          overlay.remove();
          resolve(action === 'yes' || action === 'ok');
        }
      });
    });
  }
  
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  // ==========================================
  // Element Filtering - Eigene UI ausschließen
  // ==========================================
  
  function isOurElement(el) {
    if (!el) return false;
    
    // Check if inside our shadow host
    if (el.closest?.('rr-melde-helper')) return true;
    if (el.closest?.('#rr-melde-helper-host')) return true;
    
    // Check for rr- classes
    const className = el.className || '';
    if (typeof className === 'string' && className.includes('rr-')) return true;
    
    // Check parents
    let parent = el.parentElement;
    for (let i = 0; i < 10 && parent; i++) {
      if (parent.tagName === 'RR-MELDE-HELPER') return true;
      if (parent.id === 'rr-melde-helper-host') return true;
      parent = parent.parentElement;
    }
    
    return false;
  }
  
  function isGoogleDialogElement(el) {
    if (!el) return false;
    
    // Must not be our element
    if (isOurElement(el)) return false;
    
    // Should be inside the Google dialog area
    // Look for common Google Maps dialog indicators
    const dialog = el.closest('[role="dialog"], [role="main"], [jscontroller], [class*="section-"], [class*="widget-"]');
    return dialog !== null;
  }
  
  // ==========================================
  // Operating Status Option Finder
  // ==========================================
  
  /**
   * Finde alle span.GoAIrd und logge ihren Inhalt
   */
  function debugLogGoAIrdSpans() {
    const spans = document.querySelectorAll('span.GoAIrd, span[class*="GoAIrd"]');
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found ${spans.length} span.GoAIrd elements:`);
    
    spans.forEach((span, i) => {
      if (isOurElement(span)) return;
      
      const text = span.textContent?.trim() || '';
      const row = span.closest('[jsaction]');
      const icon = row?.querySelector('.google-material-icons, .material-icons');
      const iconText = icon?.textContent?.trim() || 'no-icon';
      
      console.log(`[RR-MeldeHelper] [${FRAME_ID}]   ${i}: "${text}" | icon: "${iconText}"`);
    });
    
    return spans.length;
  }
  
  /**
   * Prüfe ob wir auf der "Edit information" Hauptliste sind
   * (zeigt: Name, Category, Address, Hours, Phone, Website, Operating status...)
   */
  function isOnEditInformationScreen() {
    const indicators = [
      'operating status',
      'betriebsstatus',
      'place is closed',
      'geschlossen oder nicht',
    ];
    
    const spans = document.querySelectorAll('span.GoAIrd, span[class*="GoAIrd"], span');
    
    for (const span of spans) {
      if (isOurElement(span)) continue;
      
      const text = normalizeText(span.textContent || '');
      for (const indicator of indicators) {
        if (text.includes(indicator)) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] On Edit Information screen (found: "${text.substring(0, 40)}")`);
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Prüfe ob die Operating Status Optionen sichtbar sind
   * (8 Optionen: Temporarily closed, Permanently closed, Doesn't exist, etc.)
   */
  function hasOperatingStatusOptions() {
    const optionIndicators = [
      "doesn't exist",
      "doesnt exist",
      "existiert hier nicht",
      "temporarily closed",
      "vorübergehend geschlossen",
      "permanently closed",
      "dauerhaft geschlossen",
      "duplicate of",
      "duplikat",
    ];
    
    let foundCount = 0;
    const spans = document.querySelectorAll('span.GoAIrd, span[class*="GoAIrd"], label span');
    
    for (const span of spans) {
      if (isOurElement(span)) continue;
      
      const text = normalizeText(span.textContent || '');
      for (const indicator of optionIndicators) {
        if (text.includes(indicator)) {
          foundCount++;
          break;
        }
      }
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Operating status options visible: ${foundCount >= 3}`);
    return foundCount >= 3;
  }
  
  /**
   * Klicke auf "Operating status" / "Place is closed or not here" um die Optionen zu öffnen
   */
  async function clickOperatingStatusEntry() {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Looking for Operating status entry...`);
    
    const patterns = [
      'operating status',
      'betriebsstatus',
      'place is closed or not here',
      'geschlossen oder nicht vorhanden',
      'close or remove',
      'schließen oder entfernen',
    ];
    
    // Suche in allen Spans
    const allSpans = document.querySelectorAll('span, div');
    
    for (const el of allSpans) {
      if (isOurElement(el)) continue;
      if (!isVisible(el)) continue;
      
      const text = normalizeText(el.textContent || '');
      
      // Nur kleine Elemente (nicht ganze Container)
      if (text.length > 60) continue;
      
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found entry: "${text}"`);
          
          // Finde klickbaren Parent
          const clickable = findClickableParent(el);
          if (clickable && !isOurElement(clickable)) {
            console.log(`[RR-MeldeHelper] [${FRAME_ID}] Clicking: <${clickable.tagName.toLowerCase()}>`);
            clickElement(clickable);
            return true;
          }
        }
      }
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Operating status entry not found`);
    return false;
  }
  
  /**
   * Finde die spezifische Operating Status Option
   */
  function findOperatingStatusOption(targetType) {
    const patterns = TEXT_PATTERNS[targetType];
    const reportType = REPORT_TYPES[targetType];
    
    if (!patterns) {
      console.error(`[RR-MeldeHelper] Unknown type: ${targetType}`);
      return null;
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Finding: ${targetType}`);
    
    // Suche in span.GoAIrd
    const optionSpans = document.querySelectorAll('span.GoAIrd, span[class*="GoAIrd"], label span');
    
    for (const span of optionSpans) {
      if (isOurElement(span)) continue;
      if (!isVisible(span)) continue;
      
      const text = normalizeText(span.textContent || '');
      
      for (const pattern of patterns) {
        const normalizedPattern = normalizeText(pattern);
        if (text === normalizedPattern || text.includes(normalizedPattern)) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] MATCH span: "${text}"`);
          
          const clickable = findClickableParent(span);
          if (clickable && !isOurElement(clickable)) {
            return clickable;
          }
        }
      }
    }
    
    // Icon-Fallback
    if (reportType?.icon) {
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] Trying icon: ${reportType.icon}`);
      const icons = document.querySelectorAll('.google-material-icons, .material-icons');
      
      for (const icon of icons) {
        if (isOurElement(icon)) continue;
        
        const iconText = (icon.textContent || '').trim().toLowerCase();
        if (iconText === reportType.icon) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] MATCH icon: ${iconText}`);
          
          const clickable = findClickableParent(icon);
          if (clickable && !isOurElement(clickable)) {
            return clickable;
          }
        }
      }
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Option not found`);
    return null;
  }
  
  function findClickableParent(el) {
    let current = el;
    
    for (let i = 0; i < 6 && current; i++) {
      if (isOurElement(current)) return null;
      
      // div[jsaction] ist der Haupt-Container
      if (current.hasAttribute?.('jsaction')) {
        return current;
      }
      
      // Andere klickbare Elemente
      if (current.tagName === 'BUTTON' || current.tagName === 'A') {
        return current;
      }
      
      if (current.hasAttribute?.('tabindex') && current.getAttribute('tabindex') !== '-1') {
        return current;
      }
      
      if (current.getAttribute?.('role') === 'button' || 
          current.getAttribute?.('role') === 'radio' ||
          current.getAttribute?.('role') === 'option') {
        return current;
      }
      
      current = current.parentElement;
    }
    
    // Fallback: input[type=radio] suchen
    const radio = el.closest?.('[jsaction]')?.querySelector('input[type="radio"]');
    if (radio && !isOurElement(radio)) return radio;
    
    // Label als Fallback
    const label = el.closest?.('label');
    if (label && !isOurElement(label)) return label;
    
    return null;
  }
  
  async function waitForOperatingStatusOptions(timeout = 8000) {
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < timeout) {
      attempts++;
      
      if (hasOperatingStatusOptions()) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Options visible after ${attempts} attempts`);
        return true;
      }
      
      await sleep(400);
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Options not found after ${attempts} attempts`);
    return false;
  }
  
  // ==========================================
  // Click Helper
  // ==========================================
  
  function clickElement(el) {
    if (!el || isOurElement(el)) {
      console.error(`[RR-MeldeHelper] [${FRAME_ID}] Refusing to click invalid/own element`);
      return false;
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Click: <${el.tagName.toLowerCase()}> class="${(el.className || '').toString().substring(0, 40)}"`);
    
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
    el.focus?.();
    el.click();
    
    ['mousedown', 'mouseup', 'click'].forEach(type => {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    });
    
    if (el.type === 'radio') {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    return true;
  }
  
  // ==========================================
  // Submit Button
  // ==========================================
  
  function findSubmitButton() {
    const patterns = ['submit', 'senden', 'absenden', 'send'];
    const buttons = document.querySelectorAll('button');
    
    for (const btn of buttons) {
      if (isOurElement(btn)) continue;
      if (!isVisible(btn)) continue;
      
      const text = normalizeText(btn.textContent || '');
      const aria = normalizeText(btn.getAttribute('aria-label') || '');
      
      for (const p of patterns) {
        if ((text.includes(p) || aria.includes(p)) && !text.includes('cancel') && !text.includes('abbrechen')) {
          return btn;
        }
      }
    }
    return null;
  }
  
  // ==========================================
  // Main Flow
  // ==========================================
  
  async function executeOptionSelection(reportType, reason, orderId, testMode) {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Selecting: ${reportType}`);
    
    // Debug: Was ist sichtbar?
    debugLogGoAIrdSpans();
    
    showStatus(`Suche "${REPORT_TYPES[reportType]?.de || reportType}"...`);
    
    // Schritt 1: Prüfen ob wir auf "Edit information" sind und "Operating status" klicken müssen
    if (!hasOperatingStatusOptions()) {
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] Operating status options not visible, looking for entry...`);
      
      const clicked = await clickOperatingStatusEntry();
      if (clicked) {
        await sleep(1500);
        
        // Warte auf die Optionen
        const optionsVisible = await waitForOperatingStatusOptions(8000);
        if (!optionsVisible) {
          showStatus('Operating Status Optionen nicht gefunden', true);
          chrome.runtime.sendMessage({
            type: 'REPORT_ERROR', reportType, orderId,
            error: 'Operating Status Optionen nicht sichtbar', url: FRAME_URL, testMode,
          });
          return false;
        }
        
        // Debug nach Klick
        debugLogGoAIrdSpans();
      } else {
        showStatus('Operating Status Entry nicht gefunden', true);
        chrome.runtime.sendMessage({
          type: 'REPORT_ERROR', reportType, orderId,
          error: 'Operating Status Entry nicht gefunden', url: FRAME_URL, testMode,
        });
        return false;
      }
    }
    
    // Schritt 2: Die spezifische Option finden und klicken
    await sleep(500);
    const option = findOperatingStatusOption(reportType);
    
    if (!option) {
      showStatus(`"${REPORT_TYPES[reportType]?.de}" nicht gefunden`, true);
      chrome.runtime.sendMessage({
        type: 'REPORT_ERROR', reportType, orderId,
        error: `Option ${reportType} nicht gefunden`, url: FRAME_URL, testMode,
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
        if (isOurElement(input)) continue;
        if (isVisible(input)) {
          input.value = reason;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
    
    // Test mode
    if (testMode) {
      showStatus('🧪 Test OK (kein Submit)');
      await showConfirmDialog(reportType, true);
      removeStatus();
      chrome.runtime.sendMessage({ type: 'TEST_COMPLETE', reportType, orderId, url: FRAME_URL });
      return true;
    }
    
    // Confirm
    const confirmed = await showConfirmDialog(reportType, false);
    
    if (!confirmed) {
      showStatus('Abgebrochen');
      chrome.runtime.sendMessage({ type: 'REPORT_ABORTED', reportType, orderId, url: FRAME_URL });
      await sleep(2000);
      removeStatus();
      return false;
    }
    
    // Submit
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
    
    // Step 2: Jetzt sind wir im "Edit information" Dialog
    // Die Funktion executeOptionSelection handled den Rest
    await executeOptionSelection(reportType, reason, orderId, testMode);
  }
  
  async function waitForElement(finder, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const el = finder();
      if (el && !isOurElement(el)) return el;
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
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Init v1.2.5`);
    
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

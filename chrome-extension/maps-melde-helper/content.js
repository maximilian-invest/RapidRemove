/**
 * RapidRemove Maps Melde-Helper - Content Script
 * Läuft in allen Frames (Top + Iframes) und koordiniert via Background
 */

(() => {
  'use strict';
  
  const FRAME_URL = window.location.href;
  const IS_TOP = window === window.top;
  const FRAME_ID = IS_TOP ? 'TOP' : 'IFRAME';
  
  console.log(`[RR-MeldeHelper] [${FRAME_ID}] Content script loaded in: ${FRAME_URL}`);
  console.log(`[RR-MeldeHelper] [${FRAME_ID}] Document readyState: ${document.readyState}`);
  console.log(`[RR-MeldeHelper] [${FRAME_ID}] Document title: "${document.title}"`);
  
  // Verhindere mehrfache Initialisierung
  if (window.__RR_MELDE_HELPER_LOADED__) {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Already loaded, skipping`);
    return;
  }
  window.__RR_MELDE_HELPER_LOADED__ = true;
  
  let currentReport = null;
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
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Status:`, text, isError ? '(ERROR)' : '');
    return statusOverlay;
  }
  
  function removeStatus() {
    if (statusOverlay && statusOverlay.parentNode) {
      statusOverlay.remove();
    }
    statusOverlay = null;
    document.querySelectorAll('.rr-status-overlay').forEach(el => el.remove());
  }
  
  // ==========================================
  // Shadow DOM Traversal
  // ==========================================
  
  function querySelectorAllDeep(selector, root = document) {
    const results = [...root.querySelectorAll(selector)];
    
    // Traverse shadow roots
    const allElements = root.querySelectorAll('*');
    for (const el of allElements) {
      if (el.shadowRoot) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found shadow root in:`, el.tagName, el.className);
        results.push(...querySelectorAllDeep(selector, el.shadowRoot));
      }
    }
    
    return results;
  }
  
  function queryAllInteractive(root = document) {
    const selectors = [
      '[role="radio"]',
      '[role="radiogroup"]',
      '[role="option"]',
      '[role="listbox"]',
      '[role="menuitemradio"]',
      'input[type="radio"]',
      '[data-value]',
      '[aria-checked]',
    ];
    
    const results = [];
    for (const sel of selectors) {
      try {
        results.push(...querySelectorAllDeep(sel, root));
      } catch (e) {}
    }
    
    // Also get all clickable elements in potential dialog areas
    const dialogSelectors = '[role="dialog"], [role="main"], .modal, [class*="dialog"], [class*="modal"], [class*="panel"], [class*="overlay"], [aria-modal="true"]';
    try {
      const dialogs = querySelectorAllDeep(dialogSelectors, root);
      for (const dialog of dialogs) {
        const items = dialog.querySelectorAll('[role="radio"], [role="option"], [role="menuitem"], [role="menuitemradio"], [tabindex], [aria-checked]');
        results.push(...items);
      }
    } catch (e) {}
    
    return [...new Set(results)];
  }
  
  // ==========================================
  // Radio Option Detection
  // ==========================================
  
  function debugLogAllElements() {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] === DEBUG: All interactive elements in frame ===`);
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Frame URL: ${FRAME_URL}`);
    
    // Log ALL buttons in this frame
    const buttons = document.querySelectorAll('button');
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found ${buttons.length} buttons`);
    buttons.forEach((btn, i) => {
      const text = normalizeText(getFullText(btn));
      const aria = normalizeText(btn.getAttribute('aria-label') || '');
      const dataValue = btn.getAttribute('data-value') || '';
      if (text.length > 0 || aria.length > 0) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] - [BUTTON ${i}] Text: "${text.substring(0, 60)}" | aria: "${aria}" | data-value: "${dataValue}"`);
      }
    });
    
    // Log role="radio" and similar
    const radios = document.querySelectorAll('[role="radio"], [role="menuitemradio"], [role="option"], [aria-checked]');
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found ${radios.length} radio-like elements`);
    radios.forEach((el, i) => {
      const text = normalizeText(getFullText(el));
      const aria = normalizeText(el.getAttribute('aria-label') || '');
      const role = el.getAttribute('role');
      const checked = el.getAttribute('aria-checked');
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] - [${role}] Text: "${text.substring(0, 60)}" | aria: "${aria}" | checked: ${checked}`);
    });
    
    // Log any elements containing key words
    const keywords = ['closed', 'exist', 'duplicate', 'moved', 'offensive', 'public', 'other', 'geschlossen', 'existiert', 'duplikat'];
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Searching for keywords: ${keywords.join(', ')}`);
    
    const allElements = document.querySelectorAll('*');
    let foundCount = 0;
    allElements.forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      const shortText = text.substring(0, 200);
      for (const kw of keywords) {
        if (shortText.includes(kw) && el.children.length === 0) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] - [${el.tagName}] Contains "${kw}": "${shortText.substring(0, 80)}"`);
          foundCount++;
          if (foundCount > 30) return;
        }
      }
    });
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] === END DEBUG ===`);
  }
  
  function findRadioOptionsInFrame() {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Searching for radio options in: ${FRAME_URL}`);
    
    const candidates = queryAllInteractive();
    const radioOptions = [];
    
    for (const el of candidates) {
      const role = el.getAttribute('role');
      const text = normalizeText(getFullText(el));
      const ariaLabel = normalizeText(el.getAttribute('aria-label') || '');
      const dataValue = el.getAttribute('data-value') || '';
      
      // Only consider elements that look like radio options
      if (role === 'radio' || role === 'menuitemradio' || role === 'option' || el.type === 'radio' || el.hasAttribute('aria-checked')) {
        radioOptions.push({
          element: el,
          text,
          ariaLabel,
          dataValue,
          role,
        });
      }
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found ${radioOptions.length} radio-like elements`);
    
    // Debug: Log all found options
    for (const opt of radioOptions) {
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] - [${opt.role}] Text: "${opt.text}" | aria: "${opt.ariaLabel}" | data-value: "${opt.dataValue}"`);
    }
    
    return radioOptions;
  }
  
  function findOperatingStatusOption(targetType) {
    const patterns = TEXT_PATTERNS[targetType];
    if (!patterns) {
      console.error(`[RR-MeldeHelper] Unknown report type: ${targetType}`);
      return null;
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Looking for: ${targetType} with patterns:`, patterns);
    
    const radioOptions = findRadioOptionsInFrame();
    
    for (const opt of radioOptions) {
      const textLower = opt.text.toLowerCase();
      const ariaLower = opt.ariaLabel.toLowerCase();
      
      for (const pattern of patterns) {
        const patternLower = normalizeText(pattern).toLowerCase();
        if (textLower.includes(patternLower) || ariaLower.includes(patternLower)) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] FOUND matching option: "${opt.text}" for pattern "${pattern}"`);
          return opt.element;
        }
      }
    }
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] No match found for ${targetType}`);
    return null;
  }
  
  async function waitForRadioOption(targetType, timeout = 8000) {
    const startTime = Date.now();
    const interval = 300;
    
    while (Date.now() - startTime < timeout) {
      const option = findOperatingStatusOption(targetType);
      if (option) return option;
      await sleep(interval);
    }
    
    return null;
  }
  
  // ==========================================
  // Click & Interaction Helpers
  // ==========================================
  
  function clickElement(el) {
    if (!el) return false;
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Clicking element:`, el.tagName, el.className);
    
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
    
    // Try multiple click methods
    el.focus && el.focus();
    el.click();
    
    // Also dispatch events
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    
    // For radio buttons, also try setting checked
    if (el.type === 'radio' || el.getAttribute('role') === 'radio') {
      el.checked = true;
      el.setAttribute('aria-checked', 'true');
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    return true;
  }
  
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
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
          <div class="rr-confirm-title">🧪 Test-Modus abgeschlossen</div>
          <div class="rr-confirm-text">
            Die Meldung "<strong>${typeLabel}</strong>" wurde bis zum Submit-Schritt durchgeführt.<br>
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
            Soll die Meldung "<strong>${typeLabel}</strong>" jetzt an Google gesendet werden?<br>
            <em>Diese Aktion kann nicht rückgängig gemacht werden.</em>
          </div>
          <div class="rr-confirm-buttons">
            <button class="rr-btn rr-btn-cancel" data-action="no">Abbrechen</button>
            <button class="rr-btn rr-btn-danger" data-action="yes">Ja, absenden</button>
          </div>
        `;
      }
      
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      const handleClick = (e) => {
        const action = e.target.dataset.action;
        if (action) {
          overlay.remove();
          resolve(action === 'yes' || action === 'ok');
        }
      };
      
      dialog.addEventListener('click', handleClick);
    });
  }
  
  // ==========================================
  // Follow-up Field Handling
  // ==========================================
  
  async function handleFollowUpFields(reportType, reason) {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Handling follow-up for: ${reportType}`);
    
    await sleep(500);
    
    // Check for text input fields
    const textInputs = querySelectorAllDeep('textarea, input[type="text"]');
    for (const input of textInputs) {
      if (input.offsetParent !== null && reason) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Filling text input with reason`);
        input.value = reason;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    
    // For "Moved" - look for location input
    if (reportType === 'moved') {
      const locationInputs = querySelectorAllDeep('input[placeholder*="location"], input[placeholder*="address"], input[placeholder*="Standort"], input[placeholder*="Adresse"]');
      for (const input of locationInputs) {
        if (input.offsetParent !== null && reason) {
          input.value = reason;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
    
    // For "Duplicate" - may need to select a place
    if (reportType === 'duplicate') {
      // This typically requires user interaction to search/select
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] Duplicate requires manual place selection`);
    }
  }
  
  // ==========================================
  // Submit Button
  // ==========================================
  
  function findSubmitButton() {
    const submitPatterns = ['submit', 'senden', 'absenden', 'send', 'done', 'fertig'];
    
    const buttons = querySelectorAllDeep('button');
    
    for (const btn of buttons) {
      const text = normalizeText(getFullText(btn)).toLowerCase();
      const ariaLabel = normalizeText(btn.getAttribute('aria-label') || '').toLowerCase();
      
      for (const pattern of submitPatterns) {
        if (text.includes(pattern) || ariaLabel.includes(pattern)) {
          // Make sure it's not Cancel/Abbrechen
          if (!text.includes('cancel') && !text.includes('abbrechen')) {
            console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found submit button: "${text}"`);
            return btn;
          }
        }
      }
    }
    
    // Fallback: look for primary/action buttons
    const primaryButtons = querySelectorAllDeep('[class*="primary"], [class*="action"], [data-mdc-dialog-action="accept"]');
    for (const btn of primaryButtons) {
      if (btn.tagName === 'BUTTON') {
        const text = normalizeText(getFullText(btn)).toLowerCase();
        if (!text.includes('cancel') && !text.includes('abbrechen')) {
          console.log(`[RR-MeldeHelper] [${FRAME_ID}] Found primary button: "${text}"`);
          return btn;
        }
      }
    }
    
    return null;
  }
  
  // ==========================================
  // Main Report Flow (runs in any frame)
  // ==========================================
  
  async function executeRadioSelection(reportType, reason, orderId, testMode) {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Executing radio selection for: ${reportType}`);
    
    showStatus(`Suche Option "${REPORT_TYPES[reportType]?.de || reportType}"...`);
    
    // Debug: Log all elements first
    debugLogAllElements();
    
    // Wait for the radio option to appear
    const option = await waitForRadioOption(reportType, 10000);
    
    if (!option) {
      // Debug: list what we found
      const found = findRadioOptionsInFrame();
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] Available options:`, found.map(o => o.text));
      
      showStatus(`Fehler: "${REPORT_TYPES[reportType]?.de}" Option nicht gefunden`, true);
      chrome.runtime.sendMessage({
        type: 'REPORT_ERROR',
        reportType,
        orderId,
        error: `Option "${reportType}" nicht gefunden in Frame: ${FRAME_URL}`,
        url: FRAME_URL,
        testMode,
      });
      return false;
    }
    
    // Click the radio option
    showStatus(`Wähle: ${REPORT_TYPES[reportType]?.de || reportType}`);
    clickElement(option);
    await sleep(800);
    
    // Handle follow-up fields
    await handleFollowUpFields(reportType, reason);
    await sleep(500);
    
    // Find submit button
    const submitBtn = findSubmitButton();
    
    if (testMode) {
      // Test mode: show completion dialog, don't submit
      showStatus('🧪 Test-Modus: Submit-Button gefunden, NICHT absenden');
      
      const acknowledged = await showConfirmDialog(reportType, true);
      removeStatus();
      
      chrome.runtime.sendMessage({
        type: 'TEST_COMPLETE',
        reportType,
        orderId,
        url: window.location.href,
      });
      
      return true;
    }
    
    // Real mode: confirm before submit
    const confirmed = await showConfirmDialog(reportType, false);
    
    if (!confirmed) {
      showStatus('Meldung abgebrochen', false);
      chrome.runtime.sendMessage({
        type: 'REPORT_ABORTED',
        reportType,
        orderId,
        url: window.location.href,
      });
      await sleep(2000);
      removeStatus();
      return false;
    }
    
    // Submit
    if (submitBtn) {
      showStatus('Sende Meldung...');
      clickElement(submitBtn);
      await sleep(1500);
      
      showStatus('✓ Meldung gesendet!');
      chrome.runtime.sendMessage({
        type: 'REPORT_SUCCESS',
        reportType,
        orderId,
        url: window.location.href,
      });
      
      await sleep(3000);
      removeStatus();
      return true;
    } else {
      showStatus('Fehler: Submit-Button nicht gefunden', true);
      chrome.runtime.sendMessage({
        type: 'REPORT_ERROR',
        reportType,
        orderId,
        error: 'Submit-Button nicht gefunden',
        url: window.location.href,
      });
      return false;
    }
  }
  
  // ==========================================
  // Top Frame: Initial Navigation
  // ==========================================
  
  async function startReportFromTop(reportType, reason, orderId, testMode) {
    console.log(`[RR-MeldeHelper] [TOP] Starting report: ${reportType}`);
    
    showStatus('Suche "Änderung vorschlagen" / "Suggest an edit"...');
    
    // Find "Suggest an edit" / "Änderung vorschlagen"
    const suggestBtn = await waitForElement(() => {
      return findClickableByText(TEXT_PATTERNS.suggest_edit) ||
             findElement(SELECTORS.suggestEdit);
    }, 5000);
    
    if (!suggestBtn) {
      showStatus('Fehler: "Änderung vorschlagen" nicht gefunden', true);
      chrome.runtime.sendMessage({
        type: 'REPORT_ERROR',
        reportType,
        orderId,
        error: '"Änderung vorschlagen" nicht gefunden',
        url: window.location.href,
        testMode,
      });
      return;
    }
    
    // Click "Suggest an edit"
    showStatus('Klicke "Änderung vorschlagen"...');
    clickElement(suggestBtn);
    await sleep(1200);
    
    // Find "Place is closed or not here" / "Geschlossen oder nicht vorhanden"
    showStatus('Suche "Geschlossen oder nicht vorhanden"...');
    
    const closedBtn = await waitForElement(() => {
      return findClickableByText(TEXT_PATTERNS.place_closed) ||
             findElement(SELECTORS.placeClosedOption);
    }, 5000);
    
    if (!closedBtn) {
      showStatus('Fehler: "Geschlossen oder nicht vorhanden" nicht gefunden', true);
      chrome.runtime.sendMessage({
        type: 'REPORT_ERROR',
        reportType,
        orderId,
        error: '"Geschlossen oder nicht vorhanden" nicht gefunden',
        url: window.location.href,
        testMode,
      });
      return;
    }
    
    // Click it
    showStatus('Klicke "Geschlossen oder nicht vorhanden"...');
    clickElement(closedBtn);
    await sleep(1500);
    
    // Now signal that we need to find the radio options
    // They might be in this frame or in an iframe
    currentReport = { reportType, reason, orderId, testMode, step: 'find_radios' };
    
    // Try to find radios in this frame first
    showStatus('Suche Operating-Status Optionen...');
    
    // Broadcast to background that we need to find radios
    chrome.runtime.sendMessage({
      type: 'STEP_COMPLETED',
      step: 'clicked_closed',
      nextStep: 'find_radios',
    });
    
    const foundInTop = await tryFindAndSelectRadio(reportType, reason, orderId, testMode);
    
    if (!foundInTop) {
      // Radios not in top frame - an iframe should handle it
      console.log(`[RR-MeldeHelper] [TOP] Radios not found in top frame, waiting for iframe...`);
      showStatus('Warte auf Dialog...');
      
      // Set a timeout for iframe to respond
      setTimeout(() => {
        if (currentReport && currentReport.step === 'find_radios') {
          showStatus('Fehler: Radio-Optionen nicht gefunden', true);
          chrome.runtime.sendMessage({
            type: 'REPORT_ERROR',
            reportType,
            orderId,
            error: 'Radio-Optionen weder im Top-Frame noch in Iframe gefunden',
            url: window.location.href,
            testMode,
          });
        }
      }, 15000);
    }
  }
  
  async function tryFindAndSelectRadio(reportType, reason, orderId, testMode) {
    // Wait a bit for DOM updates
    await sleep(1000);
    
    // Debug log all elements
    debugLogAllElements();
    
    // Check if radios are visible in this frame
    const radioOptions = findRadioOptionsInFrame();
    
    // Check if we have Operating Status options
    const operatingStatusOptions = radioOptions.filter(opt => {
      const text = opt.text.toLowerCase();
      return text.includes('closed') || text.includes('geschlossen') ||
             text.includes('exist') || text.includes('existiert') ||
             text.includes('duplicate') || text.includes('duplikat') ||
             text.includes('moved') || text.includes('umgezogen') ||
             text.includes('offensive') || text.includes('anstößig') ||
             text.includes('public') || text.includes('öffentlich') ||
             text.includes('other') || text.includes('sonstiges');
    });
    
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Operating status options found: ${operatingStatusOptions.length}`);
    
    if (operatingStatusOptions.length >= 3) {
      // We have the dialog content in this frame!
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] Dialog detected in this frame, proceeding with selection`);
      currentReport.step = 'selecting';
      return await executeRadioSelection(reportType, reason, orderId, testMode);
    }
    
    return false;
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
  // Iframe: Monitor for Radio Options
  // ==========================================
  
  async function monitorForRadioOptions() {
    if (IS_TOP) return; // Only for iframes
    
    console.log(`[RR-MeldeHelper] [IFRAME] Monitoring for radio options in: ${FRAME_URL}`);
    
    // Poll for radio options
    let attempts = 0;
    const maxAttempts = 40; // 40 * 500ms = 20 seconds
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Debug on first few attempts
      if (attempts <= 3 || attempts % 10 === 0) {
        console.log(`[RR-MeldeHelper] [IFRAME] Attempt ${attempts}...`);
        debugLogAllElements();
      }
      
      const radioOptions = findRadioOptionsInFrame();
      
      // Check if we have Operating Status options
      const operatingStatusOptions = radioOptions.filter(opt => {
        const text = opt.text.toLowerCase();
        return text.includes('closed') || text.includes('geschlossen') ||
               text.includes('exist') || text.includes('existiert') ||
               text.includes('duplicate') || text.includes('duplikat') ||
               text.includes('moved') || text.includes('umgezogen') ||
               text.includes('offensive') || text.includes('anstößig') ||
               text.includes('public') || text.includes('öffentlich') ||
               text.includes('other') || text.includes('sonstiges');
      });
      
      if (operatingStatusOptions.length >= 3) {
        console.log(`[RR-MeldeHelper] [IFRAME] Found ${operatingStatusOptions.length} operating status options!`);
        
        // Notify background that we found the options
        chrome.runtime.sendMessage({
          type: 'FOUND_RADIO_OPTIONS',
          frameUrl: FRAME_URL,
        });
        
        // Get the active report config
        const reportConfig = await new Promise(resolve => {
          chrome.runtime.sendMessage({ type: 'GET_ACTIVE_REPORT' }, resolve);
        });
        
        if (reportConfig) {
          console.log(`[RR-MeldeHelper] [IFRAME] Active report found, executing selection`);
          await executeRadioSelection(
            reportConfig.reportType,
            reportConfig.reason,
            reportConfig.orderId,
            reportConfig.testMode
          );
        } else {
          console.log(`[RR-MeldeHelper] [IFRAME] No active report config, waiting...`);
        }
        
        return;
      }
      
      await sleep(500);
    }
    
    console.log(`[RR-MeldeHelper] [IFRAME] No operating status options found after ${maxAttempts} attempts`);
  }
  
  // ==========================================
  // Message Handling
  // ==========================================
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Received message:`, message.type);
    
    switch (message.type) {
      case 'REPORT_START':
        if (IS_TOP) {
          currentReport = {
            reportType: message.reportType,
            reason: message.reason,
            orderId: message.orderId,
            testMode: message.testMode,
            step: 'starting',
          };
          startReportFromTop(message.reportType, message.reason, message.orderId, message.testMode);
        }
        sendResponse({ received: true });
        return true;
        
      case 'CONTINUE_REPORT':
        if (message.step === 'find_radios' && !IS_TOP) {
          // Iframe should look for radios
          monitorForRadioOptions();
        }
        sendResponse({ received: true });
        return true;
        
      case 'START_MELDE_FLOW':
        // Legacy direct message from popup
        if (IS_TOP) {
          startReportFromTop(message.reportType, message.reason, message.orderId, message.testMode);
        }
        sendResponse({ received: true });
        return true;
        
      case 'PING':
        sendResponse({ pong: true, frameUrl: FRAME_URL, isTop: IS_TOP });
        return true;
    }
    
    return true;
  });
  
  // ==========================================
  // Initialization
  // ==========================================
  
  function init() {
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Initializing in: ${FRAME_URL}`);
    console.log(`[RR-MeldeHelper] [${FRAME_ID}] Body element: ${document.body ? 'present' : 'missing'}, children: ${document.body?.children?.length || 0}`);
    
    // Check URL params (only in top frame)
    if (IS_TOP) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('rr_melden') === '1') {
        const reportType = params.get('rr_type') || 'doesnt_exist';
        const reason = params.get('rr_reason') || '';
        const orderId = params.get('rr_order') || '';
        const testMode = params.get('rr_test') === '1';
        
        console.log(`[RR-MeldeHelper] [TOP] Auto-start from URL params: ${reportType}`);
        
        setTimeout(() => {
          startReportFromTop(reportType, reason, orderId, testMode);
        }, 2000);
      }
    }
    
    // Notify background that this frame is ready
    chrome.runtime.sendMessage({
      type: 'FRAME_READY',
      frameUrl: FRAME_URL,
      isTop: IS_TOP,
    }).then(response => {
      if (response?.activeReport) {
        console.log(`[RR-MeldeHelper] [${FRAME_ID}] Active report found on frame ready`);
        if (!IS_TOP && response.step === 'find_radios') {
          // We're an iframe and need to look for radios
          monitorForRadioOptions();
        }
      }
    }).catch(err => {
      console.log(`[RR-MeldeHelper] [${FRAME_ID}] Frame ready notification failed:`, err.message);
    });
    
    // If we're an iframe, start monitoring for radio options
    if (!IS_TOP) {
      // Give some time for the dialog to load
      setTimeout(() => {
        monitorForRadioOptions();
      }, 1000);
    }
  }
  
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

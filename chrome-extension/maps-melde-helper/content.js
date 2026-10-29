/**
 * RapidRemove Maps Melde-Helper
 * Automatisiert den Google Maps "Existiert nicht"-Melde-Flow.
 * 
 * Unterstützte Sprachen: Englisch, Deutsch
 * 
 * Aktivierung:
 * 1. Via URL-Parameter: ?rr_melden=1&rr_reason=...
 * 2. Via Chrome Extension Message vom Background-Script
 * 3. Via Popup-Button (manuell)
 */

(function() {
  'use strict';

  // Status-Tracking
  let isRunning = false;
  let currentReason = '';
  let currentOrderId = '';
  let isDryRun = false; // Testmodus: stoppt vor dem Submit

  // UI-Strings (Deutsch)
  const UI = {
    confirmTitle: 'RapidRemove: Meldung absenden?',
    confirmMessage: 'Du bist dabei, das Profil als "existiert nicht" zu melden.',
    confirmOrderId: 'Auftrag:',
    confirmReason: 'Grund:',
    confirmYes: 'Ja, absenden',
    confirmNo: 'Abbrechen',
    
    // Testmodus
    testTitle: 'RapidRemove: Testmodus',
    testMessage: 'Der Flow wurde erfolgreich durchlaufen. Im Echtmodus würde jetzt "Senden" geklickt werden.',
    testClose: 'Test beenden',
    
    // Status-Meldungen
    statusSearching: 'Suche "Suggest an edit"...',
    statusOpening: 'Öffne Bearbeitungsdialog...',
    statusSelectingClosed: 'Wähle "Place is closed or not here"...',
    statusSelectingDoesntExist: 'Wähle "Doesn\'t exist"...',
    statusFillingReason: 'Fülle Grund aus...',
    statusWaitingConfirm: 'Warte auf Bestätigung...',
    statusSubmitting: 'Sende Meldung...',
    statusDone: 'Meldung erfolgreich gesendet!',
    statusTestDone: 'Testmodus: Flow erfolgreich, nicht gesendet.',
    statusError: 'Fehler:',
    statusAborted: 'Abgebrochen.',
  };

  // Logging
  function log(msg, ...args) {
    console.log(`[RR-MeldeHelper] ${msg}`, ...args);
  }

  function logError(msg, ...args) {
    console.error(`[RR-MeldeHelper] ${msg}`, ...args);
  }

  // Status-Anzeige
  let statusOverlay = null;

  function showStatus(message, isError = false, isTest = false) {
    if (!statusOverlay) {
      statusOverlay = document.createElement('div');
      statusOverlay.id = 'rr-melde-status';
      document.body.appendChild(statusOverlay);
    }
    statusOverlay.textContent = (isDryRun ? '🧪 TEST: ' : '') + message;
    statusOverlay.className = isError ? 'error' : (isTest ? 'test' : '');
    statusOverlay.style.display = 'block';
    log(message);
  }

  function hideStatus() {
    if (statusOverlay) {
      statusOverlay.style.display = 'none';
    }
  }

  // Bestätigungsdialog (Echtmodus)
  function showConfirmDialog(reason, orderId) {
    return new Promise((resolve) => {
      const existing = document.getElementById('rr-confirm-dialog');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'rr-confirm-dialog';
      overlay.innerHTML = `
        <div class="rr-dialog-content">
          <h2>${UI.confirmTitle}</h2>
          <p>${UI.confirmMessage}</p>
          ${orderId ? `<p><strong>${UI.confirmOrderId}</strong> ${escapeHtml(orderId)}</p>` : ''}
          <p><strong>${UI.confirmReason}</strong> ${escapeHtml(reason || '(kein Grund angegeben)')}</p>
          <div class="rr-dialog-buttons">
            <button id="rr-confirm-no" class="rr-btn rr-btn-secondary">${UI.confirmNo}</button>
            <button id="rr-confirm-yes" class="rr-btn rr-btn-primary">${UI.confirmYes}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById('rr-confirm-yes').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });

      document.getElementById('rr-confirm-no').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });

      const escHandler = (e) => {
        if (e.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', escHandler);
          resolve(false);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  }

  // Testmodus-Dialog (kein Submit-Button)
  function showTestCompleteDialog(reason, orderId) {
    return new Promise((resolve) => {
      const existing = document.getElementById('rr-confirm-dialog');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'rr-confirm-dialog';
      overlay.className = 'test-mode';
      overlay.innerHTML = `
        <div class="rr-dialog-content rr-test-dialog">
          <h2>🧪 ${UI.testTitle}</h2>
          <p>${UI.testMessage}</p>
          ${orderId ? `<p><strong>${UI.confirmOrderId}</strong> ${escapeHtml(orderId)}</p>` : ''}
          <p><strong>${UI.confirmReason}</strong> ${escapeHtml(reason || '(kein Grund angegeben)')}</p>
          <div class="rr-test-success">
            ✅ Alle Schritte erfolgreich durchlaufen
          </div>
          <div class="rr-dialog-buttons">
            <button id="rr-test-close" class="rr-btn rr-btn-secondary">${UI.testClose}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById('rr-test-close').addEventListener('click', () => {
        overlay.remove();
        resolve(false); // Im Testmodus nie submitten
      });

      const escHandler = (e) => {
        if (e.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', escHandler);
          resolve(false);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Simuliere einen echten Klick
  async function simulateClick(element) {
    if (!element) return false;
    
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    await sleep(150);
    
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Hover zuerst
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: x, clientY: y }));
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
    
    await sleep(50);
    
    // Dann klicken
    ['mousedown', 'mouseup', 'click'].forEach(type => {
      element.dispatchEvent(new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      }));
    });

    // Auch focus setzen falls es ein Button ist
    if (element.focus) {
      element.focus();
    }

    return true;
  }

  // Setze Text in ein Eingabefeld
  function setInputValue(element, value) {
    if (!element) return false;
    
    element.focus();
    element.value = value;
    
    // Trigger input events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Für React/Angular apps
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set || Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    return true;
  }

  // Warte eine bestimmte Zeit
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Debug: Zeige alle sichtbaren Buttons
  function debugLogButtons() {
    const buttons = document.querySelectorAll('button, [role="button"], [role="menuitemradio"]');
    log('Sichtbare interaktive Elemente:');
    buttons.forEach(btn => {
      if (window.isVisible && window.isVisible(btn)) {
        const text = (btn.textContent || '').trim().substring(0, 50);
        const aria = btn.getAttribute('aria-label') || '';
        const dataValue = btn.getAttribute('data-value') || '';
        log(`  - Text: "${text}" | aria-label: "${aria}" | data-value: "${dataValue}"`);
      }
    });
  }

  // ============================================================================
  // HAUPTFUNKTION
  // ============================================================================

  async function runReportFlow(reason, orderId, testMode = false) {
    if (isRunning) {
      log('Flow läuft bereits');
      return;
    }

    isRunning = true;
    isDryRun = testMode;
    currentReason = reason || '';
    currentOrderId = orderId || '';

    log(`Starte Flow (Testmodus: ${testMode})`);

    try {
      // ========================================
      // Schritt 1: Finde "Suggest an edit" Button
      // ========================================
      showStatus(UI.statusSearching);
      
      let suggestBtn = findElement(window.MAPS_SELECTORS.suggestEditButton);
      if (!suggestBtn) {
        suggestBtn = findClickableByText(window.MAPS_TEXT_PATTERNS.suggestEdit);
      }

      if (!suggestBtn) {
        debugLogButtons();
        throw new Error('Button "Suggest an edit" nicht gefunden. Ist ein Unternehmensprofil geöffnet?');
      }

      log('Gefunden: Suggest an edit Button');

      // ========================================
      // Schritt 2: Öffne den Dialog
      // ========================================
      showStatus(UI.statusOpening);
      await simulateClick(suggestBtn);
      await sleep(2000); // Warte auf Dialog

      // ========================================
      // Schritt 3: Wähle "Place is closed or not here"
      // ========================================
      showStatus(UI.statusSelectingClosed);
      
      // Warte kurz und versuche dann zu finden
      await sleep(500);
      
      let closedOption = findElement(window.MAPS_SELECTORS.closedOrNotHereOption);
      if (!closedOption) {
        closedOption = findClickableByText(window.MAPS_TEXT_PATTERNS.closedOrNotHere);
      }

      if (!closedOption) {
        log('Suche weiter nach "closed" Option...');
        debugLogButtons();
        
        // Nochmal warten und versuchen
        await sleep(1000);
        closedOption = findClickableByText(window.MAPS_TEXT_PATTERNS.closedOrNotHere);
      }

      if (!closedOption) {
        throw new Error('"Place is closed or not here" Option nicht gefunden. Ist der Dialog geöffnet?');
      }

      log('Gefunden: Closed/Not here Option');
      await simulateClick(closedOption);
      await sleep(1500); // Warte auf nächsten Screen

      // ========================================
      // Schritt 4: Wähle "Doesn't exist" / "Never existed"
      // ========================================
      showStatus(UI.statusSelectingDoesntExist);
      
      await sleep(500);
      
      let doesntExist = findElement(window.MAPS_SELECTORS.doesntExistOption);
      if (!doesntExist) {
        doesntExist = findClickableByText(window.MAPS_TEXT_PATTERNS.doesntExist);
      }

      if (!doesntExist) {
        log('Suche weiter nach "doesn\'t exist" Option...');
        debugLogButtons();
        
        // Nochmal warten und versuchen
        await sleep(1000);
        doesntExist = findClickableByText(window.MAPS_TEXT_PATTERNS.doesntExist);
      }

      if (!doesntExist) {
        throw new Error('"Doesn\'t exist" Option nicht gefunden.');
      }

      log('Gefunden: Doesn\'t exist Option');
      await simulateClick(doesntExist);
      await sleep(1000);

      // ========================================
      // Schritt 5: Fülle den Grund aus (falls vorhanden)
      // ========================================
      if (currentReason) {
        showStatus(UI.statusFillingReason);
        
        await sleep(500);
        
        let reasonInput = findElement(window.MAPS_SELECTORS.reasonInput);
        if (!reasonInput) {
          // Suche nach dem ersten sichtbaren Textarea
          const textareas = document.querySelectorAll('textarea');
          for (const ta of textareas) {
            if (window.isVisible && window.isVisible(ta)) {
              reasonInput = ta;
              break;
            }
          }
        }

        if (reasonInput) {
          setInputValue(reasonInput, currentReason);
          log('Grund eingetragen');
          await sleep(500);
        } else {
          log('Kein Grund-Eingabefeld gefunden, überspringe...');
        }
      }

      // ========================================
      // Schritt 6: Bestätigung / Testmodus-Dialog
      // ========================================
      hideStatus();

      let shouldSubmit = false;
      
      if (isDryRun) {
        // TESTMODUS: Zeige Erfolgs-Dialog ohne Submit-Option
        showStatus(UI.statusTestDone, false, true);
        await showTestCompleteDialog(currentReason, currentOrderId);
        shouldSubmit = false;
      } else {
        // ECHTMODUS: Zeige Bestätigungsdialog
        showStatus(UI.statusWaitingConfirm);
        shouldSubmit = await showConfirmDialog(currentReason, currentOrderId);
      }

      if (!shouldSubmit) {
        showStatus(UI.statusAborted, true);
        
        // Schließe den Dialog
        const closeBtn = findElement(window.MAPS_SELECTORS.closeButton) ||
                         findClickableByText(window.MAPS_TEXT_PATTERNS.cancel);
        if (closeBtn) {
          await simulateClick(closeBtn);
        }
        
        await sleep(1500);
        hideStatus();
        
        // Sende Status an Background
        try {
          chrome.runtime.sendMessage({
            type: isDryRun ? 'TEST_COMPLETE' : 'REPORT_ABORTED',
            orderId: currentOrderId,
            url: window.location.href,
          });
        } catch (e) {}
        
        return;
      }

      // ========================================
      // Schritt 7: Klicke auf Senden (NUR wenn bestätigt und KEIN Testmodus)
      // ========================================
      showStatus(UI.statusSubmitting);
      
      let submitBtn = findElement(window.MAPS_SELECTORS.submitButton);
      if (!submitBtn) {
        submitBtn = findClickableByText(window.MAPS_TEXT_PATTERNS.submit);
      }

      if (!submitBtn) {
        throw new Error('"Submit" Button nicht gefunden');
      }

      log('Gefunden: Submit Button - klicke...');
      await simulateClick(submitBtn);
      await sleep(2000);

      // Erfolg!
      showStatus(UI.statusDone);
      await sleep(3000);
      hideStatus();

      // Sende Erfolgsmeldung an Background-Script
      try {
        chrome.runtime.sendMessage({
          type: 'REPORT_SUCCESS',
          orderId: currentOrderId,
          url: window.location.href,
        });
      } catch (e) {}

    } catch (error) {
      logError(error.message);
      showStatus(`${UI.statusError} ${error.message}`, true);
      
      // Sende Fehlermeldung an Background-Script
      try {
        chrome.runtime.sendMessage({
          type: 'REPORT_ERROR',
          orderId: currentOrderId,
          error: error.message,
          url: window.location.href,
          testMode: isDryRun,
        });
      } catch (e) {}

    } finally {
      isRunning = false;
      isDryRun = false;
    }
  }

  // ============================================================================
  // INITIALISIERUNG
  // ============================================================================

  // Prüfe URL-Parameter beim Laden
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('rr_melden') === '1') {
      const reason = params.get('rr_reason') || '';
      const orderId = params.get('rr_order') || '';
      const testMode = params.get('rr_test') === '1';
      
      log('Melde-Modus via URL-Parameter aktiviert');
      log(`Grund: ${reason}, Auftrag: ${orderId}, Testmodus: ${testMode}`);

      // Warte bis die Seite vollständig geladen ist
      setTimeout(() => {
        runReportFlow(reason, orderId, testMode);
      }, 3000);
    }
  }

  // Empfange Nachrichten vom Background-Script oder Popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'START_REPORT') {
        log('Melde-Modus via Extension-Message aktiviert');
        log(`Testmodus: ${message.testMode || false}`);
        runReportFlow(message.reason || '', message.orderId || '', message.testMode || false);
        sendResponse({ status: 'started' });
      } else if (message.type === 'GET_STATUS') {
        sendResponse({ isRunning, currentOrderId, isDryRun });
      }
      return true; // async response
    });
  }

  // Initialisierung
  function init() {
    log('Maps Melde-Helper initialisiert (EN+DE Support, Testmodus verfügbar)');
    
    // Prüfe URL-Parameter
    checkUrlParams();

    // Exponiere Funktionen global für Debug-Zwecke
    window.rrStartReport = runReportFlow;
    window.rrDebugButtons = debugLogButtons;
  }

  // Starte nach DOM-Ready
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();

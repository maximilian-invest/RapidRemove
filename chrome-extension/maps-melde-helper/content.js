/**
 * RapidRemove Maps Melde-Helper
 * Automatisiert den Google Maps "Operating Status" Melde-Flow.
 * 
 * Unterstützte Sprachen: Englisch, Deutsch
 * Unterstützte Report-Typen: Alle 8 Operating Status Optionen
 * 
 * Aktivierung:
 * 1. Via URL-Parameter: ?rr_melden=1&rr_type=doesnt_exist&rr_reason=...
 * 2. Via Chrome Extension Message vom Background-Script
 * 3. Via Popup-Button (manuell)
 */

(function() {
  'use strict';

  // Status-Tracking
  let isRunning = false;
  let currentReason = '';
  let currentOrderId = '';
  let currentReportType = '';
  let isDryRun = false;

  // UI-Strings (Deutsch)
  const UI = {
    confirmTitle: 'RapidRemove: Meldung absenden?',
    confirmMessage: 'Du bist dabei, folgende Meldung zu senden:',
    confirmType: 'Typ:',
    confirmOrderId: 'Auftrag:',
    confirmReason: 'Grund:',
    confirmYes: 'Ja, absenden',
    confirmNo: 'Abbrechen',
    
    // Testmodus
    testTitle: 'RapidRemove: Testmodus',
    testMessage: 'Der Flow wurde erfolgreich durchlaufen. Im Echtmodus würde jetzt "Senden" geklickt werden.',
    testClose: 'Test beenden',
    
    // Follow-up Pause
    pauseTitle: 'RapidRemove: Eingabe erforderlich',
    pauseMessage: 'Bitte fülle das Feld manuell aus und klicke dann auf "Weiter":',
    pauseContinue: 'Weiter',
    pauseCancel: 'Abbrechen',
    
    // Status-Meldungen
    statusSearching: 'Suche "Suggest an edit"...',
    statusOpening: 'Öffne Bearbeitungsdialog...',
    statusSelectingClosed: 'Wähle "Place is closed or not here"...',
    statusSelectingType: 'Wähle Melde-Typ...',
    statusFillingReason: 'Fülle Grund aus...',
    statusWaitingInput: 'Warte auf manuelle Eingabe...',
    statusWaitingConfirm: 'Warte auf Bestätigung...',
    statusSubmitting: 'Sende Meldung...',
    statusDone: 'Meldung erfolgreich gesendet!',
    statusTestDone: 'Testmodus: Flow erfolgreich, nicht gesendet.',
    statusError: 'Fehler:',
    statusAborted: 'Abgebrochen.',
  };

  // Report-Typ Labels für Dialog
  function getTypeLabel(typeId) {
    const type = window.MAPS_REPORT_TYPES?.[typeId];
    if (!type) return typeId;
    return `${type.labelDE} / ${type.labelEN}`;
  }

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
  function showConfirmDialog(reportType, reason, orderId) {
    return new Promise((resolve) => {
      const existing = document.getElementById('rr-confirm-dialog');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'rr-confirm-dialog';
      overlay.innerHTML = `
        <div class="rr-dialog-content">
          <h2>${UI.confirmTitle}</h2>
          <p>${UI.confirmMessage}</p>
          <p><strong>${UI.confirmType}</strong> ${escapeHtml(getTypeLabel(reportType))}</p>
          ${orderId ? `<p><strong>${UI.confirmOrderId}</strong> ${escapeHtml(orderId)}</p>` : ''}
          ${reason ? `<p><strong>${UI.confirmReason}</strong> ${escapeHtml(reason)}</p>` : ''}
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
  function showTestCompleteDialog(reportType, reason, orderId) {
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
          <p><strong>${UI.confirmType}</strong> ${escapeHtml(getTypeLabel(reportType))}</p>
          ${orderId ? `<p><strong>${UI.confirmOrderId}</strong> ${escapeHtml(orderId)}</p>` : ''}
          ${reason ? `<p><strong>${UI.confirmReason}</strong> ${escapeHtml(reason)}</p>` : ''}
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

  // Pause-Dialog für Follow-up-Felder
  function showPauseDialog(hint) {
    return new Promise((resolve) => {
      const existing = document.getElementById('rr-confirm-dialog');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'rr-confirm-dialog';
      overlay.className = 'pause-mode';
      overlay.innerHTML = `
        <div class="rr-dialog-content rr-pause-dialog">
          <h2>⏸️ ${UI.pauseTitle}</h2>
          <p>${UI.pauseMessage}</p>
          <div class="rr-pause-hint">
            📝 ${escapeHtml(hint)}
          </div>
          <div class="rr-dialog-buttons">
            <button id="rr-pause-cancel" class="rr-btn rr-btn-secondary">${UI.pauseCancel}</button>
            <button id="rr-pause-continue" class="rr-btn rr-btn-primary">${UI.pauseContinue}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById('rr-pause-continue').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });

      document.getElementById('rr-pause-cancel').addEventListener('click', () => {
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

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Simuliere einen echten Klick
  async function simulateClick(element) {
    if (!element) return false;
    
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    await sleep(150);
    
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: x, clientY: y }));
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
    
    await sleep(50);
    
    ['mousedown', 'mouseup', 'click'].forEach(type => {
      element.dispatchEvent(new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      }));
    });

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
    
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
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

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Debug: Zeige alle sichtbaren Buttons
  function debugLogButtons() {
    const buttons = document.querySelectorAll('button, [role="button"], [role="menuitemradio"], [role="radio"]');
    log('Sichtbare interaktive Elemente:');
    buttons.forEach(btn => {
      if (window.isVisible && window.isVisible(btn)) {
        const text = (btn.textContent || '').trim().substring(0, 60);
        const aria = btn.getAttribute('aria-label') || '';
        const dataValue = btn.getAttribute('data-value') || '';
        const role = btn.getAttribute('role') || btn.tagName;
        log(`  - [${role}] Text: "${text}" | aria: "${aria}" | data-value: "${dataValue}"`);
      }
    });
  }

  // ============================================================================
  // HAUPTFUNKTION
  // ============================================================================

  async function runReportFlow(reportType, reason, orderId, testMode = false) {
    if (isRunning) {
      log('Flow läuft bereits');
      return;
    }

    // Validiere Report-Typ
    const type = window.MAPS_REPORT_TYPES?.[reportType];
    if (!type) {
      logError(`Unbekannter Report-Typ: ${reportType}`);
      showStatus(`${UI.statusError} Unbekannter Typ: ${reportType}`, true);
      return;
    }

    isRunning = true;
    isDryRun = testMode;
    currentReason = reason || '';
    currentOrderId = orderId || '';
    currentReportType = reportType;

    log(`Starte Flow: Typ="${reportType}", Testmodus=${testMode}`);

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
      await sleep(2000);

      // ========================================
      // Schritt 3: Wähle "Place is closed or not here"
      // ========================================
      showStatus(UI.statusSelectingClosed);
      
      await sleep(500);
      
      let closedOption = findElement(window.MAPS_SELECTORS.closedOrNotHereOption);
      if (!closedOption) {
        closedOption = findClickableByText(window.MAPS_TEXT_PATTERNS.closedOrNotHere);
      }

      if (!closedOption) {
        log('Suche weiter nach "closed" Option...');
        debugLogButtons();
        await sleep(1000);
        closedOption = findClickableByText(window.MAPS_TEXT_PATTERNS.closedOrNotHere);
      }

      if (!closedOption) {
        throw new Error('"Place is closed or not here" Option nicht gefunden. Ist der Dialog geöffnet?');
      }

      log('Gefunden: Closed/Not here Option');
      await simulateClick(closedOption);
      await sleep(1500);

      // ========================================
      // Schritt 4: Wähle den spezifischen Status-Typ
      // ========================================
      showStatus(`${UI.statusSelectingType} "${type.labelEN}"`);
      
      await sleep(500);
      
      let statusOption = window.findStatusOption(reportType);

      if (!statusOption) {
        log(`Suche weiter nach "${reportType}" Option...`);
        debugLogButtons();
        await sleep(1000);
        statusOption = window.findStatusOption(reportType);
      }

      if (!statusOption) {
        throw new Error(`"${type.labelEN}" / "${type.labelDE}" Option nicht gefunden.`);
      }

      log(`Gefunden: ${reportType} Option`);
      await simulateClick(statusOption);
      await sleep(1000);

      // ========================================
      // Schritt 5: Follow-up Felder behandeln
      // ========================================
      
      // Prüfe ob dieser Typ Follow-up-Felder hat
      if (type.hasFollowUp) {
        log(`Typ "${reportType}" hat Follow-up Felder`);
        
        await sleep(500);
        
        // Suche nach Eingabefeld
        let inputField = findElement(window.MAPS_SELECTORS.reasonInput);
        
        if (inputField) {
          // Wenn wir einen Grund haben, versuche ihn einzutragen
          if (currentReason) {
            showStatus(UI.statusFillingReason);
            setInputValue(inputField, currentReason);
            log('Grund/Zusatzinfo eingetragen');
            await sleep(500);
          } else {
            // Kein Grund angegeben, aber Feld ist da -> Benutzer muss ausfüllen
            hideStatus();
            const shouldContinue = await showPauseDialog(type.followUpHint || 'Bitte das Feld ausfüllen');
            
            if (!shouldContinue) {
              showStatus(UI.statusAborted, true);
              await closeDialog();
              return;
            }
            
            await sleep(500);
          }
        } else {
          log('Kein Follow-up Eingabefeld gefunden, überspringe...');
        }
      } else if (currentReason) {
        // Typ hat keine Follow-up-Felder, aber wir haben einen Grund
        // Versuche trotzdem ein Feld zu finden (optional)
        showStatus(UI.statusFillingReason);
        await sleep(500);
        
        let reasonInput = findElement(window.MAPS_SELECTORS.reasonInput);
        if (reasonInput) {
          setInputValue(reasonInput, currentReason);
          log('Optionaler Grund eingetragen');
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
        showStatus(UI.statusTestDone, false, true);
        await showTestCompleteDialog(reportType, currentReason, currentOrderId);
        shouldSubmit = false;
      } else {
        showStatus(UI.statusWaitingConfirm);
        shouldSubmit = await showConfirmDialog(reportType, currentReason, currentOrderId);
      }

      if (!shouldSubmit) {
        showStatus(UI.statusAborted, true);
        await closeDialog();
        
        try {
          chrome.runtime.sendMessage({
            type: isDryRun ? 'TEST_COMPLETE' : 'REPORT_ABORTED',
            reportType,
            orderId: currentOrderId,
            url: window.location.href,
          });
        } catch (e) {}
        
        return;
      }

      // ========================================
      // Schritt 7: Klicke auf Senden
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

      try {
        chrome.runtime.sendMessage({
          type: 'REPORT_SUCCESS',
          reportType,
          orderId: currentOrderId,
          url: window.location.href,
        });
      } catch (e) {}

    } catch (error) {
      logError(error.message);
      showStatus(`${UI.statusError} ${error.message}`, true);
      
      try {
        chrome.runtime.sendMessage({
          type: 'REPORT_ERROR',
          reportType: currentReportType,
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

  // Hilfsfunktion zum Schließen des Dialogs
  async function closeDialog() {
    const closeBtn = findElement(window.MAPS_SELECTORS.closeButton) ||
                     findClickableByText(window.MAPS_TEXT_PATTERNS.cancel);
    if (closeBtn) {
      await simulateClick(closeBtn);
    }
    await sleep(1500);
    hideStatus();
  }

  // ============================================================================
  // INITIALISIERUNG
  // ============================================================================

  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('rr_melden') === '1') {
      const reportType = params.get('rr_type') || window.MAPS_DEFAULT_TYPE || 'doesnt_exist';
      const reason = params.get('rr_reason') || '';
      const orderId = params.get('rr_order') || '';
      const testMode = params.get('rr_test') === '1';
      
      log('Melde-Modus via URL-Parameter aktiviert');
      log(`Typ: ${reportType}, Grund: ${reason}, Auftrag: ${orderId}, Test: ${testMode}`);

      setTimeout(() => {
        runReportFlow(reportType, reason, orderId, testMode);
      }, 3000);
    }
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'START_REPORT') {
        const reportType = message.reportType || window.MAPS_DEFAULT_TYPE || 'doesnt_exist';
        log(`Melde-Modus via Extension-Message: Typ="${reportType}", Test=${message.testMode}`);
        runReportFlow(reportType, message.reason || '', message.orderId || '', message.testMode || false);
        sendResponse({ status: 'started' });
      } else if (message.type === 'GET_STATUS') {
        sendResponse({ isRunning, currentOrderId, currentReportType, isDryRun });
      }
      return true;
    });
  }

  function init() {
    log('Maps Melde-Helper initialisiert (v1.2 - Alle 8 Operating Status Optionen)');
    
    checkUrlParams();

    window.rrStartReport = runReportFlow;
    window.rrDebugButtons = debugLogButtons;
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();

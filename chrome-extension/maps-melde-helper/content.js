/**
 * RapidRemove Maps Melde-Helper
 * Automatisiert den Google Maps "Existiert nicht"-Melde-Flow.
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

  // UI-Strings (Deutsch)
  const UI = {
    confirmTitle: 'RapidRemove: Meldung absenden?',
    confirmMessage: 'Du bist dabei, das Profil als "existiert nicht" zu melden.',
    confirmOrderId: 'Auftrag:',
    confirmReason: 'Grund:',
    confirmYes: 'Ja, absenden',
    confirmNo: 'Abbrechen',
    statusSearching: 'Suche "Änderung vorschlagen"...',
    statusOpening: 'Öffne Bearbeitungsdialog...',
    statusSelectingClosed: 'Wähle "Geschlossen oder nicht vorhanden"...',
    statusSelectingDoesntExist: 'Wähle "Existiert nicht"...',
    statusFillingReason: 'Fülle Grund aus...',
    statusWaitingConfirm: 'Warte auf Bestätigung...',
    statusSubmitting: 'Sende Meldung...',
    statusDone: 'Meldung erfolgreich gesendet!',
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

  function showStatus(message, isError = false) {
    if (!statusOverlay) {
      statusOverlay = document.createElement('div');
      statusOverlay.id = 'rr-melde-status';
      document.body.appendChild(statusOverlay);
    }
    statusOverlay.textContent = message;
    statusOverlay.className = isError ? 'error' : '';
    statusOverlay.style.display = 'block';
    log(message);
  }

  function hideStatus() {
    if (statusOverlay) {
      statusOverlay.style.display = 'none';
    }
  }

  // Bestätigungsdialog
  function showConfirmDialog(reason, orderId) {
    return new Promise((resolve) => {
      // Entferne existierenden Dialog
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

      // ESC zum Abbrechen
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
  function simulateClick(element) {
    if (!element) return false;
    
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Kurze Pause
    return new Promise(resolve => {
      setTimeout(() => {
        // Verschiedene Klick-Methoden
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        ['mousedown', 'mouseup', 'click'].forEach(type => {
          const event = new MouseEvent(type, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
          });
          element.dispatchEvent(event);
        });

        resolve(true);
      }, 100);
    });
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

  // Hauptfunktion: Führt den Melde-Flow aus
  async function runReportFlow(reason, orderId) {
    if (isRunning) {
      log('Flow läuft bereits');
      return;
    }

    isRunning = true;
    currentReason = reason || '';
    currentOrderId = orderId || '';

    try {
      // Schritt 1: Finde "Änderung vorschlagen" Button
      showStatus(UI.statusSearching);
      
      let suggestBtn = findElement(window.MAPS_SELECTORS.suggestEditButton);
      if (!suggestBtn) {
        // Fallback: Suche nach Text
        suggestBtn = findByText('Änderung vorschlagen', 'button') ||
                     findByText('Suggest an edit', 'button') ||
                     findByText('Änderung vorschlagen', 'a') ||
                     findByText('Suggest an edit', 'a');
      }

      if (!suggestBtn) {
        throw new Error('Button "Änderung vorschlagen" nicht gefunden. Ist ein Profil geöffnet?');
      }

      // Schritt 2: Öffne den Dialog
      showStatus(UI.statusOpening);
      await simulateClick(suggestBtn);
      await sleep(1500);

      // Schritt 3: Wähle "Geschlossen oder nicht vorhanden"
      showStatus(UI.statusSelectingClosed);
      
      let closedOption = findElement(window.MAPS_SELECTORS.closedOrDoesntExistOption);
      if (!closedOption) {
        closedOption = findByText('Geschlossen oder nicht vorhanden', 'button') ||
                       findByText('Close or remove', 'button') ||
                       findByText('Schließen oder entfernen', 'button');
      }

      if (!closedOption) {
        // Manchmal ist es ein div oder span
        closedOption = findByText('Geschlossen', '*') ||
                       findByText('Close', '*');
      }

      if (!closedOption) {
        throw new Error('"Geschlossen oder nicht vorhanden" nicht gefunden');
      }

      await simulateClick(closedOption);
      await sleep(1000);

      // Schritt 4: Wähle "Existiert nicht"
      showStatus(UI.statusSelectingDoesntExist);
      
      let doesntExist = findElement(window.MAPS_SELECTORS.doesntExistOption);
      if (!doesntExist) {
        doesntExist = findByText('Existiert nicht', '*') ||
                      findByText("Doesn't exist", '*') ||
                      findByText('Place does not exist', '*') ||
                      findByText('Ort existiert nicht', '*');
      }

      if (!doesntExist) {
        throw new Error('"Existiert nicht" Option nicht gefunden');
      }

      await simulateClick(doesntExist);
      await sleep(1000);

      // Schritt 5: Fülle den Grund aus (falls vorhanden)
      if (currentReason) {
        showStatus(UI.statusFillingReason);
        
        let reasonInput = findElement(window.MAPS_SELECTORS.reasonInput);
        if (!reasonInput) {
          // Suche nach dem ersten sichtbaren Textarea
          const textareas = document.querySelectorAll('textarea');
          for (const ta of textareas) {
            if (ta.offsetParent !== null) {
              reasonInput = ta;
              break;
            }
          }
        }

        if (reasonInput) {
          setInputValue(reasonInput, currentReason);
          await sleep(500);
        } else {
          log('Kein Grund-Eingabefeld gefunden, überspringe...');
        }
      }

      // Schritt 6: Zeige Bestätigungsdialog
      showStatus(UI.statusWaitingConfirm);
      hideStatus();

      const confirmed = await showConfirmDialog(currentReason, currentOrderId);

      if (!confirmed) {
        showStatus(UI.statusAborted, true);
        
        // Schließe den Dialog
        const closeBtn = findElement(window.MAPS_SELECTORS.closeButton) ||
                         findByText('Abbrechen', 'button') ||
                         findByText('Cancel', 'button');
        if (closeBtn) {
          await simulateClick(closeBtn);
        }
        
        await sleep(1500);
        hideStatus();
        return;
      }

      // Schritt 7: Klicke auf Senden
      showStatus(UI.statusSubmitting);
      
      let submitBtn = findElement(window.MAPS_SELECTORS.submitButton);
      if (!submitBtn) {
        submitBtn = findByText('Senden', 'button') ||
                    findByText('Submit', 'button') ||
                    findByText('Send', 'button');
      }

      if (!submitBtn) {
        throw new Error('"Senden" Button nicht gefunden');
      }

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
      } catch (e) {
        // Extension-Kontext möglicherweise nicht verfügbar
      }

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
        });
      } catch (e) {
        // Extension-Kontext möglicherweise nicht verfügbar
      }

    } finally {
      isRunning = false;
    }
  }

  // Prüfe URL-Parameter beim Laden
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('rr_melden') === '1') {
      const reason = params.get('rr_reason') || '';
      const orderId = params.get('rr_order') || '';
      
      log('Melde-Modus via URL-Parameter aktiviert');
      log(`Grund: ${reason}, Auftrag: ${orderId}`);

      // Warte bis die Seite vollständig geladen ist
      setTimeout(() => {
        runReportFlow(reason, orderId);
      }, 3000);
    }
  }

  // Empfange Nachrichten vom Background-Script oder Popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'START_REPORT') {
        log('Melde-Modus via Extension-Message aktiviert');
        runReportFlow(message.reason || '', message.orderId || '');
        sendResponse({ status: 'started' });
      } else if (message.type === 'GET_STATUS') {
        sendResponse({ isRunning, currentOrderId });
      }
      return true; // async response
    });
  }

  // Initialisierung
  function init() {
    log('Maps Melde-Helper initialisiert');
    
    // Prüfe URL-Parameter
    checkUrlParams();

    // Exponiere Funktion global für Debug-Zwecke
    window.rrStartReport = runReportFlow;
  }

  // Starte nach DOM-Ready
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();

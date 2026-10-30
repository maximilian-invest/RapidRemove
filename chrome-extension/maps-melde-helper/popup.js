/**
 * RapidRemove Maps Melde-Helper - Popup Script
 * Mit robuster Script-Injection für bereits geöffnete Tabs
 */

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const reasonInput = document.getElementById('reason');
  const orderIdInput = document.getElementById('orderId');
  const testModeToggle = document.getElementById('testMode');
  const testModeRow = document.getElementById('testModeRow');
  const statusDiv = document.getElementById('status');
  const logsDiv = document.getElementById('logs');
  const typeGroup = document.getElementById('typeGroup');
  
  // Report-Typ Labels für Anzeige
  const TYPE_LABELS = {
    doesnt_exist: "Existiert nicht",
    temporarily_closed: "Vorübergehend geschl.",
    permanently_closed: "Dauerhaft geschl.",
    duplicate: "Duplikat",
    moved: "Umgezogen",
    offensive: "Anstößig",
    not_public: "Nicht öffentlich",
    other: "Sonstiges",
  };

  // Aktuell gewählter Typ
  let selectedType = 'doesnt_exist';

  // Radio-Button Handling
  typeGroup.querySelectorAll('.radio-option').forEach(option => {
    option.addEventListener('click', () => {
      typeGroup.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        selectedType = radio.value;
      }
      updateButtonText();
    });
  });

  // Testmodus-Toggle UI aktualisieren
  function updateTestModeUI() {
    const isTest = testModeToggle.checked;
    testModeRow.classList.toggle('test-mode', isTest);
    updateButtonText();
  }

  function updateButtonText() {
    const isTest = testModeToggle.checked;
    startBtn.textContent = isTest ? '🧪 Test starten' : 'Meldung starten';
    startBtn.classList.toggle('btn-test', isTest);
    startBtn.classList.toggle('btn-primary', !isTest);
  }

  testModeToggle.addEventListener('change', () => {
    updateTestModeUI();
    chrome.storage.local.set({ testMode: testModeToggle.checked });
  });

  // Lade gespeicherte Einstellungen
  chrome.storage.local.get(['testMode', 'lastReportType'], (data) => {
    testModeToggle.checked = data.testMode || false;
    if (data.lastReportType) {
      const option = typeGroup.querySelector(`[data-type="${data.lastReportType}"]`);
      if (option) {
        typeGroup.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          selectedType = radio.value;
        }
      }
    }
    updateTestModeUI();
  });

  // Status anzeigen
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }

  // Prüfe ob URL eine Google Maps Seite ist
  function isGoogleMapsUrl(url) {
    if (!url) return false;
    // Alle möglichen Google Maps URL-Patterns
    const patterns = [
      /^https:\/\/(www\.)?google\.[a-z.]+\/maps/i,
      /^https:\/\/maps\.google\.[a-z.]+\//i,
    ];
    return patterns.some(p => p.test(url));
  }

  // Injiziere Content-Scripts in einen Tab (inkl. alle Frames)
  async function injectContentScripts(tabId) {
    console.log('[Popup] Injiziere Content-Scripts in Tab', tabId, '(alle Frames)');
    
    try {
      // Erst CSS injizieren (alle Frames)
      await chrome.scripting.insertCSS({
        target: { tabId, allFrames: true },
        files: ['styles.css']
      });
      
      // Dann JS injizieren (Reihenfolge wichtig: selectors.js vor content.js)
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['selectors.js']
      });
      
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['content.js']
      });
      
      console.log('[Popup] Content-Scripts erfolgreich in alle Frames injiziert');
      return true;
    } catch (error) {
      console.error('[Popup] Script-Injection fehlgeschlagen:', error);
      return false;
    }
  }

  // Sende Nachricht an Content-Script mit Retry und Auto-Injection
  async function sendMessageWithRetry(tabId, message, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Popup] Sende Nachricht (Versuch ${attempt + 1})`);
        const response = await chrome.tabs.sendMessage(tabId, message);
        return response;
      } catch (error) {
        console.log(`[Popup] sendMessage fehlgeschlagen:`, error.message);
        
        // "Receiving end does not exist" = Content-Script nicht geladen
        if (error.message.includes('Receiving end does not exist') || 
            error.message.includes('Could not establish connection')) {
          
          if (attempt < maxRetries) {
            console.log('[Popup] Content-Script nicht geladen, injiziere...');
            const injected = await injectContentScripts(tabId);
            
            if (injected) {
              // Warte kurz, damit das Script initialisiert wird
              await new Promise(resolve => setTimeout(resolve, 500));
              continue; // Nächster Versuch
            }
          }
        }
        
        // Letzter Versuch oder anderer Fehler
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  // Logs laden und anzeigen
  async function loadLogs() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_LOGS' });
      const logs = response.logs || [];
      
      if (logs.length === 0) {
        logsDiv.innerHTML = '<em>Noch keine Aktionen</em>';
        return;
      }
      
      logsDiv.innerHTML = logs.slice(-8).reverse().map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const statusClass = `log-${log.status}`;
        const statusText = {
          success: '✓',
          error: '✗',
          opened: '→',
          test: '🧪',
          aborted: '⊘'
        }[log.status] || log.status;
        
        const testBadge = log.testMode ? '<span class="badge badge-test">TEST</span>' : '';
        const typeBadge = log.reportType ? `<span class="badge badge-type">${TYPE_LABELS[log.reportType] || log.reportType}</span>` : '';
        
        return `<div class="log-entry ${statusClass}">
          <strong>${statusText}</strong>${typeBadge}${testBadge} ${log.orderId || ''} 
          <small>(${time})</small>
          ${log.error ? `<br><small style="color:#c62828">${log.error.substring(0, 40)}...</small>` : ''}
        </div>`;
      }).join('');
    } catch (e) {
      console.error('Logs laden fehlgeschlagen:', e);
    }
  }

  // Prüfe ob wir auf einer Google Maps Seite sind
  async function checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url || '';
      const isMapsPage = isGoogleMapsUrl(url);
      
      if (!isMapsPage) {
        startBtn.disabled = true;
        showStatus('Bitte öffne zuerst ein Google Maps Profil', 'warning');
      }
      
      return { tab, isMapsPage };
    } catch (e) {
      console.error('Tab-Check fehlgeschlagen:', e);
      return { tab: null, isMapsPage: false };
    }
  }

  // Meldung starten
  startBtn.addEventListener('click', async () => {
    const reason = reasonInput.value.trim();
    const orderId = orderIdInput.value.trim();
    const testMode = testModeToggle.checked;
    const reportType = selectedType;
    
    // Speichere letzte Auswahl
    chrome.storage.local.set({ lastReportType: reportType });
    
    startBtn.disabled = true;
    showStatus(testMode ? 'Starte Test...' : 'Starte Meldung...', 'info');
    
    try {
      const { tab, isMapsPage } = await checkCurrentTab();
      
      if (!tab) {
        showStatus('Kein aktiver Tab gefunden', 'error');
        startBtn.disabled = false;
        return;
      }
      
      if (!isMapsPage) {
        showStatus('Bitte öffne zuerst ein Google Maps Unternehmensprofil', 'error');
        startBtn.disabled = false;
        return;
      }
      
      // Erst sicherstellen, dass Scripts in allen Frames geladen sind
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
      } catch (e) {
        console.log('[Popup] PING fehlgeschlagen, injiziere Scripts...');
        await injectContentScripts(tab.id);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Sende Nachricht an Background, der an den Tab weiterleitet
      const response = await chrome.runtime.sendMessage({
        type: 'START_REPORT',
        targetTabId: tab.id,
        reportType,
        reason,
        orderId,
        testMode,
      });
      
      if (response && (response.status === 'started' || !response.error)) {
        showStatus(
          testMode 
            ? `Test gestartet (${TYPE_LABELS[reportType]})` 
            : `Meldung gestartet (${TYPE_LABELS[reportType]})`, 
          'success'
        );
        
        setTimeout(() => {
          chrome.tabs.update(tab.id, { active: true });
          window.close();
        }, 800);
      } else {
        showStatus(response?.error || 'Konnte nicht starten – bitte Seite neu laden', 'error');
        startBtn.disabled = false;
      }
      
    } catch (e) {
      console.error('Fehler:', e);
      
      // Benutzerfreundliche Fehlermeldungen auf Deutsch
      let errorMsg = 'Unbekannter Fehler';
      
      if (e.message.includes('Cannot access') || e.message.includes('chrome://')) {
        errorMsg = 'Diese Seite kann nicht automatisiert werden (Browser-interne Seite)';
      } else if (e.message.includes('Receiving end') || e.message.includes('Could not establish')) {
        errorMsg = 'Content-Script konnte nicht geladen werden – bitte Seite neu laden und erneut versuchen';
      } else if (e.message.includes('permission')) {
        errorMsg = 'Keine Berechtigung für diese Seite – ist es Google Maps?';
      } else {
        errorMsg = e.message || 'Unbekannter Fehler';
      }
      
      showStatus(errorMsg, 'error');
      startBtn.disabled = false;
    }
  });

  // Initialisierung
  checkCurrentTab();
  loadLogs();
});

/**
 * RapidRemove Maps Melde-Helper - Popup Script
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
      // Entferne "selected" von allen
      typeGroup.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
      // Setze "selected" auf geklicktes
      option.classList.add('selected');
      // Radio-Input aktivieren
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
      const isMapsPage = url.includes('google.com/maps') || url.includes('google.de/maps');
      
      if (!isMapsPage) {
        startBtn.disabled = true;
        showStatus('Öffne zuerst ein Google Maps Profil', 'warning');
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
      
      if (!isMapsPage) {
        showStatus('Öffne zuerst ein Google Maps Profil', 'error');
        startBtn.disabled = false;
        return;
      }
      
      // Sende Nachricht an Content-Script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'START_REPORT',
        reportType,
        reason,
        orderId,
        testMode,
      });
      
      if (response && response.status === 'started') {
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
        showStatus('Konnte nicht starten', 'error');
        startBtn.disabled = false;
      }
      
    } catch (e) {
      console.error('Fehler:', e);
      showStatus(`Fehler: ${e.message || 'Content-Script nicht geladen'}`, 'error');
      startBtn.disabled = false;
    }
  });

  // Initialisierung
  checkCurrentTab();
  loadLogs();
});

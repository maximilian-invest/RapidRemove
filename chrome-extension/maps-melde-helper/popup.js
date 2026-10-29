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

  // Testmodus-Toggle UI aktualisieren
  function updateTestModeUI() {
    const isTest = testModeToggle.checked;
    testModeRow.classList.toggle('test-mode', isTest);
    startBtn.textContent = isTest ? '🧪 Test starten' : 'Meldung starten';
    startBtn.classList.toggle('btn-test', isTest);
    startBtn.classList.toggle('btn-primary', !isTest);
  }

  testModeToggle.addEventListener('change', () => {
    updateTestModeUI();
    // Speichere Einstellung
    chrome.storage.local.set({ testMode: testModeToggle.checked });
  });

  // Lade gespeicherte Einstellung
  chrome.storage.local.get('testMode', (data) => {
    testModeToggle.checked = data.testMode || false;
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
      
      logsDiv.innerHTML = logs.slice(-10).reverse().map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString('de-DE');
        const statusClass = `log-${log.status}`;
        const statusText = {
          success: '✓ Gesendet',
          error: '✗ Fehler',
          opened: '→ Geöffnet',
          test: '🧪 Test OK',
          aborted: '⊘ Abgebrochen'
        }[log.status] || log.status;
        
        const testBadge = log.testMode ? '<span class="badge badge-test">TEST</span>' : '';
        
        return `<div class="log-entry ${statusClass}">
          <strong>${statusText}</strong>${testBadge} ${log.orderId || ''} 
          <small>(${time})</small>
          ${log.error ? `<br><small>${log.error}</small>` : ''}
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
        reason,
        orderId,
        testMode,
      });
      
      if (response && response.status === 'started') {
        showStatus(
          testMode 
            ? 'Test gestartet! Wechsle zum Tab...' 
            : 'Meldung gestartet! Wechsle zum Tab...', 
          'success'
        );
        
        // Schließe Popup und wechsle zum Tab
        setTimeout(() => {
          chrome.tabs.update(tab.id, { active: true });
          window.close();
        }, 1000);
      } else {
        showStatus('Konnte nicht starten', 'error');
        startBtn.disabled = false;
      }
      
    } catch (e) {
      console.error('Fehler:', e);
      showStatus(`Fehler: ${e.message || 'Unbekannt'}`, 'error');
      startBtn.disabled = false;
    }
  });

  // Initialisierung
  checkCurrentTab();
  loadLogs();
});

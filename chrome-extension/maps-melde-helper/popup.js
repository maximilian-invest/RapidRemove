/**
 * RapidRemove Maps Melde-Helper - Popup Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const reasonInput = document.getElementById('reason');
  const orderIdInput = document.getElementById('orderId');
  const statusDiv = document.getElementById('status');
  const logsDiv = document.getElementById('logs');

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
        logsDiv.innerHTML = '<em>Noch keine Meldungen</em>';
        return;
      }
      
      logsDiv.innerHTML = logs.slice(-10).reverse().map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString('de-DE');
        const statusClass = `log-${log.status}`;
        const statusText = {
          success: '✓ Gesendet',
          error: '✗ Fehler',
          opened: '→ Geöffnet'
        }[log.status] || log.status;
        
        return `<div class="log-entry ${statusClass}">
          <strong>${statusText}</strong> ${log.orderId || ''} 
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
        showStatus('Öffne zuerst ein Google Maps Profil', 'info');
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
    
    startBtn.disabled = true;
    showStatus('Starte Meldung...', 'info');
    
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
      });
      
      if (response && response.status === 'started') {
        showStatus('Meldung gestartet! Wechsle zum Tab...', 'success');
        
        // Schließe Popup und wechsle zum Tab
        setTimeout(() => {
          chrome.tabs.update(tab.id, { active: true });
          window.close();
        }, 1000);
      } else {
        showStatus('Konnte Meldung nicht starten', 'error');
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

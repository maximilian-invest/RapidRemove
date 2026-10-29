/**
 * RapidRemove Maps Melde-Helper - Background Service Worker
 * Koordiniert zwischen Top-Frame und Iframe(s)
 */

const reportLogs = [];

// Aktiver Report-State (pro Tab)
const activeReports = new Map();

function logReport(entry) {
  entry.timestamp = new Date().toISOString();
  reportLogs.push(entry);
  if (reportLogs.length > 100) reportLogs.shift();
  chrome.storage.local.set({ reportLogs: reportLogs.slice(-50) });
  console.log('[RR-BG]', entry);
}

// Nachrichten-Handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  
  console.log('[RR-BG] Message:', message.type, 'from tab:', tabId, 'frame:', sender.frameId);

  switch (message.type) {
    // === Report Flow ===
    
    case 'START_REPORT': {
      // Von Popup: Starte Report im Tab
      const { targetTabId, reportType, reason, orderId, testMode } = message;
      
      console.log('[RR-BG] START_REPORT for tab', targetTabId, 'type:', reportType);
      
      activeReports.set(targetTabId, {
        reportType,
        reason,
        orderId,
        testMode,
        step: 'starting',
        startedAt: Date.now(),
      });
      
      // Sende an Top-Frame (frameId: 0)
      chrome.tabs.sendMessage(targetTabId, {
        type: 'REPORT_START',
        reportType,
        reason,
        orderId,
        testMode,
      }, { frameId: 0 })
        .then(() => {
          console.log('[RR-BG] REPORT_START sent successfully to top frame');
          sendResponse({ status: 'started' });
        })
        .catch(err => {
          console.log('[RR-BG] REPORT_START failed:', err.message);
          // Versuche an alle Frames
          chrome.tabs.sendMessage(targetTabId, {
            type: 'REPORT_START',
            reportType,
            reason,
            orderId,
            testMode,
          })
            .then(() => sendResponse({ status: 'started' }))
            .catch(err2 => sendResponse({ error: err2.message }));
        });
      
      return true;
    }
    
    case 'STEP_COMPLETED': {
      // Ein Frame hat einen Schritt abgeschlossen
      const state = activeReports.get(tabId);
      if (!state) return;
      
      console.log('[RR-BG] Step completed:', message.step, 'next:', message.nextStep);
      state.step = message.nextStep;
      
      // Broadcast an alle Frames: nächster Schritt
      chrome.tabs.sendMessage(tabId, {
        type: 'CONTINUE_REPORT',
        step: message.nextStep,
        ...state,
      }).catch(err => console.log('[RR-BG] Broadcast error:', err.message));
      
      sendResponse({ ok: true });
      return true;
    }
    
    case 'REPORT_SUCCESS': {
      logReport({
        status: 'success',
        reportType: message.reportType,
        orderId: message.orderId,
        url: message.url,
        testMode: false,
      });
      activeReports.delete(tabId);
      sendResponse({ received: true });
      return true;
    }
    
    case 'REPORT_ERROR': {
      logReport({
        status: 'error',
        reportType: message.reportType,
        orderId: message.orderId,
        error: message.error,
        url: message.url,
        testMode: message.testMode || false,
      });
      activeReports.delete(tabId);
      sendResponse({ received: true });
      return true;
    }
    
    case 'TEST_COMPLETE': {
      logReport({
        status: 'test',
        reportType: message.reportType,
        orderId: message.orderId,
        url: message.url,
        testMode: true,
      });
      activeReports.delete(tabId);
      sendResponse({ received: true });
      return true;
    }
    
    case 'REPORT_ABORTED': {
      logReport({
        status: 'aborted',
        reportType: message.reportType,
        orderId: message.orderId,
        url: message.url,
      });
      activeReports.delete(tabId);
      sendResponse({ received: true });
      return true;
    }
    
    // === Frame Discovery ===
    
    case 'FRAME_READY': {
      // Ein Frame meldet sich bereit
      console.log('[RR-BG] Frame ready:', message.frameUrl, 'isTop:', message.isTop);
      
      // Wenn ein Report aktiv ist, informiere den Frame
      const state = activeReports.get(tabId);
      if (state) {
        sendResponse({ 
          activeReport: true,
          ...state 
        });
      } else {
        sendResponse({ activeReport: false });
      }
      return true;
    }
    
    case 'FOUND_RADIO_OPTIONS': {
      // Ein Frame hat die Radio-Optionen gefunden
      console.log('[RR-BG] Frame found radio options:', message.frameUrl);
      const state = activeReports.get(tabId);
      if (state) {
        state.radioFrameId = sender.frameId;
        state.radioFrameUrl = message.frameUrl;
      }
      sendResponse({ ok: true });
      return true;
    }
    
    case 'GET_ACTIVE_REPORT': {
      const state = activeReports.get(tabId);
      sendResponse(state || null);
      return true;
    }
    
    // === Logs ===
    
    case 'GET_LOGS': {
      sendResponse({ logs: reportLogs });
      return true;
    }
    
    case 'OPEN_AND_REPORT': {
      const { mapsUrl, reportType, reason, orderId, testMode } = message;
      
      if (!mapsUrl) {
        sendResponse({ error: 'Keine Maps-URL angegeben' });
        return true;
      }
      
      const url = new URL(mapsUrl);
      url.searchParams.set('rr_melden', '1');
      if (reportType) url.searchParams.set('rr_type', reportType);
      if (reason) url.searchParams.set('rr_reason', reason);
      if (orderId) url.searchParams.set('rr_order', orderId);
      if (testMode) url.searchParams.set('rr_test', '1');
      
      chrome.tabs.create({ url: url.toString() }, (tab) => {
        logReport({
          status: 'opened',
          reportType,
          orderId,
          url: mapsUrl,
          tabId: tab.id,
          testMode: testMode || false,
        });
        sendResponse({ success: true, tabId: tab.id });
      });
      
      return true;
    }
  }
  
  return true;
});

// Lade gespeicherte Logs
chrome.storage.local.get('reportLogs', (data) => {
  if (data.reportLogs) {
    reportLogs.push(...data.reportLogs);
    console.log('[RR-BG] Loaded logs:', reportLogs.length);
  }
});

console.log('[RR-BG] Service Worker started v1.2.3 (Frame coordination)');

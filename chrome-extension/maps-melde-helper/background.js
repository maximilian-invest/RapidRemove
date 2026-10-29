/**
 * RapidRemove Maps Melde-Helper - Background Service Worker
 * 
 * Aufgaben:
 * 1. Öffnet Google Maps URLs mit Melde-Parametern
 * 2. Verarbeitet Deep-Links vom RapidRemove Admin
 * 3. Speichert Erfolgs-/Fehler-Logs
 */

// Log-Speicher (wird bei Extension-Neustart geleert)
const reportLogs = [];

// Hilfsfunktion: Logs speichern
function logReport(entry) {
  entry.timestamp = new Date().toISOString();
  reportLogs.push(entry);
  
  // Behalte nur die letzten 100 Einträge
  if (reportLogs.length > 100) {
    reportLogs.shift();
  }
  
  // Speichere in chrome.storage für Persistenz
  chrome.storage.local.set({ reportLogs: reportLogs.slice(-50) });
  
  console.log('[RR-MeldeHelper BG]', entry);
}

// Nachrichten vom Content-Script empfangen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REPORT_SUCCESS') {
    logReport({
      status: 'success',
      orderId: message.orderId,
      url: message.url,
      testMode: false,
    });
    sendResponse({ received: true });
    
  } else if (message.type === 'REPORT_ERROR') {
    logReport({
      status: 'error',
      orderId: message.orderId,
      error: message.error,
      url: message.url,
      testMode: message.testMode || false,
    });
    sendResponse({ received: true });
    
  } else if (message.type === 'TEST_COMPLETE') {
    logReport({
      status: 'test',
      orderId: message.orderId,
      url: message.url,
      testMode: true,
    });
    sendResponse({ received: true });
    
  } else if (message.type === 'REPORT_ABORTED') {
    logReport({
      status: 'aborted',
      orderId: message.orderId,
      url: message.url,
      testMode: false,
    });
    sendResponse({ received: true });
    
  } else if (message.type === 'GET_LOGS') {
    sendResponse({ logs: reportLogs });
    
  } else if (message.type === 'OPEN_AND_REPORT') {
    // Öffne Google Maps URL mit Melde-Parametern
    const { mapsUrl, reason, orderId, testMode } = message;
    
    if (!mapsUrl) {
      sendResponse({ error: 'Keine Maps-URL angegeben' });
      return true;
    }
    
    // Füge Parameter hinzu
    const url = new URL(mapsUrl);
    url.searchParams.set('rr_melden', '1');
    if (reason) url.searchParams.set('rr_reason', reason);
    if (orderId) url.searchParams.set('rr_order', orderId);
    if (testMode) url.searchParams.set('rr_test', '1');
    
    // Öffne in neuem Tab
    chrome.tabs.create({ url: url.toString() }, (tab) => {
      logReport({
        status: 'opened',
        orderId,
        url: mapsUrl,
        tabId: tab.id,
        testMode: testMode || false,
      });
      sendResponse({ success: true, tabId: tab.id });
    });
    
    return true; // async response
    
  } else if (message.type === 'START_REPORT_IN_TAB') {
    // Starte Report in einem spezifischen Tab
    const { tabId, reason, orderId, testMode } = message;
    
    chrome.tabs.sendMessage(tabId, {
      type: 'START_REPORT',
      reason,
      orderId,
      testMode: testMode || false,
    }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response);
      }
    });
    
    return true; // async response
  }
  
  return true;
});

// Beim Start: Lade gespeicherte Logs
chrome.storage.local.get('reportLogs', (data) => {
  if (data.reportLogs) {
    reportLogs.push(...data.reportLogs);
    console.log('[RR-MeldeHelper BG] Geladene Logs:', reportLogs.length);
  }
});

console.log('[RR-MeldeHelper BG] Service Worker gestartet (v1.1 - EN+DE Support, Testmodus)');

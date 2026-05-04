const monitoredDomains = [
  'chatgpt.com',
  'claude.ai',
  'copilot.microsoft.com',
  'gemini.google.com',
  'perplexity.ai',
  'poe.com',
  'whatsapp.com',
  'web.whatsapp.com',
  'telegram.org',
  'youtube.com',
  'google.com',
  'bing.com'
];

const searchHosts = new Map([
  ['www.google.com', 'q'],
  ['google.com', 'q'],
  ['www.bing.com', 'q'],
  ['bing.com', 'q'],
  ['duckduckgo.com', 'q'],
  ['search.yahoo.com', 'p']
]);

let session = null;
let activeExamTabId = null;
let lastUrlByTab = new Map();
let lastEventAt = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'EXAM_PROCTOR_START') {
    session = {
      attemptId: Number(message.attemptId),
      accessCode: message.accessCode,
      examTitle: message.examTitle,
      apiBaseUrl: message.apiBaseUrl,
      startedAt: Date.now()
    };
    chrome.storage.local.set({ examSupervisorLastStatus: `Conectada al intento #${session.attemptId}` });
    activeExamTabId = sender.tab?.id ?? null;
    reportEvent('extension_connected', 'Extension anti-copia conectada al intento.', { severity: 'leve' });
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === 'EXAM_PROCTOR_STOP') {
    if (session?.attemptId === Number(message.attemptId)) {
      reportEvent('extension_disconnected', 'Extension anti-copia finalizada para el intento.', { severity: 'leve' });
      chrome.storage.local.set({ examSupervisorLastStatus: 'Sin examen activo.' });
      session = null;
      activeExamTabId = null;
    }
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!session || tabId === activeExamTabId) return;
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab) return;
  reportNavigation(tab, 'tab_activated');
});

chrome.tabs.onCreated.addListener((tab) => {
  if (!session) return;
  const details = tab.url
    ? `Nueva pestana abierta: ${tab.url}`
    : 'Nueva pestana abierta sin URL visible todavia.';
  reportEvent('new_tab', details, { url: tab.url ?? '', title: tab.title ?? '', severity: 'media' });
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (!session || !changeInfo.url) return;
  reportNavigation(tab, 'url_changed');
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (!session || details.frameId !== 0 || details.tabId === activeExamTabId) return;
  reportUrl(details.url, 'web_navigation', '');
});

function reportNavigation(tab, eventType) {
  if (!tab?.url) {
    reportEvent(eventType, 'Cambio a pestana sin URL visible.', { severity: 'media' });
    return;
  }

  if (tab.id !== undefined && lastUrlByTab.get(tab.id) === tab.url && eventType !== 'tab_activated') return;
  if (tab.id !== undefined) lastUrlByTab.set(tab.id, tab.url);

  reportUrl(tab.url, eventType, tab.title ?? '');
}

function reportUrl(rawUrl, eventType, title) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    reportEvent(eventType, `Navegacion detectada: ${rawUrl}`, { url: rawUrl, title, severity: 'media' });
    return;
  }

  const host = parsed.hostname.replace(/^www\./, '');
  const searchParam = searchHosts.get(parsed.hostname) ?? searchHosts.get(host);
  const query = searchParam ? parsed.searchParams.get(searchParam) : '';
  const monitored = monitoredDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  const severity = monitored || query ? 'grave' : 'media';
  const reason = query
    ? `Busqueda detectada en ${host}: "${query}"`
    : monitored
      ? `Sitio restringido detectado: ${host}`
      : `Navegacion fuera del examen: ${host || rawUrl}`;

  reportEvent(query ? 'search_detected' : eventType, reason, {
    url: rawUrl,
    title,
    severity,
    query: query ?? ''
  });
}

async function reportEvent(eventType, message, metadata = {}) {
  if (!session?.attemptId || !session.apiBaseUrl) return;

  const dedupeKey = `${eventType}:${metadata.url ?? ''}:${message}`;
  const now = Date.now();
  if ((lastEventAt.get(dedupeKey) ?? 0) + 1400 > now) return;
  lastEventAt.set(dedupeKey, now);

  const severity = normalizeSeverity(metadata.severity);
  const details = `[${severity.toUpperCase()}] ${message}${metadata.url ? ` | URL: ${metadata.url}` : ''}${metadata.title ? ` | Titulo: ${metadata.title}` : ''}`;

  await fetch(`${session.apiBaseUrl}/api/security-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId: session.attemptId,
      eventType,
      severity,
      source: 'extension',
      details,
      metadata
    })
  }).catch(() => {});

  if (activeExamTabId) {
    chrome.tabs.sendMessage(
      activeExamTabId,
      {
        type: 'EXTENSION_EVENT',
        eventType,
        details
      },
      () => void chrome.runtime.lastError
    );
  }
}

function normalizeSeverity(value) {
  if (['leve', 'media', 'grave'].includes(value)) return value;
  if (value === 'low' || value === 'info') return 'leve';
  if (value === 'medium') return 'media';
  if (value === 'high') return 'grave';
  return 'media';
}

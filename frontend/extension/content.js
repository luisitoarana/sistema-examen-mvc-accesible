const SOURCE_PAGE = 'exam-web-app';
const SOURCE_EXTENSION = 'exam-proctor-extension';

window.postMessage({ source: SOURCE_EXTENSION, type: 'EXTENSION_READY' }, window.location.origin);

window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.source !== SOURCE_PAGE) return;
  if (!['EXAM_PROCTOR_START', 'EXAM_PROCTOR_STOP'].includes(event.data.type)) return;

  chrome.runtime.sendMessage(event.data, (response) => {
    if (chrome.runtime.lastError) return;
    if (response?.ok) {
      window.postMessage({
        source: SOURCE_EXTENSION,
        type: 'EXTENSION_READY'
      }, window.location.origin);
    }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'EXTENSION_EVENT') return;
  window.postMessage({
    source: SOURCE_EXTENSION,
    type: 'EXTENSION_EVENT',
    eventType: message.eventType,
    details: message.details
  }, window.location.origin);
});

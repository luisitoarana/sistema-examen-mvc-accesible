chrome.storage.local.get(['examSupervisorLastStatus'], (data) => {
  document.querySelector('#status').textContent = data.examSupervisorLastStatus ?? 'Activa cuando un examen esta abierto.';
});

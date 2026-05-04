import { useEffect, useRef, useState } from 'react';
import { reportSecurityEvent } from '../api/client.js';

/**
 * Captura eventos del navegador que indiquen intentos de fraude:
 * cambio de pestana, perdida de foco, salida de pantalla completa,
 * menu contextual, copiar/pegar, seleccion de texto y atajos de teclado.
 *
 * Tambien dialoga con la extension institucional via window.postMessage.
 */
export function useExamProctor({ attemptId, attempt }) {
  const [incidents, setIncidents] = useState(attempt?.incidentCount ?? 0);
  const [message, setMessage] = useState('Supervision activa.');
  const [extensionStatus, setExtensionStatus] = useState('checking');
  const lastEventAt = useRef(0);
  const finished = useRef(false);

  function finishProctor() {
    finished.current = true;
  }

  async function reportIncident(eventType, details, severity = 'media') {
    const now = Date.now();
    if (finished.current || now - lastEventAt.current < 1100) return;
    lastEventAt.current = now;
    setIncidents((count) => count + 1);
    setMessage(details);
    reportSecurityEvent({ attemptId, eventType, details, severity, source: 'web' })
      .catch(() => setMessage('El incidente no pudo registrarse. Avisa al docente.'));
  }

  // Extension de navegador (Manifest V3)
  useEffect(() => {
    function onExtensionMessage(event) {
      if (event.source !== window || event.data?.source !== 'exam-proctor-extension') return;
      if (event.data.type === 'EXTENSION_READY') setExtensionStatus('active');
      if (event.data.type === 'EXTENSION_EVENT') {
        setIncidents((count) => count + 1);
        setMessage(event.data.details ?? 'Evento registrado por extension.');
      }
    }

    window.addEventListener('message', onExtensionMessage);
    window.postMessage({
      source: 'exam-web-app',
      type: 'EXAM_PROCTOR_START',
      attemptId,
      accessCode: attempt?.accessCode,
      examTitle: attempt?.examTitle,
      apiBaseUrl: window.location.origin
    }, window.location.origin);

    const check = window.setTimeout(() => {
      setExtensionStatus((current) => (current === 'checking' ? 'missing' : current));
    }, 1600);

    return () => {
      window.clearTimeout(check);
      window.postMessage({
        source: 'exam-web-app',
        type: 'EXAM_PROCTOR_STOP',
        attemptId
      }, window.location.origin);
      window.removeEventListener('message', onExtensionMessage);
    };
  }, [attemptId, attempt?.accessCode, attempt?.examTitle]);

  // Eventos del DOM
  useEffect(() => {
    const selectedText = () => window.getSelection()?.toString().trim() ?? '';

    const onVisibility = () => {
      if (document.hidden) {
        reportIncident(
          'tab_hidden',
          'El navegador oculto la pestana del examen o fue minimizado.',
          'media'
        );
      }
    };
    const onBlur = () => reportIncident(
      'window_blur',
      'La ventana perdio el foco. El navegador no permite identificar con precision la app o pestana externa.',
      'media'
    );
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        reportIncident('fullscreen_exit', 'El estudiante salio de pantalla completa.', 'grave');
      }
    };
    const onContextMenu = (event) => {
      event.preventDefault();
      reportIncident('context_menu', 'Se intento abrir el menu contextual del navegador.', 'media');
    };
    const onClipboard = (event) => {
      event.preventDefault();
      reportIncident(
        event.type,
        `Se intento usar ${event.type === 'copy' ? 'copiar' : 'pegar'} durante el examen.`,
        'grave'
      );
    };
    const onSelection = () => {
      const text = selectedText();
      if (text.length >= 12) {
        reportIncident(
          'text_selection',
          'Se selecciono texto del examen; esto puede activar asistentes o extensiones de respuesta.',
          'media'
        );
        window.getSelection()?.removeAllRanges();
      }
    };
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const blockedCtrl = event.ctrlKey
        && ['c', 'v', 'x', 'a', 'l', 't', 'n', 'w', 'r', 'p', 's', 'u', 'f'].includes(key);
      const blockedAlt = event.altKey && ['tab', 'f4'].includes(key);
      if (blockedCtrl || blockedAlt || key === 'printscreen') {
        event.preventDefault();
        const prefix = event.ctrlKey ? 'Ctrl+' : event.altKey ? 'Alt+' : '';
        reportIncident('blocked_shortcut', `Atajo bloqueado: ${prefix}${event.key}.`, 'grave');
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onClipboard);
    document.addEventListener('paste', onClipboard);
    document.addEventListener('selectionchange', onSelection);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onClipboard);
      document.removeEventListener('paste', onClipboard);
      document.removeEventListener('selectionchange', onSelection);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { incidents, message, setMessage, extensionStatus, finishProctor };
}

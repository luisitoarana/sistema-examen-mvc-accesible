export const questionTypes = {
  multiple_choice: 'Opcion multiple',
  true_false: 'Verdadero / falso',
  short_answer: 'Respuesta corta'
};

export function labelEvent(eventType) {
  const labels = {
    tab_hidden: 'Pestana oculta o minimizada',
    window_blur: 'Perdida de foco',
    fullscreen_exit: 'Salida de pantalla completa',
    context_menu: 'Menu contextual bloqueado',
    copy: 'Intento de copiar',
    paste: 'Intento de pegar',
    text_selection: 'Seleccion de texto detectada',
    blocked_shortcut: 'Atajo bloqueado',
    extension_connected: 'Extension conectada',
    extension_disconnected: 'Extension finalizada',
    new_tab: 'Nueva pestana',
    tab_activated: 'Cambio de pestana',
    url_changed: 'URL visitada',
    web_navigation: 'Navegacion web',
    search_detected: 'Busqueda detectada',
    desktop_active_window: 'Ventana activa (escritorio)',
    desktop_screenshot_attempt: 'Captura detectada (escritorio)',
    desktop_screen_recorder: 'Grabador de pantalla detectado',
    desktop_lifecycle: 'Cambio de estado (escritorio)',
    desktop_keyboard_block: 'Atajo bloqueado (escritorio)'
  };
  return labels[eventType] ?? eventType;
}

export function labelSeverity(severity) {
  return { leve: 'Leve', media: 'Media', grave: 'Grave' }[severity] ?? 'Media';
}

export function labelSource(source) {
  return { web: 'Web', extension: 'Extension', desktop: 'Escritorio' }[source] ?? 'Web';
}

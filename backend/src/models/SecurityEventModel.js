import { db } from '../config/database.js';

const VALID_SEVERITIES = ['leve', 'media', 'grave'];
const VALID_SOURCES = ['web', 'extension', 'desktop'];
const VALID_EVENTS = new Set([
  'tab_hidden', 'window_blur', 'fullscreen_exit', 'context_menu',
  'copy', 'paste', 'text_selection', 'blocked_shortcut',
  'new_tab', 'tab_activated', 'url_changed', 'web_navigation',
  'search_detected', 'desktop_active_window', 'desktop_screenshot_attempt',
  'desktop_screen_recorder', 'desktop_lifecycle', 'desktop_window_minimized',
  'desktop_keyboard_block'
]);

function normalizeSeverity(value) {
  const severity = String(value ?? '').toLowerCase();
  return VALID_SEVERITIES.includes(severity) ? severity : 'leve';
}

function normalizeSource(value) {
  const source = String(value ?? '').toLowerCase();
  return VALID_SOURCES.includes(source) ? source : 'web';
}

function normalizeEvent(value) {
  const eventType = String(value ?? '').trim().slice(0, 64);
  return VALID_EVENTS.has(eventType) ? eventType : eventType.replace(/[^a-z0-9_]/gi, '');
}

function safeMetadata(value) {
  if (!value) return null;
  try {
    return JSON.stringify(value).slice(0, 4000);
  } catch {
    return null;
  }
}

export class SecurityEventModel {
  static record(attemptId, eventType, details, options = {}) {
    const numericId = Number(attemptId);
    if (!Number.isInteger(numericId) || numericId <= 0) return false;
    const attempt = db.prepare('SELECT id, status FROM exam_attempts WHERE id = ?').get(numericId);
    if (!attempt || attempt.status !== 'in_progress') return false;

    const cleanEvent = normalizeEvent(eventType);
    if (!cleanEvent) return false;

    db.prepare(`
      INSERT INTO security_events (attempt_id, event_type, severity, source, details, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      numericId,
      cleanEvent,
      normalizeSeverity(options.severity),
      normalizeSource(options.source),
      String(details ?? '').slice(0, 1000),
      safeMetadata(options.metadata)
    );
    return true;
  }
}

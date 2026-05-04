import { env } from '../config/env.js';

export function notFoundJson(_request, response) {
  response.status(404).json({ error: 'Recurso no encontrado.' });
}

export function errorHandler(error, _request, response, _next) {
  if (env.nodeEnv !== 'production') {
    console.error('[error]', error);
  } else {
    console.error('[error]', error.message);
  }
  if (response.headersSent) return;
  response.status(error.status ?? 500).json({
    error: env.nodeEnv === 'production' ? 'Error interno del sistema.' : error.message
  });
}

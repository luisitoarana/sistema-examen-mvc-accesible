import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';

// El backend SOLO entrega JSON, no HTML. La CSP es minima: bloquea scripts,
// imagenes y conexiones dentro del propio dominio. La proteccion real entre
// frontend y backend pasa por CORS + JWT + rate limiting.
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'none'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'no-referrer' }
});

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (env.corsOrigins.includes(origin)) return true;
  // En desarrollo aceptamos cualquier puerto local (Vite auto-elige 5173, 5174, ...).
  if (env.nodeEnv !== 'production' && localhostPattern.test(origin)) return true;
  return false;
}

// CORS por origen explicito + atajo en desarrollo. La app desktop Flutter
// no envia cabecera Origin desde HttpClient, asi que pasa el chequeo.
export const corsPolicy = cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    const error = new Error(`Origen no autorizado por CORS: ${origin}`);
    error.status = 403;
    callback(error);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

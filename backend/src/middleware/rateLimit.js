import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const loginLimiter = rateLimit({
  windowMs: env.loginRateWindowMs,
  max: env.loginRateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: ['Demasiados intentos. Espera unos minutos antes de volver a intentar.'] }
});

export const apiLimiter = rateLimit({
  windowMs: env.apiRateWindowMs,
  max: env.apiRateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: ['Has hecho demasiadas peticiones. Reduce la frecuencia.'] }
});

export const securityEventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiados eventos de supervision en poco tiempo.' }
});

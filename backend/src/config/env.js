import { randomBytes } from 'node:crypto';

function readSecret(name, fallbackBytes = 64) {
  const value = process.env[name];
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`La variable de entorno ${name} es obligatoria y debe tener al menos 32 caracteres en produccion.`);
  }
  return randomBytes(fallbackBytes).toString('hex');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: readSecret('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  bodyLimit: process.env.BODY_LIMIT ?? '256kb',
  demoTeacherEmail: process.env.DEMO_TEACHER_EMAIL ?? 'demo@institucion.edu',
  demoTeacherPassword: process.env.DEMO_TEACHER_PASSWORD ?? 'demo1234',
  enableSeed: process.env.DISABLE_SEED !== '1',
  loginRateMax: Number(process.env.LOGIN_RATE_MAX ?? 8),
  loginRateWindowMs: Number(process.env.LOGIN_RATE_WINDOW_MS ?? 5 * 60 * 1000),
  apiRateMax: Number(process.env.API_RATE_MAX ?? 240),
  apiRateWindowMs: Number(process.env.API_RATE_WINDOW_MS ?? 60 * 1000)
});

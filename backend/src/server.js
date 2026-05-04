import express from 'express';
import { env } from './config/env.js';
import { initializeDatabase } from './config/database.js';
import { ensureSeedExam } from './services/ExamSeedService.js';
import { securityHeaders, corsPolicy } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundJson } from './middleware/errorHandler.js';
import { buildApiRouter } from './routes/index.js';

initializeDatabase();
ensureSeedExam();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(corsPolicy);
app.use(express.json({ limit: env.bodyLimit }));
app.use(express.urlencoded({ extended: false, limit: env.bodyLimit }));

// Identificacion del servicio (solo API, no sirve HTML del frontend).
app.get('/', (_request, response) => {
  response.json({
    service: 'sistema-examen-mvc-accesible',
    role: 'api',
    description: 'API REST. La interfaz web vive en frontend/ (Vite, puerto 5173). La app desktop consume estos endpoints.',
    docs: '/api/health',
    endpoints: [
      'GET  /api/health',
      'POST /api/teachers/register',
      'POST /api/teachers/login',
      'GET  /api/teachers/:teacherId/exams',
      'POST /api/exams',
      'GET  /api/exams/:accessCode',
      'GET  /api/exams/:accessCode/attempts',
      'POST /api/attempts',
      'GET  /api/attempts/:attemptId',
      'POST /api/attempts/:attemptId/submit',
      'GET  /api/attempts/:attemptId/result',
      'POST /api/security-event'
    ]
  });
});

app.use('/api', apiLimiter, buildApiRouter());

// Cualquier otra ruta no es de la API: respondemos 404 JSON, no HTML.
app.use(notFoundJson);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API del sistema de examen disponible en http://localhost:${env.port}`);
  console.log(`Frontend web: corre 'npm run dev' en frontend/ (puerto 5173).`);
  console.log(`Entorno: ${env.nodeEnv}`);
});

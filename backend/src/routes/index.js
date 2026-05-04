import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';
import { TeacherController } from '../controllers/TeacherController.js';
import { ExamController } from '../controllers/ExamController.js';
import { AttemptController } from '../controllers/AttemptController.js';
import { SecurityController } from '../controllers/SecurityController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { loginLimiter, securityEventLimiter } from '../middleware/rateLimit.js';

export function buildApiRouter() {
  const router = Router();

  router.get('/health', HealthController.health);

  router.post('/teachers/register', loginLimiter, TeacherController.register);
  router.post('/teachers/login', loginLimiter, TeacherController.login);
  router.get('/teachers/:teacherId/exams', requireAuth('teacher'), TeacherController.exams);

  router.post('/exams', requireAuth('teacher'), ExamController.create);
  router.get('/exams/:accessCode', ExamController.find);
  router.get('/exams/:accessCode/attempts', requireAuth('teacher'), ExamController.attempts);

  router.post('/attempts', AttemptController.start);
  router.get('/attempts/:attemptId', requireAuth('student'), AttemptController.get);
  router.post('/attempts/:attemptId/submit', requireAuth('student'), AttemptController.submit);
  router.get('/attempts/:attemptId/result', optionalAuth, AttemptController.result);

  router.post('/security-event', securityEventLimiter, optionalAuth, SecurityController.event);

  return router;
}

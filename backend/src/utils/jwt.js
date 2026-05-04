import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signTeacherToken(teacher) {
  return jwt.sign(
    { sub: teacher.id, email: teacher.email, role: 'teacher' },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn, issuer: 'sistema-examen' }
  );
}

export function signStudentToken(attempt) {
  return jwt.sign(
    { sub: attempt.id, role: 'student', attemptId: attempt.id },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn, issuer: 'sistema-examen' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret, { issuer: 'sistema-examen' });
}

import { AttemptModel } from '../models/AttemptModel.js';
import { ExamModel } from '../models/ExamModel.js';
import { validateStudent } from '../utils/validators.js';
import { signStudentToken } from '../utils/jwt.js';

function ownsAttempt(request, attemptId) {
  if (request.auth?.role !== 'student') return false;
  return Number(request.auth.attemptId ?? request.auth.sub) === Number(attemptId);
}

export class AttemptController {
  static start(request, response) {
    const data = request.body ?? {};
    const errors = validateStudent(data);
    if (errors.length > 0) {
      response.status(422).json({ errors });
      return;
    }

    const attemptId = AttemptModel.create(data);
    if (!attemptId) {
      response.status(404).json({ errors: ['No existe un examen activo con ese codigo.'] });
      return;
    }
    const attempt = AttemptModel.findById(attemptId);
    response.status(201).json({
      attemptId,
      attempt,
      durationSeconds: attempt.durationSeconds,
      questions: ExamModel.getQuestionsForAttempt(attemptId),
      token: signStudentToken({ id: attemptId })
    });
  }

  static get(request, response) {
    const attemptId = Number(request.params.attemptId);
    if (!ownsAttempt(request, attemptId)) {
      response.status(403).json({ error: 'No tienes acceso a este intento.' });
      return;
    }
    const attempt = AttemptModel.findById(attemptId);
    if (!attempt) {
      response.status(404).json({ error: 'Intento no encontrado.' });
      return;
    }
    response.json({
      attempt,
      durationSeconds: attempt.durationSeconds,
      questions: ExamModel.getQuestionsForAttempt(attemptId)
    });
  }

  static submit(request, response) {
    const attemptId = Number(request.params.attemptId);
    if (!ownsAttempt(request, attemptId)) {
      response.status(403).json({ error: 'No tienes acceso a este intento.' });
      return;
    }
    const answers = request.body?.answers ?? {};

    const result = AttemptModel.grade(attemptId, answers);
    if (!result) {
      response.status(404).json({ error: 'No se encontro el examen de este intento.' });
      return;
    }
    const saved = AttemptModel.saveAnswers(attemptId, result.graded, result.score);
    if (!saved) {
      response.status(409).json({ error: 'El intento ya fue enviado o no esta en curso.' });
      return;
    }
    response.json(AttemptModel.getResult(attemptId));
  }

  static result(request, response) {
    const attemptId = Number(request.params.attemptId);
    const result = AttemptModel.getResult(attemptId);
    if (!result) {
      response.status(404).json({ error: 'No existe un resultado para el intento solicitado.' });
      return;
    }
    response.json(result);
  }
}

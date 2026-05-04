import { ExamModel } from '../models/ExamModel.js';
import { AttemptModel } from '../models/AttemptModel.js';
import { validateExam } from '../utils/validators.js';

function ensureOwnsExam(request, exam) {
  if (!exam) return false;
  if (request.auth?.role !== 'teacher') return false;
  return Number(request.auth.sub) === Number(exam.teacherId);
}

export class ExamController {
  static create(request, response) {
    const data = request.body ?? {};
    if (request.auth?.role === 'teacher') {
      data.teacherId = Number(request.auth.sub);
    }
    const errors = validateExam(data);
    if (errors.length > 0) {
      response.status(422).json({ errors });
      return;
    }

    try {
      const exam = ExamModel.create({
        ...data,
        createdBy: data.createdBy ?? `Docente #${data.teacherId}`,
        durationSeconds: Number(data.durationMinutes) * 60
      });
      response.status(201).json(exam);
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) {
        response.status(409).json({ errors: ['Ese codigo de examen ya existe. Usa otro codigo.'] });
        return;
      }
      throw error;
    }
  }

  static find(request, response) {
    const exam = ExamModel.getByCode(request.params.accessCode);
    if (!exam) {
      response.status(404).json({ error: 'No existe un examen activo con ese codigo.' });
      return;
    }
    const { teacherId: _teacherId, ...publicExam } = exam;
    publicExam.questions = publicExam.questions.map(({ correctOption: _co, correctAnswer: _ca, ...rest }) => rest);
    response.json(publicExam);
  }

  static attempts(request, response) {
    const exam = ExamModel.getByCode(request.params.accessCode);
    if (!exam) {
      response.status(404).json({ error: 'No existe un examen con ese codigo.' });
      return;
    }
    if (!ensureOwnsExam(request, exam)) {
      response.status(403).json({ errors: ['Solo el docente propietario puede ver los intentos.'] });
      return;
    }
    response.json(AttemptModel.getExamSummary(request.params.accessCode));
  }
}

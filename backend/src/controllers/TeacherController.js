import { TeacherModel } from '../models/TeacherModel.js';
import { ExamModel } from '../models/ExamModel.js';
import { signTeacherToken } from '../utils/jwt.js';
import { validateTeacher } from '../utils/validators.js';

export class TeacherController {
  static register(request, response) {
    const data = request.body ?? {};
    const errors = validateTeacher(data, 'register');
    if (errors.length > 0) {
      response.status(422).json({ errors });
      return;
    }
    try {
      const teacher = TeacherModel.create(data);
      const token = signTeacherToken(teacher);
      response.status(201).json({ teacher, token });
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) {
        response.status(409).json({ errors: ['Ese correo docente ya esta registrado.'] });
        return;
      }
      throw error;
    }
  }

  static login(request, response) {
    const data = request.body ?? {};
    const errors = validateTeacher(data, 'login');
    if (errors.length > 0) {
      response.status(422).json({ errors });
      return;
    }
    const teacher = TeacherModel.authenticate(data);
    if (!teacher) {
      response.status(401).json({ errors: ['Correo o contrasena docente incorrectos.'] });
      return;
    }
    response.json({ teacher, token: signTeacherToken(teacher) });
  }

  static exams(request, response) {
    const teacherId = Number(request.params.teacherId);
    if (request.auth?.role !== 'teacher' || Number(request.auth.sub) !== teacherId) {
      response.status(403).json({ errors: ['Solo puedes ver tus propios examenes.'] });
      return;
    }
    response.json({ exams: ExamModel.getByTeacher(teacherId) });
  }
}

import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { TeacherModel } from '../models/TeacherModel.js';
import { ExamModel } from '../models/ExamModel.js';

const seedExam = {
  title: 'Examen HCI y Accesibilidad',
  course: 'Interaccion Ser Humano-Computadora',
  accessCode: 'HCI2026',
  durationSeconds: 12 * 60,
  createdBy: 'Docente Demo',
  questions: [
    {
      questionType: 'multiple_choice',
      prompt: 'Que principio ayuda a reducir la carga mental durante un examen en linea?',
      options: [
        'Usar terminos claros y acciones consistentes',
        'Mostrar todas las funciones en una sola pantalla',
        'Depender solo de colores para indicar errores',
        'Cambiar la ubicacion de botones en cada pregunta'
      ],
      correctOption: 'a'
    },
    {
      questionType: 'multiple_choice',
      prompt: 'Cual opcion cumple mejor con accesibilidad universal?',
      options: [
        'Un boton rojo sin texto para indicar peligro',
        'Un mensaje con icono, texto descriptivo y lectura por lector de pantalla',
        'Una imagen sin descripcion alternativa',
        'Un formulario que solo funciona con mouse'
      ],
      correctOption: 'b'
    },
    {
      questionType: 'multiple_choice',
      prompt: 'En el patron MVC, que responsabilidad tiene el controlador?',
      options: [
        'Guardar estilos visuales',
        'Recibir la solicitud, aplicar reglas y elegir la respuesta',
        'Representar solamente tablas de la base de datos',
        'Sustituir las vistas HTML'
      ],
      correctOption: 'b'
    },
    {
      questionType: 'multiple_choice',
      prompt: 'Segun la orientacion de ISO 9241, la usabilidad se relaciona con:',
      options: [
        'Eficacia, eficiencia y satisfaccion en un contexto de uso',
        'Cantidad maxima de animaciones disponibles',
        'Uso exclusivo de colores institucionales',
        'Bloqueo total del teclado para evitar errores'
      ],
      correctOption: 'a'
    },
    {
      questionType: 'multiple_choice',
      prompt: 'Que evento es relevante para la integridad de un examen supervisado en navegador?',
      options: [
        'Cambio de pestana o perdida de foco de la ventana',
        'Movimiento normal del cursor dentro del examen',
        'Aumento del volumen del sistema',
        'Cambio de idioma del teclado antes de iniciar'
      ],
      correctOption: 'a'
    }
  ]
};

export function ensureSeedExam() {
  if (!env.enableSeed) return;

  let teacher = TeacherModel.findByEmail(env.demoTeacherEmail);
  if (!teacher) {
    teacher = TeacherModel.create({
      fullName: 'Docente Demo',
      email: env.demoTeacherEmail,
      password: env.demoTeacherPassword
    });
  }
  const exists = db.prepare('SELECT id FROM exams WHERE access_code = ?').get(seedExam.accessCode);
  if (!exists) ExamModel.create({ ...seedExam, teacherId: teacher.id });
}

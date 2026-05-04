const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ACCESS_CODE_REGEX = /^[A-Za-z0-9_-]{4,32}$/;

export function isEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

export function isAccessCode(value) {
  return typeof value === 'string' && ACCESS_CODE_REGEX.test(value.trim());
}

export function trimString(value, max = 240) {
  return String(value ?? '').trim().slice(0, max);
}

export function validateTeacher(data, mode) {
  const errors = [];
  if (mode === 'register' && trimString(data.fullName).length < 3) {
    errors.push('Escribe el nombre del docente.');
  }
  if (!isEmail(data.email)) errors.push('Escribe un correo valido.');
  const password = String(data.password ?? '');
  if (password.length < 8) errors.push('La contrasena debe tener al menos 8 caracteres.');
  if (mode === 'register' && password.length > 128) errors.push('La contrasena es demasiado larga.');
  return errors;
}

export function validateStudent(data) {
  const errors = [];
  if (trimString(data.fullName).length < 3) errors.push('Escribe tu nombre completo.');
  if (!isEmail(data.email)) errors.push('Escribe un correo institucional valido.');
  if (!isAccessCode(data.accessCode)) errors.push('Escribe un codigo de examen valido (4-32 letras o numeros).');
  return errors;
}

export function validateExam(data) {
  const errors = [];
  const questions = Array.isArray(data.questions) ? data.questions : [];
  if (!data.teacherId) errors.push('Inicia sesion como docente para crear examenes.');
  if (trimString(data.title).length < 4) errors.push('Escribe el titulo del examen.');
  if (trimString(data.course).length < 3) errors.push('Escribe la materia o curso.');
  if (Number(data.durationMinutes) < 5) errors.push('La duracion minima es 5 minutos.');
  if (Number(data.durationMinutes) > 360) errors.push('La duracion maxima es 360 minutos.');
  if (questions.length < 1) errors.push('Agrega al menos una pregunta.');
  if (questions.length > 100) errors.push('El examen no puede tener mas de 100 preguntas.');
  if (data.accessCode && !isAccessCode(data.accessCode)) {
    errors.push('El codigo de acceso solo admite letras, numeros, guiones y barras bajas (4-32).');
  }
  questions.forEach((question, index) => {
    const questionType = question.questionType ?? 'multiple_choice';
    if (trimString(question.prompt, 600).length < 8) {
      errors.push(`La pregunta ${index + 1} necesita un enunciado mas claro.`);
    }
    if (questionType === 'multiple_choice') {
      const cleanOptions = (question.options ?? []).filter((option) => trimString(option).length > 0);
      if (cleanOptions.length < 2) errors.push(`La pregunta ${index + 1} necesita al menos dos opciones.`);
      if (!['a', 'b', 'c', 'd'].includes(String(question.correctOption).toLowerCase())) {
        errors.push(`Selecciona la respuesta correcta de la pregunta ${index + 1}.`);
      }
    }
    if (questionType === 'true_false' && !['true', 'false'].includes(String(question.correctAnswer))) {
      errors.push(`Selecciona verdadero o falso en la pregunta ${index + 1}.`);
    }
    if (questionType === 'short_answer' && trimString(question.correctAnswer, 200).length < 2) {
      errors.push(`Escribe la respuesta esperada de la pregunta ${index + 1}.`);
    }
  });
  return errors;
}

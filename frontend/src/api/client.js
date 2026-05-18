// Cliente API con soporte de tokens Bearer.
// Los tokens se guardan en sessionStorage (se borran al cerrar la pestana).

const TEACHER_TOKEN_KEY = 'sistema-examen.teacherToken';
const TEACHER_SESSION_KEY = 'sistema-examen.teacher';
const STUDENT_TOKEN_KEY = 'sistema-examen.studentToken';
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function readSessionStorage(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key, value) {
  try {
    if (value == null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const session = {
  getTeacherToken: () => readSessionStorage(TEACHER_TOKEN_KEY),
  getStudentToken: () => readSessionStorage(STUDENT_TOKEN_KEY),
  getTeacher: () => {
    const raw = readSessionStorage(TEACHER_SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setTeacher: (teacher, token) => {
    if (teacher) writeSessionStorage(TEACHER_SESSION_KEY, JSON.stringify(teacher));
    else writeSessionStorage(TEACHER_SESSION_KEY, null);
    writeSessionStorage(TEACHER_TOKEN_KEY, token ?? null);
  },
  setStudentToken: (token) => writeSessionStorage(STUDENT_TOKEN_KEY, token ?? null),
  clearTeacher: () => {
    writeSessionStorage(TEACHER_SESSION_KEY, null);
    writeSessionStorage(TEACHER_TOKEN_KEY, null);
  },
  clearStudent: () => writeSessionStorage(STUDENT_TOKEN_KEY, null)
};

export async function api(path, { method = 'GET', body, auth } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = auth === 'teacher'
    ? session.getTeacherToken()
    : auth === 'student'
      ? session.getStudentToken()
      : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(apiUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error ?? data.errors?.[0] ?? 'No se pudo completar la solicitud.');
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data;
}

export const auth = {
  async loginTeacher(credentials) {
    const data = await api('/api/teachers/login', { method: 'POST', body: credentials });
    session.setTeacher(data.teacher, data.token);
    return data.teacher;
  },
  async registerTeacher(payload) {
    const data = await api('/api/teachers/register', { method: 'POST', body: payload });
    session.setTeacher(data.teacher, data.token);
    return data.teacher;
  }
};

export const examsApi = {
  list: (teacherId) => api(`/api/teachers/${teacherId}/exams`, { auth: 'teacher' }),
  create: (payload) => api('/api/exams', { method: 'POST', body: payload, auth: 'teacher' }),
  get: (accessCode) => api(`/api/exams/${encodeURIComponent(accessCode)}`),
  attempts: (accessCode) => api(`/api/exams/${encodeURIComponent(accessCode)}/attempts`, { auth: 'teacher' })
};

export const attemptsApi = {
  async start(payload) {
    const data = await api('/api/attempts', { method: 'POST', body: payload });
    if (data.token) session.setStudentToken(data.token);
    return data;
  },
  submit: (attemptId, answers) =>
    api(`/api/attempts/${attemptId}/submit`, { method: 'POST', body: { answers }, auth: 'student' })
};

export function reportSecurityEvent(event) {
  return api('/api/security-event', { method: 'POST', body: event, auth: 'student' });
}

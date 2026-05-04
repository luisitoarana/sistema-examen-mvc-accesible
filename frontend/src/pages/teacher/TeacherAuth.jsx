import React, { useState } from 'react';
import { GraduationCap, KeyRound } from 'lucide-react';
import { TextField } from '../../components/TextField.jsx';
import { ErrorList } from '../../components/ErrorList.jsx';
import { auth } from '../../api/client.js';

export function TeacherAuth({ onTeacher }) {
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ fullName: '', email: 'demo@institucion.edu', password: '' });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      const teacher = mode === 'login'
        ? await auth.loginTeacher(values)
        : await auth.registerTeacher(values);
      onTeacher(teacher);
    } catch (error) {
      setErrors(error.data?.errors ?? [error.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="teacher-auth" onSubmit={handleSubmit} noValidate>
      <div className="panel-heading">
        <GraduationCap aria-hidden="true" />
        <div>
          <h2>Cuenta docente</h2>
          <p>Cada docente gestiona solamente sus examenes y revisiones.</p>
        </div>
      </div>
      <div className="segmented-control compact" role="tablist" aria-label="Acceso docente">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >Ingresar</button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >Crear cuenta</button>
      </div>
      <ErrorList errors={errors} />
      {mode === 'register' && (
        <TextField
          id="teacherName"
          label="Nombre del docente"
          value={values.fullName}
          onChange={(value) => setValues({ ...values, fullName: value })}
        />
      )}
      <TextField
        id="teacherEmail"
        label="Correo docente"
        type="email"
        value={values.email}
        onChange={(value) => setValues({ ...values, email: value })}
      />
      <TextField
        id="teacherPassword"
        label="Contrasena docente (minimo 8 caracteres)"
        type="password"
        value={values.password}
        onChange={(value) => setValues({ ...values, password: value })}
      />
      <button className="primary-action" type="submit" disabled={busy}>
        <KeyRound aria-hidden="true" />
        {busy ? 'Verificando' : mode === 'login' ? 'Entrar al panel' : 'Crear cuenta docente'}
      </button>
    </form>
  );
}

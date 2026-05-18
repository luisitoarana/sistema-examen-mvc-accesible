import React, { useState } from 'react';
import { KeyRound, LockKeyhole } from 'lucide-react';
import { TextField } from '../components/TextField.jsx';
import { ErrorList } from '../components/ErrorList.jsx';
import { attemptsApi } from '../api/client.js';

export function StudentLogin({ errors, onStarted }) {
  const [values, setValues] = useState({ fullName: '', email: '', accessCode: '' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await attemptsApi.start(values);
      onStarted({
        attemptId: payload.attemptId,
        attempt: payload.attempt,
        durationSeconds: payload.durationSeconds,
        questions: payload.questions
      });
    } catch (error) {
      onStarted(null, error.data?.errors ?? [error.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby="student-help" noValidate>
      <div className="panel-heading">
        <LockKeyhole aria-hidden="true" />
        <div>
          <h2>Ingreso del estudiante</h2>
          <p id="student-help">El codigo del docente abre el examen asignado.</p>
        </div>
      </div>
      <ErrorList errors={errors} />
      <TextField
        id="fullName"
        label="Nombre completo"
        value={values.fullName}
        onChange={(value) => setValues({ ...values, fullName: value })}
        autoComplete="name"
      />
      <TextField
        id="email"
        label="Correo institucional"
        type="email"
        value={values.email}
        onChange={(value) => setValues({ ...values, email: value })}
        autoComplete="email"
      />
      <TextField
        id="accessCode"
        label="Codigo del examen"
        value={values.accessCode}
        onChange={(value) => setValues({ ...values, accessCode: value.toUpperCase() })}
        autoComplete="off"
        helpText="Tal como te lo paso el docente. Solo letras, numeros y guiones."
      />
      <button
        className="primary-action"
        type="submit"
        disabled={busy}
        aria-label="Ingresar al examen con codigo institucional"
      >
        <KeyRound aria-hidden="true" />
        {busy ? 'Verificando' : 'Continuar como estudiante'}
      </button>
    </form>
  );
}

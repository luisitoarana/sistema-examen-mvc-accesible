import React from 'react';
import { AlertTriangle, CheckCircle2, UserRound } from 'lucide-react';

export function ResultView({ result, onReset }) {
  const hasIncidents = result.incidentCount > 0;
  return (
    <section className="result-panel" aria-labelledby="result-title">
      <p className="eyebrow">Intento finalizado</p>
      <h1 id="result-title">Resultado</h1>
      <div className="score-band" role="status" aria-live="polite">
        <span>{result.examTitle}</span>
        <strong>{result.score} / {result.totalQuestions}</strong>
      </div>
      <dl className="result-details">
        <div><dt>Estudiante</dt><dd>{result.fullName}</dd></div>
        <div><dt>Correo</dt><dd>{result.email}</dd></div>
        <div><dt>Curso</dt><dd>{result.course}</dd></div>
        <div><dt>Penalizaciones</dt><dd>{result.incidentCount}</dd></div>
      </dl>
      <div
        className={`alert ${hasIncidents ? 'alert-warning' : 'alert-success'}`}
        role={hasIncidents ? 'alert' : 'status'}
      >
        {hasIncidents
          ? <AlertTriangle aria-hidden="true" />
          : <CheckCircle2 aria-hidden="true" />}
        <span>
          {hasIncidents
            ? 'Revision docente requerida por eventos anti-copia.'
            : 'Intento sin eventos anti-copia.'}
        </span>
      </div>
      <button
        className="primary-action fit-action"
        type="button"
        onClick={onReset}
        aria-label="Registrar otro estudiante"
      >
        <UserRound aria-hidden="true" />Nuevo ingreso
      </button>
    </section>
  );
}

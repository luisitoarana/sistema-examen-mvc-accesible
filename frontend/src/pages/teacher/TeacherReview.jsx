import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  ListChecks,
  Search,
  ShieldAlert,
  UserRound
} from 'lucide-react';
import { TextField } from '../../components/TextField.jsx';
import { StatusTile } from '../../components/StatusTile.jsx';
import { examsApi } from '../../api/client.js';
import { labelEvent, labelSeverity, labelSource } from '../../utils/labels.js';

export function TeacherReview({ accessCodeSeed = 'HCI2026' }) {
  const [accessCode, setAccessCode] = useState(accessCodeSeed);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadSummary(event) {
    event?.preventDefault();
    setBusy(true);
    setError('');
    try {
      setSummary(await examsApi.attempts(accessCode));
    } catch (requestError) {
      setSummary(null);
      setError(requestError.data?.error ?? requestError.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setAccessCode(accessCodeSeed);
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessCodeSeed]);

  return (
    <section className="teacher-review" aria-labelledby="review-title">
      <div className="panel-heading">
        <ListChecks aria-hidden="true" />
        <div>
          <h2 id="review-title">Revision docente</h2>
          <p>Consulta estudiantes, notas e incidentes por codigo de examen.</p>
        </div>
      </div>
      <form className="review-search" onSubmit={loadSummary}>
        <TextField
          id="reviewCode"
          label="Codigo del examen"
          value={accessCode}
          onChange={(value) => setAccessCode(value.toUpperCase())}
        />
        <button className="primary-action" type="submit" disabled={busy}>
          <Search aria-hidden="true" />
          Buscar
        </button>
      </form>
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle aria-hidden="true" /><span>{error}</span>
        </div>
      )}
      {summary && (
        <>
          <div className="stats-grid" aria-label="Resumen del examen">
            <StatusTile icon={<UserRound />} title={String(summary.stats.totalAttempts)} text="Estudiantes registrados" />
            <StatusTile icon={<FileCheck2 />} title={String(summary.stats.finishedAttempts)} text="Intentos finalizados" />
            <StatusTile icon={<ShieldAlert />} title={String(summary.stats.penalizedAttempts)} text="Con penalizacion" />
          </div>
          <div className="review-table-wrap">
            <table className="review-table">
              <caption>{summary.exam.title}</caption>
              <thead>
                <tr>
                  <th scope="col">Estudiante</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Respondio</th>
                  <th scope="col">Aciertos</th>
                  <th scope="col">Nota</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Penalizaciones</th>
                </tr>
              </thead>
              <tbody>
                {summary.attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.fullName}</td>
                    <td>{attempt.email}</td>
                    <td>{attempt.answeredCount} / {attempt.totalQuestions}</td>
                    <td>{attempt.correctCount}</td>
                    <td>{attempt.score} / {attempt.totalQuestions}</td>
                    <td>{attempt.status === 'finished' ? 'Finalizado' : 'En progreso'}</td>
                    <td>{attempt.incidentCount}</td>
                  </tr>
                ))}
                {summary.attempts.length === 0 && (
                  <tr><td colSpan="7">Todavia no hay estudiantes registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="event-feed" aria-label="Eventos anti-copia por estudiante">
            <h3>Detalle anti-copia por estudiante</h3>
            {summary.attempts.map((attempt) => (
              <article className="event-item" key={`detail-${attempt.id}`}>
                <strong>{attempt.fullName}</strong>
                <span>{attempt.email} - {attempt.incidentCount} penalizaciones</span>
                {attempt.events.length > 0 ? attempt.events.map((event) => (
                  <p className="event-line" key={`${event.createdAt}-${event.eventType}`}>
                    <span className={`severity-badge ${event.severity}`}>
                      {labelSeverity(event.severity)}
                    </span>
                    <strong>{labelSource(event.source)}</strong>
                    <span>{labelEvent(event.eventType)}: {event.details}</span>
                  </p>
                )) : <p>Sin incidentes registrados.</p>}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

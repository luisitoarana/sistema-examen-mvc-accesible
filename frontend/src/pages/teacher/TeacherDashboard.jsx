import React, { useEffect, useState } from 'react';
import { ListChecks } from 'lucide-react';
import { examsApi } from '../../api/client.js';

export function TeacherDashboard({ teacher, onSelect }) {
  const [exams, setExams] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setBusy(true);
    examsApi.list(teacher.id)
      .then((payload) => { if (alive) setExams(payload.exams); })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, [teacher.id]);

  return (
    <section className="teacher-review" aria-labelledby="my-exams-title">
      <div className="panel-heading">
        <ListChecks aria-hidden="true" />
        <div>
          <h2 id="my-exams-title">Mis examenes</h2>
          <p>Selecciona un examen para revisar estudiantes, notas y penalizaciones.</p>
        </div>
      </div>
      {busy && <p className="progress-label">Cargando examenes...</p>}
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <div className="exam-list">
        {exams.map((exam) => (
          <article className="exam-list-item" key={exam.id}>
            <div>
              <strong>{exam.title}</strong>
              <span>{exam.course} - Codigo {exam.accessCode}</span>
            </div>
            <div className="exam-metrics">
              <span>{exam.questionCount} preguntas</span>
              <span>{exam.finishedCount}/{exam.attemptCount} finalizados</span>
            </div>
            <button className="secondary-action" type="button" onClick={() => onSelect(exam.accessCode)}>Revisar</button>
          </article>
        ))}
        {!busy && exams.length === 0 && <p className="progress-label">Todavia no has creado examenes.</p>}
      </div>
    </section>
  );
}

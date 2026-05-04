import React, { useEffect, useRef, useState } from 'react';
import {
  Clock3,
  FileCheck2,
  MonitorUp,
  ShieldAlert,
  Wifi
} from 'lucide-react';
import { attemptsApi } from '../../api/client.js';
import { formatTime, speak } from '../../utils/format.js';
import { useExamProctor } from '../../hooks/useExamProctor.js';
import { QuestionCard } from './QuestionCard.jsx';

export function ExamView({ attemptId, attempt, questions, durationSeconds, onResult }) {
  const [answers, setAnswers] = useState({});
  const [remaining, setRemaining] = useState(durationSeconds);
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  const { incidents, message, setMessage, extensionStatus, finishProctor } =
    useExamProctor({ attemptId, attempt });

  const answeredCount = Object.values(answers).filter((value) => String(value).trim()).length;
  const allAnswered = answeredCount === questions.length;
  const completionLabel = `${answeredCount} de ${questions.length} preguntas respondidas`;

  async function submitExam() {
    if (submitting || submitted.current) return;
    submitted.current = true;
    finishProctor();
    setSubmitting(true);
    try {
      const result = await attemptsApi.submit(attemptId, answers);
      onResult(result);
    } catch (error) {
      setMessage(`No se pudo enviar el examen: ${error.message}`);
      setSubmitting(false);
      submitted.current = false;
    }
  }

  // Temporizador
  useEffect(() => {
    const countdown = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(countdown);
          setMessage('Tiempo terminado. El examen se envio automaticamente.');
          submitExam();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
      setMessage('Pantalla completa activa.');
    } catch {
      setMessage('El navegador no permitio activar pantalla completa.');
    }
  }

  return (
    <section className="exam-screen" aria-labelledby="exam-title">
      <aside className="exam-status" aria-label="Estado del examen">
        <p className="eyebrow">Codigo {attempt?.accessCode}</p>
        <h1 id="exam-title">{attempt?.examTitle}</h1>
        <p className="progress-label">{attempt?.course}</p>
        <div className="status-stack">
          <div className="status-item">
            <Clock3 aria-hidden="true" />
            <span>Tiempo</span>
            <strong className={remaining <= 60 ? 'urgent' : ''} aria-live="polite">
              {formatTime(remaining)}
            </strong>
          </div>
          <div className="status-item">
            <ShieldAlert aria-hidden="true" />
            <span>Incidentes</span>
            <strong aria-live="polite">{incidents}</strong>
          </div>
        </div>
        <div className="alert alert-info" role="status">
          <MonitorUp aria-hidden="true" /><span>{message}</span>
        </div>
        <div
          className={`alert ${extensionStatus === 'active' ? 'alert-success' : 'alert-warning'}`}
          role="status"
        >
          <Wifi aria-hidden="true" />
          <span>
            {extensionStatus === 'active'
              ? 'Extension anti-copia conectada.'
              : extensionStatus === 'checking'
                ? 'Verificando extension anti-copia.'
                : 'Extension anti-copia no detectada.'}
          </span>
        </div>
        <button
          className="secondary-action"
          type="button"
          onClick={() => speak(
            `${attempt?.examTitle}. Tiempo restante ${formatTime(remaining)}. ${completionLabel}. Incidentes ${incidents}.`
          )}
          aria-label="Leer estado del examen en voz alta"
        >
          <MonitorUp aria-hidden="true" />
          Leer estado
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={requestFullscreen}
          aria-label="Activar pantalla completa"
        >
          <MonitorUp aria-hidden="true" />Pantalla completa
        </button>
        <p className="progress-label">{completionLabel}</p>
        <progress max={questions.length} value={answeredCount} aria-label={completionLabel}></progress>
      </aside>

      <form
        className="exam-form"
        onSubmit={(event) => { event.preventDefault(); submitExam(); }}
      >
        <div className="sr-live" aria-live="assertive">{message}</div>
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            answers={answers}
            setAnswers={setAnswers}
          />
        ))}
        <div className="submit-bar">
          <p>{allAnswered ? 'Todo listo para enviar.' : completionLabel}</p>
          <button
            className="primary-action"
            type="submit"
            disabled={!allAnswered || submitting}
            aria-label="Enviar examen y ver resultado"
          >
            <FileCheck2 aria-hidden="true" />
            {submitting ? 'Enviando' : 'Enviar examen'}
          </button>
        </div>
      </form>
    </section>
  );
}

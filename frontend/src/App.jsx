import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { EntryView } from './pages/EntryView.jsx';
import { ExamView } from './pages/exam/ExamView.jsx';
import { ResultView } from './pages/exam/ResultView.jsx';
import { session } from './api/client.js';

const initialState = {
  step: 'entry',
  attemptId: null,
  attempt: null,
  durationSeconds: 0,
  questions: [],
  result: null,
  errors: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'STARTED':
      return { ...state, step: 'exam', ...action.payload, errors: [] };
    case 'RESULT':
      return { ...state, step: 'result', result: action.payload, errors: [] };
    case 'ERRORS':
      return { ...state, errors: action.payload };
    case 'RESET':
      session.clearStudent();
      return initialState;
    default:
      return state;
  }
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mainRef = useRef(null);

  useEffect(() => { mainRef.current?.focus(); }, [state.step]);

  const content = useMemo(() => {
    if (state.step === 'exam') {
      return (
        <ExamView
          attemptId={state.attemptId}
          attempt={state.attempt}
          questions={state.questions}
          durationSeconds={state.durationSeconds}
          onResult={(result) => dispatch({ type: 'RESULT', payload: result })}
        />
      );
    }
    if (state.step === 'result') {
      return (
        <ResultView
          result={state.result}
          onReset={() => dispatch({ type: 'RESET' })}
        />
      );
    }
    return (
      <EntryView
        errors={state.errors}
        onStarted={(payload, errors) =>
          errors
            ? dispatch({ type: 'ERRORS', payload: errors })
            : dispatch({ type: 'STARTED', payload })
        }
      />
    );
  }, [state]);

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido principal</a>
      <header className="site-header" aria-label="Encabezado del sistema">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">MVC</span>
          <div>
            <strong>Sistema de Examen</strong>
            <span>Docente + Estudiante + Supervision</span>
          </div>
        </div>
      </header>
      <main id="contenido" className="page-shell" tabIndex="-1" ref={mainRef}>
        {content}
      </main>
      <footer className="site-footer">
        Practica de usabilidad, accesibilidad universal e Interaccion Ser Humano-Computadora.
      </footer>
    </>
  );
}

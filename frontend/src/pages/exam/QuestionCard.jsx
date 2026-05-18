import React from 'react';
import { Volume2 } from 'lucide-react';
import { speak } from '../../utils/format.js';
import { questionTypes } from '../../utils/labels.js';

export function QuestionCard({ question, index, answers, setAnswers }) {
  function setAnswer(value) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  function optionLabel(optionId) {
    if (optionId === 'true') return 'Verdadero';
    if (optionId === 'false') return 'Falso';
    return optionId.toUpperCase();
  }

  function readQuestionAndAnswers() {
    const selected = answers[question.id];
    const optionsText = question.questionType === 'short_answer'
      ? 'Respuesta corta. Escribe tu respuesta en el campo.'
      : question.options
        .map((option) => `Opcion ${optionLabel(option.id)}: ${option.text}.`)
        .join(' ');
    const selectedText = selected
      ? `Respuesta seleccionada: ${optionLabel(selected)}.`
      : 'Todavia no hay respuesta seleccionada.';
    speak(`Pregunta ${index + 1}. ${question.prompt}. ${optionsText} ${selectedText}`);
  }

  return (
    <fieldset className="question-card">
      <legend>
        <span>Pregunta {index + 1} - {questionTypes[question.questionType]}</span>
        {question.prompt}
      </legend>
      <div className="question-toolbar">
        <button
          className="voice-action"
          type="button"
          onClick={readQuestionAndAnswers}
          aria-label={`Leer pregunta ${index + 1} y sus respuestas en voz alta`}
        >
          <Volume2 aria-hidden="true" />
          Leer pregunta y respuestas
        </button>
      </div>
      {question.questionType === 'short_answer' ? (
        <div className="short-answer">
          <label htmlFor={`answer-${question.id}`}>Respuesta</label>
          <input
            id={`answer-${question.id}`}
            type="text"
            value={answers[question.id] ?? ''}
            onChange={(event) => setAnswer(event.target.value)}
            required
          />
        </div>
      ) : (
        <div className="options-list">
          {question.options.map((option) => (
            <label className="option-row" key={option.id}>
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={answers[question.id] === option.id}
                onChange={() => setAnswer(option.id)}
                required
              />
              <span className="option-letter" aria-hidden="true">
                {option.id === 'true' ? 'V' : option.id === 'false' ? 'F' : option.id.toUpperCase()}
              </span>
              <span>{option.text}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

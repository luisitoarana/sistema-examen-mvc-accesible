import React from 'react';
import { speak } from '../../utils/format.js';
import { questionTypes } from '../../utils/labels.js';

export function QuestionCard({ question, index, answers, setAnswers }) {
  function setAnswer(value) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  return (
    <fieldset className="question-card">
      <legend>
        <span>Pregunta {index + 1} - {questionTypes[question.questionType]}</span>
        {question.prompt}
      </legend>
      <button
        className="voice-action"
        type="button"
        onClick={() => speak(`Pregunta ${index + 1}. ${question.prompt}`)}
        aria-label={`Leer pregunta ${index + 1} en voz alta`}
      >
        Leer pregunta
      </button>
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

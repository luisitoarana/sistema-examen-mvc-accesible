import React, { useState } from 'react';
import { CheckCircle2, FileCheck2, GraduationCap, Plus } from 'lucide-react';
import { TextField } from '../../components/TextField.jsx';
import { ErrorList } from '../../components/ErrorList.jsx';
import { examsApi } from '../../api/client.js';
import { questionTypes } from '../../utils/labels.js';

const blankQuestion = () => ({
  questionType: 'multiple_choice',
  prompt: '',
  options: ['', '', '', ''],
  correctOption: 'a',
  correctAnswer: 'true'
});

export function TeacherBuilder({ teacher, onCreated }) {
  const [createdExam, setCreatedExam] = useState(null);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [exam, setExam] = useState({
    teacherId: teacher.id,
    createdBy: teacher.fullName,
    title: '',
    course: '',
    accessCode: '',
    durationMinutes: 12,
    questions: [blankQuestion()]
  });

  function updateQuestion(index, patch) {
    setExam((current) => ({
      ...current,
      questions: current.questions.map((question, qi) =>
        qi === index ? { ...question, ...patch } : question
      )
    }));
  }

  function updateOption(questionIndex, optionIndex, value) {
    setExam((current) => ({
      ...current,
      questions: current.questions.map((question, index) => (
        index === questionIndex
          ? {
            ...question,
            options: question.options.map((option, optionPosition) =>
              optionPosition === optionIndex ? value : option
            )
          }
          : question
      ))
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      const payload = await examsApi.create(exam);
      setCreatedExam(payload);
      onCreated?.(payload);
    } catch (error) {
      setErrors(error.data?.errors ?? [error.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="teacher-builder" onSubmit={handleSubmit} aria-describedby="teacher-help" noValidate>
      <div className="panel-heading">
        <GraduationCap aria-hidden="true" />
        <div>
          <h2>Crear examen</h2>
          <p id="teacher-help">Elige tipos de pregunta y entrega el codigo a tus estudiantes.</p>
        </div>
      </div>
      <ErrorList errors={errors} />
      {createdExam && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 aria-hidden="true" />
          <span>Examen creado. Codigo para estudiantes: <strong>{createdExam.accessCode}</strong></span>
        </div>
      )}
      <div className="builder-section">
        <span className="section-label">Datos del examen</span>
        <div className="form-grid">
          <TextField id="course" label="Materia o curso" value={exam.course} onChange={(value) => setExam({ ...exam, course: value })} />
          <TextField id="title" label="Titulo del examen" value={exam.title} onChange={(value) => setExam({ ...exam, title: value })} />
          <TextField
            id="accessCodeTeacher"
            label="Codigo del examen"
            value={exam.accessCode}
            onChange={(value) => setExam({ ...exam, accessCode: value.toUpperCase() })}
            placeholder="Ej. HCI2026"
          />
          <TextField
            id="durationMinutes"
            label="Duracion en minutos"
            type="number"
            value={exam.durationMinutes}
            onChange={(value) => setExam({ ...exam, durationMinutes: value })}
          />
        </div>
      </div>

      <div className="builder-section">
        <span className="section-label">Banco de preguntas</span>
        <div className="question-builder-list">
          {exam.questions.map((question, qi) => (
            <fieldset className="builder-card" key={qi}>
              <legend>Pregunta {qi + 1}</legend>
              <label htmlFor={`type-${qi}`}>Tipo de pregunta</label>
              <select
                id={`type-${qi}`}
                value={question.questionType}
                onChange={(event) => updateQuestion(qi, { questionType: event.target.value })}
              >
                {Object.entries(questionTypes).map(([value, label]) =>
                  <option key={value} value={value}>{label}</option>
                )}
              </select>
              <TextField
                id={`prompt-${qi}`}
                label="Enunciado"
                value={question.prompt}
                onChange={(value) => updateQuestion(qi, { prompt: value })}
              />
              {question.questionType === 'multiple_choice' && (
                <>
                  <div className="option-builder-grid">
                    {question.options.map((option, oi) => (
                      <TextField
                        key={oi}
                        id={`q-${qi}-o-${oi}`}
                        label={`Opcion ${String.fromCharCode(65 + oi)}`}
                        value={option}
                        onChange={(value) => updateOption(qi, oi, value)}
                      />
                    ))}
                  </div>
                  <label htmlFor={`correct-${qi}`}>Respuesta correcta</label>
                  <select
                    id={`correct-${qi}`}
                    value={question.correctOption}
                    onChange={(event) => updateQuestion(qi, { correctOption: event.target.value })}
                  >
                    <option value="a">Opcion A</option>
                    <option value="b">Opcion B</option>
                    <option value="c">Opcion C</option>
                    <option value="d">Opcion D</option>
                  </select>
                </>
              )}
              {question.questionType === 'true_false' && (
                <>
                  <label htmlFor={`tf-${qi}`}>Respuesta correcta</label>
                  <select
                    id={`tf-${qi}`}
                    value={question.correctAnswer}
                    onChange={(event) => updateQuestion(qi, { correctAnswer: event.target.value })}
                  >
                    <option value="true">Verdadero</option>
                    <option value="false">Falso</option>
                  </select>
                </>
              )}
              {question.questionType === 'short_answer' && (
                <TextField
                  id={`short-${qi}`}
                  label="Respuesta esperada"
                  value={question.correctAnswer === 'true' ? '' : question.correctAnswer}
                  onChange={(value) => updateQuestion(qi, { correctAnswer: value })}
                />
              )}
            </fieldset>
          ))}
        </div>
      </div>

      <div className="builder-actions">
        <button
          className="secondary-action"
          type="button"
          onClick={() => setExam((current) => ({
            ...current,
            questions: [...current.questions, blankQuestion()]
          }))}
        >
          <Plus aria-hidden="true" />
          Agregar pregunta
        </button>
        <button
          className="primary-action"
          type="submit"
          disabled={busy}
          aria-label="Crear examen y generar codigo"
        >
          <FileCheck2 aria-hidden="true" />
          {busy ? 'Creando examen' : 'Crear examen'}
        </button>
      </div>
    </form>
  );
}

import React, { useState } from 'react';
import { GraduationCap, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { StatusTile } from '../components/StatusTile.jsx';
import { StudentLogin } from './StudentLogin.jsx';
import { TeacherPanel } from './teacher/TeacherPanel.jsx';

export function EntryView({ errors, onStarted }) {
  const [role, setRole] = useState('student');

  return (
    <section className="entry-screen" aria-labelledby="entry-title">
      <div className="entry-copy">
        <p className="eyebrow">Sistema de examen supervisado</p>
        <h1 id="entry-title">Examenes por codigo</h1>
        <p className="lead">
          El docente crea y revisa. El estudiante entra solo con nombre, correo institucional y codigo.
        </p>
        <div className="assurance-grid" aria-label="Resumen del sistema">
          <StatusTile icon={<GraduationCap />} title="Docente" text="Crea preguntas y revisa resultados." />
          <StatusTile icon={<KeyRound />} title="Codigo" text="Abre el examen correcto." />
          <StatusTile icon={<ShieldCheck />} title="Anti-copia" text="Registra foco, seleccion y atajos." />
        </div>
      </div>

      <div className="entry-panel">
        <div className="segmented-control" role="tablist" aria-label="Tipo de ingreso">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'student'}
            className={role === 'student' ? 'active' : ''}
            onClick={() => setRole('student')}
          >
            <UserRound aria-hidden="true" />
            Estudiante
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === 'teacher'}
            className={role === 'teacher' ? 'active' : ''}
            onClick={() => setRole('teacher')}
          >
            <GraduationCap aria-hidden="true" />
            Docente
          </button>
        </div>
        {role === 'student'
          ? <StudentLogin errors={errors} onStarted={onStarted} />
          : <TeacherPanel />}
      </div>
    </section>
  );
}

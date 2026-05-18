import React, { useState } from 'react';
import {
  GraduationCap,
  KeyRound,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { StatusTile } from '../components/StatusTile.jsx';
import { StudentLogin } from './StudentLogin.jsx';
import { TeacherPanel } from './teacher/TeacherPanel.jsx';

export function EntryView({ errors, onStarted }) {
  const [role, setRole] = useState(null);

  return (
    <section className="entry-screen" aria-labelledby="entry-title">
      <div className="entry-copy">
        <p className="eyebrow">Sistema supervisado inteligente</p>
        <h1 id="entry-title">Examenes por codigo</h1>
        <p className="lead">
          Plataforma educativa con ingreso por codigo, revision docente y supervision anti-copia en tiempo real.
        </p>
        <div className="assurance-grid" aria-label="Resumen del sistema">
          <StatusTile icon={<GraduationCap />} title="Docente" text="Crea preguntas y revisa resultados." />
          <StatusTile icon={<KeyRound />} title="Codigo" text="Abre el examen correcto." />
          <StatusTile icon={<ShieldCheck />} title="Anti-copia" text="Registra foco, seleccion y atajos." />
        </div>
      </div>

      <div className={`entry-panel dynamic-auth-panel ${role ? `is-${role}` : 'is-preview'}`}>
        <p className="auth-panel-label">Selecciona el tipo de acceso</p>
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
        <div className="auth-stage" aria-live="polite">
          {!role ? (
            <AccessIntro onSelect={setRole} />
          ) : (
            <div className="auth-form-slot" key={role}>
              <div className="access-context">
                {role === 'student' ? <UserRound aria-hidden="true" /> : <GraduationCap aria-hidden="true" />}
                <div>
                  <strong>{role === 'student' ? 'Acceso de estudiante' : 'Acceso docente'}</strong>
                  <p>
                    {role === 'student'
                      ? 'Ingresa tus datos y el codigo entregado por el docente.'
                      : 'Administra examenes, estudiantes, calificaciones e incidentes.'}
                  </p>
                </div>
              </div>
              {role === 'student'
                ? <StudentLogin errors={errors} onStarted={onStarted} />
                : <TeacherPanel />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AccessIntro({ onSelect }) {
  return (
    <div className="access-intro">
      <div className="access-copy">
        <span>Inicio del sistema</span>
        <h2>Elige como quieres ingresar</h2>
        <p>
          El sistema separa claramente el acceso del estudiante y el espacio de trabajo del docente.
        </p>
      </div>
      <div className="access-choice-grid">
        <button type="button" className="access-choice" onClick={() => onSelect('student')}>
          <span className="access-choice-icon"><UserRound aria-hidden="true" /></span>
          <strong>Estudiante</strong>
          <small>Entrar al examen con nombre, correo institucional y codigo.</small>
        </button>
        <button type="button" className="access-choice teacher" onClick={() => onSelect('teacher')}>
          <span className="access-choice-icon"><GraduationCap aria-hidden="true" /></span>
          <strong>Docente</strong>
          <small>Crear examenes, revisar resultados y ver incidentes anti-copia.</small>
        </button>
      </div>
      <div className="access-flow" aria-label="Flujo de acceso">
        <span>Selecciona perfil</span>
        <i aria-hidden="true"></i>
        <span>Completa datos</span>
        <i aria-hidden="true"></i>
        <span>Continua al sistema</span>
      </div>
    </div>
  );
}

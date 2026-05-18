import React, { useState } from 'react';
import { BarChart3, ListChecks, LogOut, Plus, UserRound } from 'lucide-react';
import { session } from '../../api/client.js';
import { TeacherAuth } from './TeacherAuth.jsx';
import { TeacherDashboard } from './TeacherDashboard.jsx';
import { TeacherBuilder } from './TeacherBuilder.jsx';
import { TeacherReview } from './TeacherReview.jsx';

export function TeacherPanel() {
  const [teacher, setTeacher] = useState(() => session.getTeacher());
  const [teacherTab, setTeacherTab] = useState('dashboard');
  const [selectedCode, setSelectedCode] = useState('HCI2026');

  if (!teacher) {
    return <TeacherAuth onTeacher={(nextTeacher) => setTeacher(nextTeacher)} />;
  }

  function handleLogout() {
    session.clearTeacher();
    setTeacher(null);
  }

  return (
    <div className="teacher-panel">
      <div className="teacher-session">
        <div className="teacher-identity">
          <span className="teacher-avatar" aria-hidden="true"><UserRound /></span>
          <div>
            <span className="session-meta">Sesion docente activa</span>
            <strong>{teacher.fullName}</strong>
            <span>{teacher.email}</span>
          </div>
        </div>
        <button type="button" className="text-action" onClick={handleLogout}>
          <LogOut aria-hidden="true" />
          Salir
        </button>
      </div>
      <div className="segmented-control compact" role="tablist" aria-label="Panel docente">
        <button
          type="button"
          role="tab"
          aria-selected={teacherTab === 'dashboard'}
          className={teacherTab === 'dashboard' ? 'active' : ''}
          onClick={() => setTeacherTab('dashboard')}
        >
          <ListChecks aria-hidden="true" />
          Mis examenes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={teacherTab === 'builder'}
          className={teacherTab === 'builder' ? 'active' : ''}
          onClick={() => setTeacherTab('builder')}
        >
          <Plus aria-hidden="true" />
          Crear
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={teacherTab === 'review'}
          className={teacherTab === 'review' ? 'active' : ''}
          onClick={() => setTeacherTab('review')}
        >
          <BarChart3 aria-hidden="true" />
          Revision
        </button>
      </div>
      {teacherTab === 'dashboard' && (
        <TeacherDashboard
          teacher={teacher}
          onSelect={(code) => { setSelectedCode(code); setTeacherTab('review'); }}
        />
      )}
      {teacherTab === 'builder' && (
        <TeacherBuilder
          teacher={teacher}
          onCreated={(exam) => { setSelectedCode(exam.accessCode); setTeacherTab('review'); }}
        />
      )}
      {teacherTab === 'review' && <TeacherReview accessCodeSeed={selectedCode} />}
    </div>
  );
}

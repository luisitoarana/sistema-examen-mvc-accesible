import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDataDirectory = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, 'sistema-examen-mvc-accesible')
  : join(__dirname, '../../data');
const databasePath = process.env.DB_PATH ?? join(defaultDataDirectory, 'exam.sqlite');
const dataDirectory = dirname(databasePath);
mkdirSync(dataDirectory, { recursive: true });

export const db = new DatabaseSync(databasePath);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA busy_timeout = 5000');

function columnExists(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().some((column) => column.name === columnName);
}

function addColumnIfMissing(tableName, columnName, definition) {
  if (!columnExists(tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER,
      title TEXT NOT NULL,
      course TEXT NOT NULL,
      access_code TEXT NOT NULL UNIQUE,
      duration_seconds INTEGER NOT NULL,
      created_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      ,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS exam_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'multiple_choice',
      prompt TEXT NOT NULL,
      position INTEGER NOT NULL,
      correct_option TEXT NOT NULL,
      correct_answer TEXT,
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    );

    CREATE TABLE IF NOT EXISTS question_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      option_key TEXT NOT NULL,
      option_text TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES exam_questions(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      document_id TEXT NOT NULL,
      group_name TEXT NOT NULL,
      email TEXT,
      auth_hash TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exam_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      exam_id INTEGER,
      started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      finished_at TEXT,
      score INTEGER DEFAULT 0,
      total_questions INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id TEXT NOT NULL,
      selected_option TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id)
    );

    CREATE TABLE IF NOT EXISTS security_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'leve',
      source TEXT NOT NULL DEFAULT 'web',
      details TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id)
    );
  `);

  addColumnIfMissing('students', 'email', 'TEXT');
  addColumnIfMissing('students', 'auth_hash', 'TEXT');
  addColumnIfMissing('exam_attempts', 'exam_id', 'INTEGER REFERENCES exams(id)');
  addColumnIfMissing('exam_questions', 'question_type', "TEXT NOT NULL DEFAULT 'multiple_choice'");
  addColumnIfMissing('exam_questions', 'correct_answer', 'TEXT');
  addColumnIfMissing('exams', 'teacher_id', 'INTEGER REFERENCES teachers(id)');
  addColumnIfMissing('security_events', 'severity', "TEXT NOT NULL DEFAULT 'leve'");
  addColumnIfMissing('security_events', 'source', "TEXT NOT NULL DEFAULT 'web'");
  addColumnIfMissing('security_events', 'metadata', 'TEXT');

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_exams_teacher ON exams(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_exams_access_code ON exams(access_code);
    CREATE INDEX IF NOT EXISTS idx_attempts_exam ON exam_attempts(exam_id);
    CREATE INDEX IF NOT EXISTS idx_events_attempt ON security_events(attempt_id);
    CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id);
  `);
}

import { randomBytes } from 'node:crypto';
import { db } from '../config/database.js';

const optionKeys = ['a', 'b', 'c', 'd'];

export function normalizeCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

export function normalizeAnswer(value) {
  return String(value ?? '').trim().toLowerCase();
}

function generateAccessCode() {
  return randomBytes(4).toString('hex').toUpperCase();
}

function mapQuestion(row) {
  const options = db.prepare(`
    SELECT option_key AS id, option_text AS text
    FROM question_options
    WHERE question_id = ?
    ORDER BY option_key
  `).all(row.id);

  return {
    id: String(row.id),
    questionType: row.questionType,
    prompt: row.prompt,
    options
  };
}

export class ExamModel {
  static getByTeacher(teacherId) {
    return db.prepare(`
      SELECT
        exams.id,
        exams.title,
        exams.course,
        exams.access_code AS accessCode,
        exams.duration_seconds AS durationSeconds,
        exams.status,
        exams.created_at AS createdAt,
        (SELECT COUNT(*) FROM exam_questions WHERE exam_questions.exam_id = exams.id) AS questionCount,
        (SELECT COUNT(*) FROM exam_attempts WHERE exam_attempts.exam_id = exams.id) AS attemptCount,
        (SELECT COUNT(*) FROM exam_attempts
          WHERE exam_attempts.exam_id = exams.id
          AND exam_attempts.status = 'finished') AS finishedCount
      FROM exams
      WHERE exams.teacher_id = ?
      ORDER BY exams.created_at DESC
    `).all(Number(teacherId));
  }

  static create(exam) {
    const code = normalizeCode(exam.accessCode) || generateAccessCode();
    const requestedDuration = Number(exam.durationSeconds ?? Number(exam.durationMinutes ?? 0) * 60 ?? 720);
    const durationSeconds = Math.min(Math.max(300, requestedDuration), 360 * 60);
    const questions = exam.questions ?? [];

    db.exec('BEGIN');
    try {
      const examResult = db.prepare(`
        INSERT INTO exams (teacher_id, title, course, access_code, duration_seconds, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        exam.teacherId ?? null,
        String(exam.title).trim(),
        String(exam.course).trim(),
        code,
        durationSeconds,
        String(exam.createdBy ?? `Docente #${exam.teacherId ?? 'demo'}`).trim()
      );

      const insertQuestion = db.prepare(`
        INSERT INTO exam_questions (exam_id, question_type, prompt, position, correct_option, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insertOption = db.prepare(`
        INSERT INTO question_options (question_id, option_key, option_text)
        VALUES (?, ?, ?)
      `);

      questions.forEach((question, index) => {
        const questionType = question.questionType ?? 'multiple_choice';
        const correctOption = questionType === 'multiple_choice'
          ? normalizeCode(question.correctOption).toLowerCase()
          : '';
        const correctAnswer = questionType === 'multiple_choice'
          ? null
          : normalizeAnswer(question.correctAnswer);
        const questionResult = insertQuestion.run(
          examResult.lastInsertRowid,
          questionType,
          String(question.prompt).trim(),
          index + 1,
          correctOption,
          correctAnswer
        );
        if (questionType === 'multiple_choice') {
          (question.options ?? []).slice(0, 4).forEach((optionText, optionIndex) => {
            insertOption.run(
              questionResult.lastInsertRowid,
              optionKeys[optionIndex],
              String(optionText).trim()
            );
          });
        }
        if (questionType === 'true_false') {
          insertOption.run(questionResult.lastInsertRowid, 'true', 'Verdadero');
          insertOption.run(questionResult.lastInsertRowid, 'false', 'Falso');
        }
      });

      db.exec('COMMIT');
      return this.getByCode(code, { includeAnswers: true });
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  static getByCode(accessCode, options = {}) {
    const exam = db.prepare(`
      SELECT
        id,
        teacher_id AS teacherId,
        title,
        course,
        access_code AS accessCode,
        duration_seconds AS durationSeconds,
        created_by AS createdBy,
        status,
        created_at AS createdAt
      FROM exams
      WHERE access_code = ?
    `).get(normalizeCode(accessCode));

    if (!exam) return null;

    const rows = db.prepare(`
      SELECT
        id,
        question_type AS questionType,
        prompt,
        position,
        correct_option AS correctOption,
        correct_answer AS correctAnswer
      FROM exam_questions
      WHERE exam_id = ?
      ORDER BY position
    `).all(exam.id);

    exam.questions = rows.map((row) => {
      const question = mapQuestion(row);
      if (options.includeAnswers) {
        question.correctOption = row.correctOption;
        question.correctAnswer = row.correctAnswer;
      }
      return question;
    });

    return exam;
  }

  static getForAttempt(attemptId, options = {}) {
    const attempt = db.prepare('SELECT exam_id AS examId FROM exam_attempts WHERE id = ?')
      .get(Number(attemptId));
    if (!attempt?.examId) return null;
    const exam = db.prepare('SELECT access_code AS accessCode FROM exams WHERE id = ?')
      .get(attempt.examId);
    return exam ? this.getByCode(exam.accessCode, options) : null;
  }

  static getQuestionsForAttempt(attemptId) {
    return this.getForAttempt(attemptId)?.questions ?? [];
  }
}

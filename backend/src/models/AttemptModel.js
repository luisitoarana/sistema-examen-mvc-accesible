import { db } from '../config/database.js';
import { ExamModel, normalizeAnswer } from './ExamModel.js';

export class AttemptModel {
  static create(student) {
    const exam = ExamModel.getByCode(student.accessCode);
    if (!exam || exam.status !== 'active') return null;

    const studentResult = db.prepare(`
      INSERT INTO students (full_name, document_id, group_name, email, auth_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      String(student.fullName).trim(),
      String(student.documentId ?? student.email).trim(),
      exam.course,
      String(student.email).trim().toLowerCase(),
      null
    );

    const attemptResult = db.prepare(`
      INSERT INTO exam_attempts (student_id, exam_id, total_questions)
      VALUES (?, ?, ?)
    `).run(studentResult.lastInsertRowid, exam.id, exam.questions.length);

    return Number(attemptResult.lastInsertRowid);
  }

  static findById(attemptId) {
    return db.prepare(`
      SELECT
        exam_attempts.id,
        exam_attempts.status,
        exam_attempts.started_at AS startedAt,
        exams.title AS examTitle,
        exams.course AS course,
        exams.access_code AS accessCode,
        exams.duration_seconds AS durationSeconds,
        students.full_name AS fullName,
        students.email AS email,
        (
          SELECT COUNT(*)
          FROM security_events
          WHERE security_events.attempt_id = exam_attempts.id
        ) AS incidentCount
      FROM exam_attempts
      JOIN students ON students.id = exam_attempts.student_id
      JOIN exams ON exams.id = exam_attempts.exam_id
      WHERE exam_attempts.id = ?
    `).get(Number(attemptId));
  }

  static grade(attemptId, submittedAnswers) {
    const exam = ExamModel.getForAttempt(attemptId, { includeAnswers: true });
    if (!exam) return null;
    const answers = submittedAnswers ?? {};

    let score = 0;
    const graded = exam.questions.map((question) => {
      const selected = answers[question.id] ?? '';
      const isCorrect = question.questionType === 'short_answer'
        ? normalizeAnswer(selected) === normalizeAnswer(question.correctAnswer)
        : selected === (question.questionType === 'multiple_choice'
            ? question.correctOption
            : question.correctAnswer);
      if (isCorrect) score += 1;
      return {
        questionId: question.id,
        selectedOption: selected,
        isCorrect
      };
    });

    return { score, graded, total: exam.questions.length };
  }

  static saveAnswers(attemptId, gradedAnswers, score) {
    const attempt = db.prepare('SELECT id, status FROM exam_attempts WHERE id = ?').get(Number(attemptId));
    if (!attempt || attempt.status !== 'in_progress') return false;

    const insertAnswer = db.prepare(`
      INSERT INTO answers (attempt_id, question_id, selected_option, is_correct)
      VALUES (?, ?, ?, ?)
    `);
    const updateAttempt = db.prepare(`
      UPDATE exam_attempts
      SET finished_at = CURRENT_TIMESTAMP, score = ?, status = 'finished'
      WHERE id = ?
    `);

    db.exec('BEGIN');
    try {
      for (const answer of gradedAnswers) {
        insertAnswer.run(
          Number(attemptId),
          answer.questionId,
          answer.selectedOption,
          answer.isCorrect ? 1 : 0
        );
      }
      updateAttempt.run(score, Number(attemptId));
      db.exec('COMMIT');
      return true;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  static getResult(attemptId) {
    return db.prepare(`
      SELECT
        exam_attempts.id,
        exam_attempts.score,
        exam_attempts.total_questions AS totalQuestions,
        exam_attempts.started_at AS startedAt,
        exam_attempts.finished_at AS finishedAt,
        exams.title AS examTitle,
        exams.course AS course,
        students.full_name AS fullName,
        students.email AS email,
        (
          SELECT COUNT(*)
          FROM security_events
          WHERE security_events.attempt_id = exam_attempts.id
        ) AS incidentCount
      FROM exam_attempts
      JOIN students ON students.id = exam_attempts.student_id
      JOIN exams ON exams.id = exam_attempts.exam_id
      WHERE exam_attempts.id = ?
    `).get(Number(attemptId));
  }

  static getExamSummary(accessCode) {
    const exam = ExamModel.getByCode(accessCode);
    if (!exam) return null;

    const attempts = db.prepare(`
      SELECT
        exam_attempts.id,
        exam_attempts.score,
        exam_attempts.total_questions AS totalQuestions,
        exam_attempts.status,
        exam_attempts.started_at AS startedAt,
        exam_attempts.finished_at AS finishedAt,
        students.full_name AS fullName,
        students.email AS email,
        (SELECT COUNT(*) FROM answers WHERE answers.attempt_id = exam_attempts.id) AS answeredCount,
        (SELECT COUNT(*) FROM answers WHERE answers.attempt_id = exam_attempts.id AND answers.is_correct = 1) AS correctCount,
        (SELECT COUNT(*) FROM security_events WHERE security_events.attempt_id = exam_attempts.id) AS incidentCount
      FROM exam_attempts
      JOIN students ON students.id = exam_attempts.student_id
      WHERE exam_attempts.exam_id = ?
      ORDER BY exam_attempts.started_at DESC
    `).all(exam.id);

    const events = db.prepare(`
      SELECT
        security_events.attempt_id AS attemptId,
        security_events.event_type AS eventType,
        security_events.severity,
        security_events.source,
        security_events.details,
        security_events.metadata,
        security_events.created_at AS createdAt
      FROM security_events
      JOIN exam_attempts ON exam_attempts.id = security_events.attempt_id
      WHERE exam_attempts.exam_id = ?
      ORDER BY security_events.created_at DESC
      LIMIT 200
    `).all(exam.id);

    const attemptsWithEvents = attempts.map((attempt) => ({
      ...attempt,
      events: events.filter((event) => event.attemptId === attempt.id)
    }));

    return {
      exam,
      attempts: attemptsWithEvents,
      events,
      stats: {
        totalAttempts: attempts.length,
        finishedAttempts: attempts.filter((attempt) => attempt.status === 'finished').length,
        penalizedAttempts: attempts.filter((attempt) => attempt.incidentCount > 0).length,
        averageScore: attempts.length
          ? Number((attempts.reduce((sum, attempt) => sum + Number(attempt.score ?? 0), 0) / attempts.length).toFixed(2))
          : 0
      }
    };
  }
}

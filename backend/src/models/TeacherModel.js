import { db } from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/passwords.js';

const teacherProjection = `
  id,
  full_name AS fullName,
  email,
  created_at AS createdAt
`;

export class TeacherModel {
  static create(teacher) {
    const result = db.prepare(`
      INSERT INTO teachers (full_name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(
      String(teacher.fullName).trim(),
      String(teacher.email).trim().toLowerCase(),
      hashPassword(teacher.password)
    );
    return this.findById(Number(result.lastInsertRowid));
  }

  static findByEmail(email) {
    return db.prepare(`SELECT ${teacherProjection} FROM teachers WHERE email = ?`)
      .get(String(email ?? '').trim().toLowerCase());
  }

  static findById(teacherId) {
    return db.prepare(`SELECT ${teacherProjection} FROM teachers WHERE id = ?`).get(Number(teacherId));
  }

  static authenticate(credentials) {
    const row = db.prepare(`
      SELECT id, full_name AS fullName, email, password_hash AS passwordHash, created_at AS createdAt
      FROM teachers
      WHERE email = ?
    `).get(String(credentials.email ?? '').trim().toLowerCase());
    if (!row) return null;
    if (!verifyPassword(credentials.password, row.passwordHash)) return null;
    const { passwordHash: _ignored, ...teacher } = row;
    return teacher;
  }
}

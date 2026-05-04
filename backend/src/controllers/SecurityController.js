import { SecurityEventModel } from '../models/SecurityEventModel.js';

export class SecurityController {
  static event(request, response) {
    const data = request.body ?? {};
    if (!data.attemptId || !data.eventType) {
      response.status(422).json({ ok: false, error: 'Datos de evento incompletos.' });
      return;
    }
    if (request.auth?.role === 'student'
      && Number(request.auth.attemptId ?? request.auth.sub) !== Number(data.attemptId)) {
      response.status(403).json({ ok: false, error: 'El intento no coincide con la sesion.' });
      return;
    }
    const saved = SecurityEventModel.record(
      Number(data.attemptId),
      data.eventType,
      data.details,
      {
        severity: data.severity,
        source: data.source,
        metadata: data.metadata
      }
    );
    response.json({ ok: saved });
  }
}

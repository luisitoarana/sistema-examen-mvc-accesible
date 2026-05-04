export class HealthController {
  static health(_request, response) {
    response.json({ ok: true, service: 'sistema-examen-mvc-accesible' });
  }
}

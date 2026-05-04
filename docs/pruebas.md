# Pruebas realizadas

## 1. Pruebas funcionales del backend (verificadas via curl)

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | `GET /api/health` | `{ ok: true, service: 'sistema-examen-mvc-accesible' }` |
| 2 | `POST /api/teachers/login` con credenciales demo | Devuelve `teacher` + `token` JWT (HS256, iss `sistema-examen`) |
| 3 | `POST /api/teachers/register` con email duplicado | HTTP 409 con mensaje claro |
| 4 | `POST /api/teachers/login` con contrasena < 8 | HTTP 422 con error de validacion |
| 5 | `GET /api/teachers/:id/exams` sin token | HTTP 401 |
| 6 | `GET /api/teachers/:id/exams` con token de otro docente | HTTP 403 |
| 7 | `GET /api/exams/HCI2026` | Devuelve examen sin `correctOption`/`correctAnswer` |
| 8 | `POST /api/exams` con token | Crea examen, devuelve `accessCode` |
| 9 | `POST /api/exams` sin token | HTTP 401 |
| 10 | `POST /api/attempts` con codigo valido | Devuelve `attemptId`, preguntas y `token` de estudiante |
| 11 | `POST /api/attempts/:id/submit` con token | Califica y persiste resultado |
| 12 | `POST /api/attempts/:id/submit` con token de otro intento | HTTP 403 |
| 13 | `POST /api/security-event` durante `in_progress` | `{ ok: true }` |
| 14 | `POST /api/security-event` despues de `submit` | `{ ok: false }` (defensa: no se registran eventos sobre intentos finalizados) |
| 15 | `POST /api/security-event` con `attemptId` que no es el del token | HTTP 403 |
| 16 | 9+ intentos de login en 5 minutos | Activa rate-limit y devuelve mensaje accionable |
| 17 | `helmet` aplicado | Cabeceras CSP, X-Content-Type-Options, X-Frame-Options |

## 2. Pruebas del frontend web

- `npm run build` produce `dist/` minificado y con hash de contenido.
- React 19 en modo `StrictMode` sin warnings.
- `useExamProctor` registra los eventos esperados: tab oculto, perdida de foco, salida de pantalla completa, menu contextual, copy/paste, seleccion de texto larga, atajos bloqueados.
- `sessionStorage` se vacia al cerrar la pestana del navegador.
- La paleta de tema viene del archivo `styles.css` y coincide con la del desktop (`app_colors.dart`).

## 3. Pruebas de la app desktop Flutter

- `flutter analyze` sobre `lib/`: **0 issues**.
- `flutter test test/widget_test.dart`: **All tests passed**.
- `flutter build windows` produce `.exe` ejecutable.
- `ProctorService.start()` registra `WidgetsBindingObserver` y `HardwareKeyboard` handler; `stop()` los desregistra.
- Lista negra cubre asistentes IA, mensajeria con bots, control remoto, grabadores y conferencias.
- Cliente API envia `Authorization: Bearer <token>` cuando corresponde.

## 4. Pruebas de accesibilidad manual

- Navegacion completa con `Tab` por campos, opciones y botones.
- `skip-link` lleva el foco a `#contenido` desde el primer Tab.
- Todos los botones tienen nombre accesible (`aria-label` o texto visible).
- Los avisos de error usan `role="alert"` + icono + texto, no dependen del color.
- `aria-live="polite"` en temporizador y contador de incidentes.
- `aria-live="assertive"` en notificaciones de supervision.
- Iconos decorativos marcados con `aria-hidden="true"`.
- Lectura por voz disponible en cada pregunta y en el panel de estado.

## 5. Pruebas de seguridad e integridad academica

- JWT firmado con HS256 y `JWT_SECRET` aleatorio en desarrollo / obligatorio en produccion.
- Contrasenas hasheadas con scrypt + salt aleatorio + comparacion timing-safe.
- Endpoints sensibles protegidos por `requireAuth(role)` con verificacion de propiedad.
- Tokens jamas se transmiten por URL; siempre en cabecera `Authorization`.
- Rate limiting independiente para login, API general y eventos de supervision.
- Validacion de `accessCode`, `email`, `duration`, longitud de campos en cliente y servidor.

## 6. Criterios de aceptacion

- El examen se puede completar con teclado.
- El resultado muestra puntaje e incidentes.
- El sistema conserva la informacion en SQLite.
- La estructura separa modelo, controlador, rutas, servicios y vistas.
- Eventos registrados: pestana, foco, pantalla completa, seleccion, portapapeles, menu contextual, atajos bloqueados (web), navegacion externa (extension), ventana activa, lifecycle, captura, grabador y atajos (desktop).
- La extension queda lista para registrar pestanas, URLs y busquedas en Chrome/Edge/Brave.
- La app desktop emite eventos con `severity` y `source: 'desktop'`.

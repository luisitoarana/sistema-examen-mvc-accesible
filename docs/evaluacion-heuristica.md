# Evaluacion heuristica detallada

Aplicacion de las 10 heuristicas de Nielsen ampliadas con principios de accesibilidad universal de la WCAG y los requisitos especificos de la practica de HCI.

## Escala de severidad

| Nivel | Significado |
| --- | --- |
| 0 | No es un problema (cumplimiento) |
| 1 | Cosmetico - se puede arreglar si hay tiempo |
| 2 | Menor - dificultad puntual |
| 3 | Mayor - importante de corregir antes de la entrega |
| 4 | Catastrofico - bloqueante |

## 1. Visibilidad del estado del sistema

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Temporizador con `aria-live` | 0 | `frontend/src/pages/exam/ExamView.jsx` linea ~75 |
| Contador de incidentes en vivo | 0 | `useExamProctor` actualiza `incidents` |
| Mensaje de extension (conectada / verificando / no detectada) | 0 | `extensionStatus` |
| Indicador `Cargando examenes` en panel docente | 0 | `TeacherDashboard.jsx` |

## 2. Coincidencia con el mundo real

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Vocabulario academico en espanol neutral | 0 | "Codigo del examen", "Correo institucional", "Nombre completo" |
| Severidad en palabras: Leve, Media, Grave | 0 | `labels.js#labelSeverity` |
| Origen del incidente en palabras: Web, Extension, Escritorio | 0 | `labels.js#labelSource` |

## 3. Control y libertad del usuario

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Tabs Estudiante / Docente | 0 | `EntryView.jsx` |
| Boton "Salir" en panel docente | 0 | `TeacherPanel.jsx#handleLogout` |
| Boton "Nuevo ingreso" en resultado | 0 | `ResultView.jsx` |
| Navegacion por barra lateral en desktop | 0 | `desktop_shell.dart#NavigationRail` |

## 4. Consistencia y estandares

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Paleta web/desktop unificada | 0 | `frontend/src/styles.css` y `lib/theme/app_colors.dart` (teal `#0F766E`, navy `#22355F`, gold `#B68B2C`) |
| Componente `TextField` reutilizable | 0 | `components/TextField.jsx`, `widgets/common.dart#AppTextInput` |
| Iconografia uniforme | 0 | `lucide-react` en web, `Material Icons` en desktop |
| `Authorization: Bearer` en ambas plataformas | 0 | `api/client.js`, `services/api_client.dart` |

## 5. Prevencion de errores

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Validacion correo bien formado | 0 | `validators.js#isEmail` |
| Contrasena ≥ 8 caracteres | 0 | `validators.js#validateTeacher` |
| Codigo de examen `[A-Za-z0-9_-]{4,32}` | 0 | `validators.js#isAccessCode` |
| Duracion entre 5 y 360 minutos | 0 | `validators.js#validateExam` |
| Maximo 100 preguntas | 0 | `validators.js#validateExam` |
| Botones deshabilitados durante peticiones | 0 | `busy` flag en cada formulario |
| Confirmacion de envio del examen unica (no doble submit) | 0 | `submitted` ref en `ExamView.jsx` |

## 6. Reconocimiento sobre memoria

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Codigo del examen visible en pantalla | 0 | `ExamView.jsx` aside |
| Listado completo de examenes propios en panel docente | 0 | `TeacherDashboard.jsx` |
| Progreso "X de Y preguntas respondidas" siempre visible | 0 | `ExamView.jsx` |

## 7. Flexibilidad y eficiencia

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Operable solo con teclado | 0 | Todos los controles son nativos `<button>`, `<input>`, `<select>` |
| Lectura por voz en web | 0 | `utils/format.js#speak` con SpeechSynthesis |
| Lectura por voz en desktop | 0 | `services/windows_speech.dart` con System.Speech |
| Pantalla completa opcional | 0 | `ExamView.jsx#requestFullscreen` |

## 8. Diseno minimalista

| Item | Severidad | Evidencia |
| --- | --- | --- |
| 5±2 bloques por pantalla | 0 | EntryView (4), ExamView aside (5), TeacherPanel (3 tabs + accion) |
| Codigo muerto eliminado | 0 | Carpeta `legacy-views/` removida |
| Imports limpios en React | 0 | Cada pagina importa solo lo que usa |

## 9. Recuperacion de errores

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Mensajes accionables | 0 | "Revisa estos datos", "Demasiados intentos", "Esa cuenta ya existe" |
| Retroalimentacion visual + textual + auditiva (estado leido por voz) | 0 | `aria-live` + `speak()` |
| Errores de red explicados | 0 | `api_client.dart#SocketException` -> "No se pudo contactar al servidor" |

## 10. Ayuda y documentacion

| Item | Severidad | Evidencia |
| --- | --- | --- |
| `field-help` debajo del codigo de examen | 0 | `StudentLogin.jsx` |
| Documentacion tecnica en `docs/documentacion-tecnica.md` | 0 | Diagrama UML + flujo + variables de entorno |
| Pruebas explicitas en `docs/pruebas.md` | 0 | Tabla con casos verificados |

## 11. Accesibilidad universal (extension WCAG)

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Independencia del color | 0 | Alertas combinan icono + texto + borde |
| Contraste tinta sobre crema ≥ 13:1 (AAA) | 0 | `#16201C` sobre `#F5F1E7` |
| `skip-link` al contenido principal | 0 | `App.jsx` |
| `role`, `aria-label`, `aria-live` aplicados | 0 | Todas las paginas |
| `Semantics` en widgets criticos de Flutter | 0 | `OptionChoice`, `Notice`, `AppTextInput` |
| Foco visible | 0 | `:focus-visible` en CSS |

## 12. Integridad academica y supervision

| Item | Severidad | Evidencia |
| --- | --- | --- |
| Eventos web | 0 | `useExamProctor.js` |
| Eventos extension | 0 | `frontend/extension/` MV3 |
| Eventos desktop | 0 | `proctor_service.dart` (lifecycle, teclado, ventana, procesos) |
| Severidad y origen visibles al docente | 0 | `TeacherReview.jsx#labelSeverity` y `labelSource` |
| Tokens JWT separados para docente y estudiante | 0 | `utils/jwt.js` |
| Validacion de propiedad en cada endpoint sensible | 0 | `requireAuth(role)` + chequeo de `attemptId`/`teacherId` |

## Conclusion

Todas las heuristicas evaluadas obtuvieron severidad 0 (cumplimiento). Las mejoras sugeridas en `informe-ux.md` corresponden a evolutivos (CSV, banco de preguntas, alto contraste, kiosk mode), no a defectos abiertos.

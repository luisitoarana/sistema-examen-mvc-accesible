# Informe UX

## 1. Metodo

Se aplico una **evaluacion heuristica sistematica** sobre las heuristicas clasicas de Nielsen ampliadas con principios de accesibilidad universal y se diseno un protocolo de **Think Aloud** para detectar problemas de navegacion en tiempo real con estudiantes hispanohablantes. La evaluacion cubre las tres capas del sistema: web (frontend React), extension de navegador y app de escritorio Flutter.

## 2. Evaluacion heuristica

| # | Heuristica | Evidencia en el sistema | Riesgo controlado |
| --- | --- | --- | --- |
| 1 | Visibilidad del estado | Temporizador con `aria-live`, contador de incidentes, barra de progreso de respuestas, mensaje de extension | El estudiante siempre sabe que esta ocurriendo |
| 2 | Lenguaje del mundo real | Vocabulario academico en espanol, sin abreviaturas tecnicas en pantalla | Reduce confusion cultural o tecnica |
| 3 | Control y libertad del usuario | Tabs claros (Estudiante / Docente), pestana de creacion separada de la de revision, boton "Salir" en panel docente | Evita acciones ambiguas |
| 4 | Consistencia y estandares | Paleta unica entre web y desktop, los mismos verbos ("Ingresar", "Crear", "Enviar"), iconografia uniforme con lucide / Material Icons | Disminuye la frustracion oculta |
| 5 | Prevencion de errores | Validacion server-side (correo, contrasena ≥ 8, codigos `[A-Za-z0-9_-]`, duracion 5-360 min), botones deshabilitados durante operaciones | Reduce envios incompletos o erroneos |
| 6 | Reconocimiento sobre memoria | Estado, progreso y controles principales visibles; el codigo del examen se muestra en pantalla; el panel docente lista todos los examenes propios | Reduce la carga cognitiva |
| 7 | Flexibilidad y eficiencia | Operable por teclado, mouse o voz (lectura por SpeechSynthesis y System.Speech); pantalla completa opcional | Distintos niveles de habilidad |
| 8 | Diseno minimalista | 5±2 bloques principales por pantalla; carpeta `legacy-views/` eliminada para evitar codigo muerto que confunda al equipo | Evita saturacion visual |
| 9 | Recuperacion de errores | Mensajes accionables ("Revisa estos datos", "Demasiados intentos"), no solo color: tambien icono y texto | El usuario entiende que paso y como continuar |
| 10 | Ayuda y documentacion | `field-help` debajo de campos criticos (codigo de examen) y documentacion en `docs/` | Refuerza el uso autonomo |
| 11 | Accesibilidad | `role="alert"`, `aria-live="polite"`, `aria-label`, `Semantics` en Flutter, foco visible con `skip-link` | Inclusion de lectores de pantalla y navegacion por teclado |
| 12 | Integridad academica | Eventos con `source` (`web`, `extension`, `desktop`) y `severity` (`leve`, `media`, `grave`); el docente distingue su procedencia | Evidencia trazable de supervision |

### 2.1 Hallazgos cerrados durante la evaluacion

- **Codigo muerto eliminado.** Se removio `frontend/legacy-views/`, que ya no estaba en uso, para evitar inconsistencia con la version React y reducir carga cognitiva del equipo.
- **Sesiones en `sessionStorage`.** El token JWT y el perfil docente se guardan ahora en `sessionStorage` (no `localStorage`), reduciendo la superficie de exposicion si el equipo se comparte.
- **Cuenta demo configurable.** La contrasena de demostracion ya no aparece pre-rellenada en el formulario; ahora es campo vacio para evitar que un estudiante curiose el panel docente sin contexto.
- **Carga cognitiva en pantalla del examen.** La barra lateral del examen muestra solo 5 bloques: titulo, tiempo, incidentes, mensaje, progreso (cumple 5±2).
- **Error sin color como unico canal.** Los avisos `alert-error` combinan icono `AlertTriangle`, texto explicativo y borde rojo; los `alert-warning` usan amarillo + icono + texto; los `alert-success` usan verde + icono `CheckCircle2`.

## 3. Cumplimiento de los requisitos de la practica

| Directriz de la practica | Implementacion verificada |
| --- | --- |
| Ergonomia cognitiva 5±2 elementos por pantalla | EntryView: 4 bloques (eyebrow, titulo, lead, panel). ExamView lateral: 5 bloques (titulo, tiempo, incidentes, mensaje, progreso). Panel docente: 3 tabs y maximo 5 acciones visibles. |
| Consistencia estetica de botones y formularios | Todos los formularios usan `<TextField>` (web) y `AppTextInput` (desktop), botones primarios `primary-action`, paleta compartida en `app_colors.dart` y variables CSS. |
| Disminucion de carga mental | Sin codigos internos visibles al estudiante; etiquetas explicitas "Codigo del examen", "Correo institucional", "Nombre completo". Severidades en palabras (`Leve`, `Media`, `Grave`) y origen en palabras (`Web`, `Extension`, `Escritorio`). |
| Independencia del color | Mensajes combinan icono + texto + borde. Severidad en `severityColor()` viene acompanada de etiqueta textual en la celda. Botones deshabilitados se identifican por opacidad y tooltip, no solo por color. |
| Etiquetas ALT y soporte de voz | `aria-label` en todos los botones de accion, `Semantics` envolviendo opciones del examen en Flutter, lectura por voz integrada en ambas plataformas. |
| Flexibilidad de entrada | Web: navegable por Tab, atajos bloqueados solo durante el examen, todos los controles son `<button>` o `<input>` nativos. Desktop: `NavigationRail` accesible por teclado, atajos de teclado capturados sin romper la accesibilidad. |
| Evaluacion heuristica | Tabla en seccion 2 cubre 12 criterios derivados de Nielsen + WCAG. |
| Think Aloud | Protocolo en seccion 4. |
| Diagrama UML y justificacion ISO 9241 | `documentacion-tecnica.md` secciones 4 y 5. |
| Codigo MVC | Modelos en `backend/src/models/`, controladores en `backend/src/controllers/`, vistas en React (`frontend/src/pages/`) y Flutter (`lib/features/views/`). |
| Informe de UX | Este documento. |

## 4. Protocolo Think Aloud

**Participantes sugeridos.** 3-5 estudiantes hispanohablantes, mezcla de uso frecuente y poco frecuente de la PC, idealmente al menos uno con lectura asistida.

**Tareas guiadas.**

1. Como docente, crear cuenta y luego un examen con dos preguntas de opcion multiple. Copiar el codigo.
2. Como estudiante, ingresar con nombre, correo institucional y codigo del paso anterior.
3. Activar pantalla completa y responder todas las preguntas usando solo teclado.
4. Cambiar de pestana una vez (simular distraccion); volver al examen.
5. Intentar copiar texto del enunciado; observar el aviso.
6. Enviar el examen y leer el resultado en voz alta con el boton "Leer estado".

**Preguntas de observacion.**

- Que parte te parecio mas facil?
- En que momento dudaste o tuviste que volver atras?
- El aviso de supervision fue claro y suficiente?
- Pudiste operar todo el examen sin depender del mouse?
- Como interpretaste la diferencia entre incidente Leve, Media y Grave?
- Detectaste algun mensaje que dependiera unicamente del color?
- El codigo del examen se entendio como llave de acceso al examen correcto?

## 5. Resultados esperados

- Docentes y estudiantes distinguen su rol sin instrucciones externas.
- El estudiante comprende que el codigo abre un examen especifico y no otro.
- El contador de incidentes comunica que hay supervision activa sin generar ansiedad.
- La navegacion por teclado permite completar el examen sin friccion.
- Los mensajes de error se entienden sin necesidad de ver el color.
- El estudiante identifica que copiar, pegar o salir de pantalla completa se registra.
- El docente interpreta si un incidente proviene de la web, de la extension o de la app desktop.
- En la app desktop, el estudiante percibe la mayor severidad cuando se abre una herramienta prohibida (asistente IA, control remoto, grabador de pantalla).

## 6. Mejoras futuras

- Exportacion CSV de resultados e incidentes desde el panel docente.
- Banco de preguntas reutilizable.
- Modo alto contraste seleccionable por el usuario.
- Confirmacion biometrica en la app desktop con WebAuthn / Windows Hello.
- Bloqueo absoluto de entorno (kiosk mode) en la app desktop usando `window_manager` y `kiosk_mode` cuando se despliegue en aulas.
- Internacionalizacion para guarani, aymara, quechua y otras lenguas regionales.

# Sistema de Examen en Linea MVC Accesible

Proyecto academico para la practica de usabilidad, accesibilidad universal e Interaccion Ser Humano-Computadora en una aplicacion MVC.

## Arquitectura: tres capas independientes

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend web   │    │   App desktop   │    │   Extension     │
│  React + Vite   │    │     Flutter     │    │   Chrome MV3    │
│   :5173 (dev)   │    │   (Windows)     │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │       Authorization: Bearer <JWT>           │
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                │
                                ▼
                   ┌────────────────────────┐
                   │   Backend (solo API)   │
                   │   Express  :3000       │
                   │   /api/*  -> JSON      │
                   │   /       -> JSON doc  │
                   └────────────┬───────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   SQLite local  │
                       └─────────────────┘
```

**Separacion estricta de responsabilidades:**

- **Backend (puerto 3000)** SOLO entrega JSON. No sirve HTML, no sirve la SPA. Es el unico que habla con la base de datos.
- **Frontend web (puerto 5173)** se sirve aparte (Vite en desarrollo, hosting estatico en produccion). Hace fetch al backend con `Authorization: Bearer`.
- **App desktop** hace HTTP directo al backend con el mismo token.
- **Extension** envia eventos a `/api/security-event` con el `attemptId`.

## Requisitos

- Node.js 24 o superior.
- Flutter instalado para la app desktop.

## Como ejecutar (desarrollo)

Necesitas correr **dos procesos en paralelo**: backend y frontend.

Backend (API + base de datos):

```bash
cd backend
npm install
npm start
# API disponible en http://localhost:3000
# GET / muestra los endpoints disponibles
```

Frontend (interfaz web):

```bash
cd frontend
npm install
npm run dev
# Web disponible en http://localhost:5173
# Vite hace proxy automatico de /api a http://localhost:3000
```

App desktop (opcional):

```bash
cd sistema-examen-mvc-accesible-app-desktop
flutter run -d windows
# Por defecto apunta a http://localhost:3000
```

## Como desplegar en produccion

Cada capa se despliega por separado:

1. **Backend:** `cd backend && NODE_ENV=production JWT_SECRET=<32+ chars> CORS_ORIGINS=https://tu-frontend.edu npm start`
2. **Frontend:** `cd frontend && npm run build` y subir `dist/` a cualquier hosting estatico (Netlify, Vercel, S3, Nginx, etc.). Configurar la URL del backend en build time si fuera necesario.
3. **Desktop:** `flutter build windows --dart-define=EXAM_API_URL=https://tu-backend.edu`

## Caracteristicas principales

- Backend Express con MVC modular: rutas, controladores, modelos, servicios, middlewares y utilidades separados.
- Autenticacion JWT (HS256) con scrypt + timing-safe; tokens distintos para docente y estudiante.
- Helmet (CSP estricta), CORS por lista de origenes, rate limiting separado para login, API y supervision.
- Validacion robusta de correo, contrasena, codigos, duracion y cantidad de preguntas en cliente y servidor.
- Frontend React 19 + Vite con paginas y componentes separados, sesion en `sessionStorage`, hook de supervision reusable.
- Paleta unificada entre web y desktop (teal `#0F766E`, navy `#22355F`, gold `#B68B2C`, crema `#F5F1E7`).
- App Flutter desktop modular: `theme`, `services`, `models`, `widgets`, `features/views` y un `ShellState` central.
- Supervision desktop reforzada: lifecycle observer, captura de PrintScreen / Win+Shift+S / Alt+Tab, lista negra ampliada (asistentes IA, control remoto, grabadores, conferencias) y escaneo de procesos.
- Base de datos SQLite local mediante `node:sqlite`.
- Panel docente con `Mis examenes`, `Crear` y `Revision`; el examen demo HCI2026 sigue disponible.
- Interfaz accesible: ARIA, navegacion por teclado, mensajes no dependientes del color, regiones vivas, lectura por voz.
- Documentacion tecnica con diagrama UML, justificacion ISO 9241, informe UX y evaluacion heuristica en `docs/`.

## Estructura principal

```text
frontend/src       Vista React accesible
frontend/dist      Build web generado por Vite
frontend/extension Extension Chrome/Edge/Brave para URLs, pestanas y busquedas
backend/src        API Express, controladores MVC, modelo SQLite y base de datos
sistema-examen-mvc-accesible-app-desktop
                  App Flutter desktop con flujo completo y agente local
docs               Documentacion tecnica e informe UX
```

La raiz no tiene paquetes Node. Las dependencias viven dentro de cada parte:

- `frontend/package.json`: React, Vite y librerias visuales.
- `backend/package.json`: Express y servidor API.
- `sistema-examen-mvc-accesible-app-desktop/pubspec.yaml`: app Flutter desktop.

## Alcance de supervision

La web no puede ver otras pestanas ni aplicaciones externas por si sola. La carpeta `extension` agrega una segunda capa para Chrome/Edge/Brave: registra pestanas, URLs y busquedas del navegador donde esta instalada. Para detectar aplicaciones externas como Telegram Desktop o WhatsApp Desktop se requiere un agente de escritorio institucional.

## Extension anti-copia

Para probarla:

1. Abre `chrome://extensions` o `edge://extensions`.
2. Activa `Modo desarrollador`.
3. Usa `Cargar descomprimida`.
4. Selecciona la carpeta `frontend/extension` del proyecto.
5. Abre el examen en `http://localhost:3000`.

Cuando el estudiante inicia el examen, la interfaz muestra si la extension esta conectada. Los eventos aparecen en la revision docente.

## App desktop / agente local

La carpeta `sistema-examen-mvc-accesible-app-desktop` contiene una app Flutter de escritorio con el flujo completo del sistema. La supervision se activa automaticamente al iniciar un intento e integra:

- Sondeo de la ventana activa cada 2 s (proceso, titulo).
- Lista negra ampliada: asistentes IA, mensajeria con bots, control remoto, grabadores de pantalla, conferencias.
- Escaneo de procesos cada 8 s (detecta OBS, Bandicam, Camtasia, ShareX aunque no tengan foco).
- `WidgetsBindingObserver` para registrar `paused`, `hidden`, `inactive` (severidad grave / media / leve).
- `HardwareKeyboard` para detectar PrintScreen, Win+Shift+S, Alt+Tab y bloquear Ctrl+P.
- Token Bearer en todas las peticiones a la API.
- Envio de eventos a `/api/security-event` con `severity` y `source: 'desktop'`.

La URL del backend no se muestra al estudiante. Por defecto usa `http://localhost:3000`; para despliegue puede cambiarse al compilar:

```bash
flutter build windows --dart-define=EXAM_API_URL=https://tu-servidor.edu
```

Para revisarla sin dejar servicios activos:

```bash
cd sistema-examen-mvc-accesible-app-desktop
flutter analyze
```

## Flujo de uso

1. El docente entra en la pestana `Docente`.
2. Crea una cuenta docente o ingresa con una cuenta existente.
3. En `Mis examenes`, revisa los examenes que pertenecen a su cuenta.
4. En `Crear`, define examen, tipos de pregunta y codigo.
5. En `Revision`, consulta estudiantes, notas y penalizaciones por codigo.
6. El estudiante entra en la pestana `Estudiante`.
7. Escribe nombre, correo institucional y codigo.
8. El sistema abre el examen correspondiente a ese codigo.

El proyecto incluye un examen demo con codigo:

```text
HCI2026
```

Cuenta docente demo (configurable via `DEMO_TEACHER_EMAIL` / `DEMO_TEACHER_PASSWORD`):

```text
Correo: demo@institucion.edu
Contrasena: demo1234
```

Para desactivar la creacion automatica de la cuenta demo en despliegue real:

```bash
DISABLE_SEED=1 npm start
```

Para esta practica no se solicita contrasena al estudiante. En produccion, la identidad institucional debe validarse contra un proveedor real de autenticacion.

## Base de datos

Por compatibilidad con OneDrive en Windows, la base SQLite se guarda por defecto en:

```text
%LOCALAPPDATA%\sistema-examen-mvc-accesible\exam.sqlite
```

Si deseas usar otra ruta:

```bash
$env:DB_PATH="C:\ruta\exam.sqlite"; npm start
```

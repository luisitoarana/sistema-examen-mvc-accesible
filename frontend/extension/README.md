# Extension Supervisor de Examen

Extension Manifest V3 para Chrome, Edge y Brave. Su objetivo es complementar la web del examen registrando eventos que la pagina sola no puede ver:

- Pestanas nuevas.
- Cambio a otra pestana.
- URL visitada.
- Busquedas en Google, Bing, DuckDuckGo o Yahoo.
- Sitios de riesgo como ChatGPT, Copilot, Gemini, Claude, WhatsApp Web, Telegram, YouTube, etc.

## Instalacion local para pruebas

1. Abrir Chrome o Edge.
2. Ir a `chrome://extensions` o `edge://extensions`.
3. Activar `Modo desarrollador`.
4. Elegir `Cargar descomprimida`.
5. Seleccionar la carpeta `extension` de este proyecto.
6. Abrir el examen en `http://localhost:3000`.

## Alcance real

La extension puede ver pestanas y URLs del navegador donde esta instalada. No puede ver aplicaciones externas como Telegram Desktop, WhatsApp Desktop o navegadores donde no este instalada. Para eso haria falta un agente de escritorio institucional.

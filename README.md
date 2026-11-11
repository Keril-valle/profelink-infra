# ProfeLink — infraestructura

Repositorio: https://github.com/Keril-valle/profelink-infra

Descarga las imágenes públicas de API/frontend y levanta ProfeLink con PowerShell y Docker Compose, **reutilizando la PostgreSQL existente**. No crea otra BD, no ejecuta migraciones y no borra datos.

## Repositorios e imágenes

| Componente | Código / publicación |
|---|---|
| Backend NestJS | https://github.com/Luz-Davila/Back-Proyecto2 |
| Frontend React | https://github.com/melissa-system/kahoot_front_grupo2 |
| Imagen API | https://hub.docker.com/r/keril777/profelink-api |
| Imagen web | https://hub.docker.com/r/keril777/profelink-web |

El código y los Dockerfiles de aplicación permanecen en sus repositorios. Aquí se versionan Compose, scripts, configuración de ejemplo y documentación/evidencias, sin duplicar código, secretos ni datos PostgreSQL.

## Inicio rápido — imágenes publicadas

Requisitos:

- Windows y PowerShell; Docker Desktop con motor Linux y `docker compose`.
- PostgreSQL **ya creada**, con esquema/datos de prueba, en el contenedor `profelink-pg-test-answers` (o nombre configurado). No usar producción.
- Configuración del proyecto Supabase de prueba usado al construir la imagen web y credenciales locales de esa BD. Pedirlas al equipo por un canal privado; no subirlas a Git.
- No requiere Node, npm ni clonar frontend/backend para ejecutar las imágenes publicadas.

```powershell
git clone https://github.com/Keril-valle/profelink-infra.git
cd profelink-infra
Copy-Item .env.example .env
# Editar .env con la configuracion real de prueba antes de continuar.
.\run.ps1
```

Completar en `.env` al menos:

| Variable | Configuración |
|---|---|
| `SUPABASE_URL` | URL del mismo proyecto de prueba usado por la imagen web |
| `PROFELINK_DOCKER_DATABASE_URL` | URL con usuario, contraseña y nombre de la BD existente; nunca producción |
| `PROFELINK_PG_CONTAINER` | Nombre real del contenedor PostgreSQL; predeterminado `profelink-pg-test-answers` |
| `PROFELINK_PG_NETWORK` | Red compartida externa; predeterminado `profelink-data` |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional para funcionalidades de Storage; solo backend, nunca en el frontend |

Las imágenes y demás valores de ejemplo ya están definidos. El script ajusta el host/puerto de la URL a `<contenedor>:5432`, conserva sus credenciales/nombre de BD y comprueba `SELECT 1`. No usa un `DATABASE_URL` remoto como alternativa.

Si la BD existe pero está detenida, reanudar **el mismo contenedor** antes del arranque:

```powershell
docker start profelink-pg-test-answers
```

Si no existe, detenerse y pedir al equipo la instancia de prueba preparada: este repo no crea una BD vacía ni importa datos automáticamente.

Si PowerShell bloquea el script, ejecutarlo para ese proceso sin modificar la política global:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\run.ps1
```

El script intenta abrir Docker Desktop si el motor no responde, descarga las imágenes, verifica su configuración y levanta solo API/web. Esa rama desde Docker apagado no se validó de extremo a extremo porque apagar el motor interrumpiría la BD; el arranque con motor disponible sí está probado.

## URLs y comprobación

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000 |
| Salud API/BD | http://localhost:3000/health |
| OpenAPI interactivo | http://localhost:3000/docs |
| OpenAPI JSON | http://localhost:3000/openapi.json |

```powershell
.\scripts\status.ps1
docker compose ps
docker compose logs --tail 50 api web
```

`/health` debe responder `{"status":"ok","database":"up"}`. Un HTTP 200 del frontend por sí solo no prueba el login: también se verificó autenticación real y consulta REST en las evidencias.

## Detención segura

```powershell
.\stop.ps1
```

Solo ejecuta `docker compose down --remove-orphans`, **sin `-v`**. PostgreSQL y su volumen no son servicios de este Compose; la red externa tampoco se elimina. No se cierra Docker Desktop. Comprobar después:

```powershell
docker inspect profelink-pg-test-answers --format "{{.State.Running}} {{.State.Health.Status}}"
```

La API conecta por DNS `profelink-pg-test-answers:5432` en `profelink-data`. El script crea solo esa red si falta y conecta a ella el contenedor existente, sin recrearlo ni quitar su conexión previa a `bridge`. Desde Windows se conserva el puerto publicado `127.0.0.1:15433` del entorno verificado.

## Versiones publicadas

Compose fija estas etiquetas para reproducibilidad; también existe `latest` en ambos repositorios:

| Imagen | Digest del índice |
|---|---|
| `keril777/profelink-api:local-20261111-a28e5dd` | `sha256:3c89816c53715068ea9bc80a2b617163992605b2057101deb0e04bb61c5d0745` |
| `keril777/profelink-web:local-20261111-38b014f` | `sha256:0fd3124051d9fcad5844fdff7756791c0edb5ad6130c755f1be2240d99f88eb2` |

Plataforma publicada: Linux/amd64. La API `v1` anterior se conservó. La web apunta a `http://localhost:3000`, no a Railway. **Cambiar variables `VITE_*` al ejecutar Nginx no cambia el JavaScript ya compilado**; otro entorno requiere otra compilación. El script rechaza imágenes cuyo destino API/Supabase no coincide con este entorno.

## Modo local con build (opcional)

Para trabajar desde código, usar clones hermanos:

```text
carpeta-del-equipo/
  profelink-infra/
  Back-Proyecto2/
  kahoot_front_grupo2/
```

`BACKEND_CONTEXT=../Back-Proyecto2` y `FRONTEND_CONTEXT=../kahoot_front_grupo2` son los valores de ejemplo. El script puede leer los `.env` existentes de esos clones, sin imprimirlos. Las variables del entorno y del `.env` de infraestructura tienen prioridad.

```powershell
.\run.ps1 -Mode Local
# Si las imagenes locales ya estan construidas:
.\run.ps1 -Mode Local -SkipBuild
docker compose -f compose.yaml -f compose.build.yaml config -q
```

Para compilar el frontend real se requieren `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` pública y `VITE_USE_MOCKS=false`. No usar service role ni claves de servidor como build args. Para desarrollo con Node/Vite sin Docker, consultar los README de las aplicaciones; este repo administra el modo Docker.

## Cómo demostrar el juego

1. Abrir el frontend y entrar con una cuenta de prueba del proyecto Supabase configurado; no se publican credenciales reales.
2. Como profesor, abrir **Mis cuestionarios**, elegir un cuestionario de prueba y pulsar **Jugar**.
3. Compartir el código de sala con otro usuario de prueba; este entra por **Unirse a una sala**.
4. Iniciar desde el anfitrión, responder, observar revisión/clasificación y consultar el historial.

Crear/jugar una sala escribe datos de juego: usar solo datos de prueba. Durante la preparación se consultaron las partidas existentes sin crear una nueva. Los 30 alumnos de las evidencias son datos de prueba, no humanos; las capturas `mock-*` son explícitamente simuladas. Las cuentas `profe@profelink.test` / `alumno@profelink.test`, contraseña `profelink123`, pertenecen **solo al modo mock**, no al modo publicado real.

### Cliente REST adicional

Está en el repositorio frontend, `clients/rest-viewer`, y no depende de React ni Socket.IO. Para esta demostración opcional sí se necesita ese clon y Node:

```powershell
cd ..\kahoot_front_grupo2
npx vite clients/rest-viewer --host 127.0.0.1 --port 5174
```

Abrir http://localhost:5174, completar API `http://localhost:3000`, Supabase público y cuenta de prueba. Consulta `GET /auth/me` y `GET /sessions/:code/state`; exige ser host o participante. CORS incluye los orígenes locales 5174. Evidencia real: [rest-viewer-real-room.png](docs/evidencias/rest-viewer-real-room.png).

## Documentación y evidencias

- [Especificación, reglas, modelo, API y eventos](docs/especificacion.md).
- [Diagramas editables Mermaid y PNG](docs/diagramas/).
- [OpenAPI exportado](docs/evidencias/openapi.json).
- [Comprobaciones y limitaciones](docs/comprobaciones.md).
- [Publicación y pruebas de imágenes](docs/evidencias/publicacion-keril777.md).
- [Aportes verificables por Git](docs/aportes.md).
- [Estado frente a la rúbrica](docs/rubrica.md) e [indicación original](indicacion.jpeg).
- [Documento final Word](docs/entrega-final.docx).

Resultados previos documentados: 261 unitarias backend, 10 integración, 92 sesiones y 152 unitarias frontend aprobadas. Socket.IO tuvo 86/87 en una corrida y pasó 5/5 al repetir la suite afectada; E2E frontend 6/10 por expectativas de UI desactualizadas. No se ocultaron fallos ni se repitió la suite completa al publicar imágenes. El smoke test publicado cubrió arranque, login y REST, no una partida nueva completa.

Los logs/capturas históricos se conservan diferenciados del estado final. No contienen `.env`, tokens, contraseñas reales ni la service role. El repo de referencia `investigacion-webhooks-infra-` se usó solo para lectura y no se modificó.

### Regenerar documentación (opcional)

Los PNG y DOCX ya están incluidos. Para regenerar el Word con Node 22, instalar la herramienta fuera del repositorio:

```powershell
$tools = Join-Path $env:TEMP 'opencode\docx-tools'
npm install --prefix $tools docx@9.5.1
node scripts/generate-docx.mjs
```

Cerrar Word antes de regenerar; si el archivo está bloqueado se crea una copia alternativa. Para renderizar Mermaid, `scripts/render-diagrams.mjs` requiere Playwright instalado en el clon frontend hermano y acceso al CDN de Mermaid; las fuentes `.mmd` no son capturas de ejecución.

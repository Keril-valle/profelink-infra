# Evidencias

Capturas y salidas de comandos reales obtenidas durante la preparación de la entrega.

## Frontend real

- `frontend-landing.png`: landing del frontend.
- `frontend-login.png`: formulario de login.
- `real-dashboard.png`: dashboard autenticado contra la API/BD reales.
- `real-quizzes.png`: cuestionario existente en la BD real.
- `real-history.png`: historial de dos partidas finalizadas reales.

## Cliente adicional

- `rest-viewer.png`: formulario del cliente REST.
- `rest-viewer-real-room.png`: consulta real de `DZB7QG` mediante `/sessions/:code/state`; las credenciales se ocultaron.

## Juego simulado (modo mock, no participantes humanos)

- `mock-host-quizzes.png`
- `mock-host-lobby.png`
- `mock-host-question.png`
- `mock-host-ranking.png`
- `mock-host-finished.png`
- `mock-participant-join.png`
- `mock-participant-question.png`
- `mock-participant-result.png`

## Backend

- `backend-health.png`: `/health` con `database:"up"`.
- `backend-swagger-top.png`: Swagger UI.
- `backend-swagger.png`: captura completa de Swagger.
- `openapi.json`: OpenAPI exportado.
- `api-health.txt`: respuesta de salud.
- `backend-unit-tests.txt`: Jest backend.
- `backend-integration-tests.txt`: integración PostgreSQL.
- `backend-sessions-tests.txt`: dominio, REST, carreras y seed.
- `backend-socket-tests.txt`: suite Socket.IO completa (incluye el fallo intermitente documentado).
- `backend-process-restart-tests.txt`: repetición aislada exitosa.
- `frontend-unit-tests.txt`: Vitest frontend.
- `frontend-e2e-tests.txt`: Playwright; incluye los fallos de deriva UI documentados.

## Infraestructura y BD

- `docker-ps.txt`
- `db-container.txt`
- `db-readonly.txt`
- `compose-config.txt`
- `compose-start.txt`
- `compose-stop.txt`
- `compose-ps.txt`
- `db-after-stop.txt`
- `status.txt`
- `docker-images.txt`
- `dockerhub.txt`
- `git-backend-baseline.txt`
- `git-frontend-baseline.txt`

No se incluyen tokens, contraseñas, JWT, claves de Supabase ni URLs con credenciales. Las imágenes del cliente REST ocultan los formularios de autenticación y no muestran la anon key.

## Revisión tras reinicio

- `compose-resume.txt`: arranque con el motor disponible y el contenedor PostgreSQL existente reanudado.
- `compose-build-resume.txt`: reconstrucción mediante el script con las variables locales reales.
- `real-login-resume.json`, `real-dashboard-resume.png`: login sin banner mock y respuestas reales HTTP 200 de la API.
- `compose-stop-final.txt`: último intento, fallido por HTTP 500 del motor Docker (no reemplazarlo por una afirmación de éxito).
- `revision-continuacion.md`: resultado y bloqueos actuales. Las evidencias anteriores conservan su carácter histórico.

## Configuración final por red Docker

- `revision-red-infra.md`: comparación y adaptación de la conexión de BD de la referencia.
- `db-docker-dns.json`: consulta SQL desde API a PostgreSQL por DNS y puerto interno 5432.
- `compose-network-start.txt`, `network-restart.txt`: arranque de API/web.
- `network-stop.txt`, `db-preserved-network-stop.txt`: parada que conserva ID y volumen de BD.
- `external-network-after-stop.txt`: la red externa también se conserva.
- `status-network.txt`: comprobación de la configuración final.
- `real-login-network.json`, `real-dashboard-network.png`: login real después de la adaptación de red.
- `docx-validation-network.json`, `git-validation-network.json`: validación del documento definitivo y Git.

## Imágenes Docker Hub aportadas por el equipo

- `imagenes-publicadas.md`: referencias, digests, inspección estática y bloqueo de la web compilada para Railway.
- `pull-api-inspection.txt`, `pull-web-inspection.txt`: descargas reales de los repositorios `camilitofge`.
- `published-preflight.txt`: detección de incompatibilidad antes de reemplazar los servicios locales.
- `local-after-published.txt`, `status-after-published.txt`: alternativa local funcional tras separar Compose base y build.
- `preflight-compatible-local.txt`: el mismo validador acepta la web local compilada correctamente; no rechaza todas las imágenes indiscriminadamente.
- `docx-validation-published.json`: DOCX actualizado, XML válido, referencias publicadas y bloqueo Railway incluidos.

## Publicación final autorizada en keril777

- `publicacion-keril777.md`: etiquetas, digests, autorización, pruebas y limitaciones.
- `release-build-api.txt`, `release-build-web.txt`: builds de los commits a28e5dd/38b014f.
- `release-safety.json`: revisión previa de secretos y URL compilada local.
- `dockerhub-push-api.txt`, `dockerhub-push-web.txt`: publicaciones reales, versionadas y latest.
- `published-start-keril777.txt`, `published-status-keril777.txt`: descarga y arranque finales.
- `published-login-keril777.json`, `published-dashboard-keril777.png`: login real y consulta REST con las imágenes públicas finales.
- `git-validation-release.json`: estado Git y comparación de archivos protegidos.
- `published-stop-keril777.txt`, `published-db-after-stop.txt`, `published-restart-keril777.txt`: parada/reinicio por imágenes que preservan PostgreSQL.
- `docx-validation-release.json`: documento final con imágenes y digests de keril777.

## Repositorio independiente profelink-infra

- `repositorio-infra.md`: alcance de la copia y validación desde este repo.
- `infra-repo-start.txt`, `infra-repo-status.txt`: arranque/estado desde esta carpeta.
- `infra-repo-no-source-start.txt`: modo Published con rutas de fuente inexistentes y configuración por entorno.
- `infra-repo-stop.txt`, `infra-repo-db-after-stop.txt`, `infra-repo-restart.txt`: parada/reinicio con BD preservada.
- `infra-repo-validation.json`: controles de documentación, secretos y alcance del índice Git antes de publicar.

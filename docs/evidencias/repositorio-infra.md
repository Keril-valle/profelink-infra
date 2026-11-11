# Validación del repositorio independiente

Remoto proporcionado por el usuario: https://github.com/Keril-valle/profelink-infra.git. Se verificó que estaba vacío y se clonó en `profelink-infra/`, sin mover ni convertir en submódulos los repositorios de aplicación.

## Incluido

- Compose publicado y override de build con contextos hermanos.
- `run.ps1`, `stop.ps1` y scripts internos de arranque/parada/estado.
- `.env.example`, `.gitignore`, `.gitattributes` y README operativo.
- Especificación, Mermaid/PNG, OpenAPI, evidencias auténticas, aportes, rúbrica, indicación original y DOCX.

No se copiaron repositorios de aplicación, `.env`, node_modules, volúmenes ni datos PostgreSQL. Los registros anteriores son históricos y conservan los resultados fallidos o intermitentes; no se reescribieron como éxitos del paquete nuevo.

## Comprobado desde esta carpeta

La sintaxis de los cinco scripts PowerShell operativos es válida, al igual que ambos modos de Compose. `run.ps1` descargó las imágenes versionadas y obtuvo API/frontend saludables con PostgreSQL existente. `scripts/status.ps1` leyó SELECT 1 y los mismos conteos: 1 quiz, 2 salas, 60 participaciones y 161 respuestas.

Evidencias propias: `infra-repo-start.txt`, `infra-repo-status.txt`. El modo Published puede recibir toda su configuración mediante `.env`/entorno sin clones; el modo Local sí necesita los clones y sus Dockerfiles. En este equipo hay clones hermanos, cuyos `.env` se usan como alternativa local de configuración, nunca se incluyen en Git.

Se repitió el arranque con `BACKEND_CONTEXT` y `FRONTEND_CONTEXT` apuntando a rutas inexistentes y configuración entregada por entorno: pasó sin leer clones (`infra-repo-no-source-start.txt`). También pasaron los accesos de parada y reinicio: `infra-repo-stop.txt`, `infra-repo-db-after-stop.txt`, `infra-repo-restart.txt`. PostgreSQL conservó el ID/volumen originales y siguió running/healthy; la red externa se mantuvo. No se creó una BD ni se modificaron datos funcionales.

La revisión final del índice Git y de secretos se realiza antes del commit/push a main; se registra por separado la comprobación remota después de publicar. No se modifica el repositorio de referencia.

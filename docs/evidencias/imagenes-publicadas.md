# Imágenes aportadas por el equipo — 2026-11-11

> Inspección histórica de las imágenes camilitofge. Tras la autorización posterior del usuario se publicaron variantes keril777 para localhost y pasó el arranque por descarga. El estado final está en `publicacion-keril777.md`; el bloqueo descrito aquí no afecta las referencias actuales.

Ambos repositorios públicos se consultaron en Docker Hub y se descargaron con `docker pull`; no se publicaron imágenes.

| Referencia | Etiqueta | Plataforma | Digest del índice |
|---|---|---|---|
| camilitofge/profelink-api | latest | linux/amd64 | sha256:db63ba50935094a4f230dcf4fc2ece5d94802c2c4738d8793228afbbc4c7f364 |
| camilitofge/profelink-web | latest | linux/amd64 | sha256:a516f0dbe3dcf7503b9062e2f627d259219d9f822e405c9d9dae363441f308eb |

Las etiquetas observadas se publicaron el 2026-11-10. Los logs están en `pull-api-inspection.txt` y `pull-web-inspection.txt`. `latest` es mutable; estos digests identifican lo revisado.

## Inspección sin ejecutar las aplicaciones

Se comprobó que ambas imágenes no declaran volúmenes; se crearon contenedores auxiliares sin iniciarlos, se copiaron los artefactos a `.tmp/` (ignorado por Git) y se eliminaron únicamente esos contenedores auxiliares. No recibieron credenciales ni accedieron a PostgreSQL, Supabase o Railway.

- API: comando de arranque `npm run start:prod` → `node dist/main`; configuración compilada con `synchronize: false`, `migrationsRun: false`. No se equipara esta imagen con la revisión fuente local actual ni se le atribuyen sus resultados de tests.
- Web: Nginx con SPA; healthcheck original a `localhost`, sobrescrito en Compose a `127.0.0.1`.
- Configuración Vite incorporada a la web: `VITE_API_URL` apunta a `https://back-proyecto2-production.up.railway.app`.

## Resultado operativo

`scripts/start.ps1 -Mode Published` descargó ambas imágenes, detectó la URL incompatible y terminó con exit 1 **antes de reemplazar los servicios locales**. Se comprobó que el ID de la API local permaneció igual. Esto es una protección exitosa, no una prueba de funcionamiento local del par publicado.

El modo `Local` sigue siendo funcional y fue comprobado después del cambio de Compose: API `/health` 200, `database:"up"`, frontend 200, 1 quiz/2 salas/60 participaciones/161 respuestas. Evidencias: `published-preflight.txt`, `local-after-published.txt`, `status-after-published.txt`.

## Pendiente del propietario de las imágenes

Publicar una etiqueta web compilada con `VITE_API_URL=http://localhost:3000`, `VITE_USE_MOCKS=false` y las variables públicas de Supabase del entorno de prueba, y facilitar esa etiqueta/digest. No basta con definir VITE_API_URL en el entorno de un contenedor Nginx ya construido. No se reescribió JavaScript ni se publicó ninguna imagen para ocultar esta incompatibilidad.

La presencia de ambas imágenes cumple la evidencia de publicación; la demostración enteramente por descarga contra la BD local sigue pendiente de esa variante. La rúbrica completa conserva además las limitaciones de juego real/E2E descritas en `docs/comprobaciones.md`.

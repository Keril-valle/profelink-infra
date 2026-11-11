# Estado frente a indicacion.jpeg

La imagen pide cuatro bloques. Se distingue tener artefactos de demostrar su funcionamiento:

| Bloque solicitado | Estado | Evidencia y pendiente |
|---|---|---|
| Frontend/backend, Dockerfiles, Compose, `.env.example`, script e imágenes Docker Hub | Cumplido, distribuido entre repos de aplicación e infraestructura | Código/Dockerfiles en los dos repos enlazados desde README; Compose, scripts y docs en `Keril-valle/profelink-infra`. Ambas imágenes keril777 públicas; arranque, login y REST verificados. No se duplica código de aplicación ni datos de BD aquí. |
| README con URLs, requisitos, configuración, inicio/parada, datos de prueba, demo y cliente adicional | Cumplido documentalmente | README de la raíz, comandos Local/Published, URLs y pruebas reales/mocks diferenciadas. Credenciales reales no se publican. |
| Especificación, alcance/reglas, arquitectura, clases, modelo, API y eventos | Cumplido documentalmente | `docs/especificacion.md`, diagramas Mermaid/PNG, OpenAPI exportado y DOCX. |
| Evidencias, clientes/participantes, resultados, limitaciones y aportes individuales | Cumplido con limitaciones explícitas | `docs/comprobaciones.md`, `docs/evidencias/`, `docs/aportes.md`. No hubo humanos; el juego en vivo capturado es mock. Se registran fallos E2E/intermitentes y el bloqueo de las imágenes públicas para entorno local. |

## Estado final del arranque por descarga

1. Las dos imágenes de `keril777` se publicaron y su acceso público se verificó. La web final usa API local, sin mocks.
2. `scripts/start.ps1` descarga esas imágenes por defecto. Arranque, login y consulta REST de la sala finalizada pasaron sobre la BD preexistente. No se afirmó éxito solamente por completar `docker pull`.
3. El usuario proporcionó el remoto `Keril-valle/profelink-infra` y pidió reunir/publicar los archivos en un repo independiente. La raíz original se conservó y la validación propia del nuevo paquete se registra en `docs/evidencias/repositorio-infra.md`. El push previo del Dockerfile frontend sigue identificado por `38b014f`.
4. No se repitió una partida nueva completa contra las imágenes públicas ni la suite entera; siguen las limitaciones registradas de E2E, fallo intermitente y demostración mock.

La incompatibilidad detectada en la imagen anterior de `camilitofge` se conserva como evidencia histórica; quedó resuelta para el entorno local con las nuevas publicaciones del usuario. Ver `docs/evidencias/publicacion-keril777.md`.

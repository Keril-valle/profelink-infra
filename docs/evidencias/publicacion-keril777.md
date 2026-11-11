# Publicación autorizada en Docker Hub — 2026-11-11

El usuario autorizó expresamente publicar en su propia cuenta. Se verificó el nombre de usuario `keril777` mediante el helper de credenciales de Docker, sin leer ni mostrar contraseñas o tokens. No se modificaron las imágenes de `camilitofge` ni la etiqueta histórica `keril777/profelink-api:v1`.

| Imagen | Etiquetas publicadas | Digest del índice |
|---|---|---|
| keril777/profelink-api | local-20261111-a28e5dd, latest | sha256:3c89816c53715068ea9bc80a2b617163992605b2057101deb0e04bb61c5d0745 |
| keril777/profelink-web | local-20261111-38b014f, latest | sha256:0fd3124051d9fcad5844fdff7756791c0edb5ad6130c755f1be2240d99f88eb2 |

Acceso público verificado mediante la API anónima de Docker Hub. Plataforma: linux/amd64. Las etiquetas versionadas corresponden a los commits fuente `a28e5dd` (backend) y `38b014f` (frontend). Logs: `release-build-api.txt`, `release-build-web.txt`, `dockerhub-push-api.txt`, `dockerhub-push-web.txt`.

## Seguridad previa

Se inspeccionaron los artefactos y la configuración/historial de las imágenes sin iniciarlas. Resultado: 260 archivos de texto revisados, cero coincidencias de los secretos de servidor comprobados, sin `.env` en los artefactos y sin service role en el frontend. La configuración pública de Supabase sí forma parte del build web, como requiere el cliente. No se publicaron volúmenes, datos PostgreSQL ni credenciales de login de prueba. Evidencia: `release-safety.json`.

## Ejecución real por descarga

Se actualizaron Compose y `.env.example` con las referencias versionadas; `Published` pasó a ser el modo predeterminado de `start.ps1`. Después se ejecutó el script: descargó ambas imágenes, pasó el preflight y recreó únicamente API/web. PostgreSQL conservó el mismo ID y volumen.

- API `/health`: HTTP 200, `database:"up"`.
- Frontend: HTTP 200; login real hasta `/app/curso`, sin banner mock.
- Dashboard: 1 cuestionario, 2 partidas, 60 participaciones.
- Consulta REST autenticada: HTTP 200, sala `FINISHED`, 30 participantes.
- Conteos BD: 1 quiz, 2 salas, 60 participaciones, 161 respuestas (sin cambios).

La primera comprobación automatizada agotó la espera de una cifra del dashboard. Una revisión visual mostró los datos correctos; la repetición sincronizada con la respuesta de historial pasó. El incidente se conserva en `published-login-keril777.json`, sin presentarlo como una corrida limpia a la primera.

Evidencias: `published-start-keril777.txt`, `published-status-keril777.txt`, `published-login-keril777.json`, `published-dashboard-keril777.png`.

La repetición final de parada/arranque también pasó con las imágenes públicas: `published-stop-keril777.txt`, `published-db-after-stop.txt` y `published-restart-keril777.txt`. PostgreSQL siguió running/healthy con el ID y volumen originales; la red externa se conservó. Git quedó limpio en ambos repositorios, con solo el Dockerfile frontend cambiado frente al commit inicial; la referencia permanece sin cambios propios (`git-validation-release.json`). El DOCX se regeneró y validó con 14 imágenes y XML correcto (`docx-validation-release.json`).

No se creó una partida nueva ni se repitió toda la suite durante esta publicación; los resultados previos y sus fallos se mantienen documentados. La configuración que apunta a Railway de las imágenes `camilitofge` queda como evidencia histórica, no como el estado actual de los servicios.

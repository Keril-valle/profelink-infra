# Aportes verificables por Git

La atribución se basa únicamente en el historial Git de los dos repositorios y en los README existentes. No se atribuyó trabajo no commiteado a ninguna persona.

## Backend — `Back-Proyecto2`

Autores observados con `git shortlog -sne --all`:

| Autor | Commits | Evidencia principal |
|---|---:|---|
| Luz-Davila / Luz Dávila Mayorga | 14 | Modelo relacional y migración inicial, JWT, perfiles, CRUD de quizzes, imágenes, seed, OpenAPI/telemetría y specs |
| Elian Fajardo Gutierrez | 4 | Mejoras de sesiones, rachas y duplicado de cuestionarios |
| Keril-valle | 4 | Juego en vivo, recuperación/telemetría, chatbot y Dockerfile base |
| Commits de merge | — | Integraciones de ramas `feat/*` |

Commits representativos verificables:

- `9287a69` — modelo relacional y migración inicial (Luz-Davila).
- `acb3f58` — guard JWT de Supabase Auth (Luz-Davila).
- `eafb6d0` — CRUD de quizzes y control de propiedad (Luz-Davila).
- `762975c` — imágenes, OpenAPI/telemetría (Luz-Davila).
- `180aed5` — chatbot y guardado por lote (Keril-valle).
- `199cd59` — Dockerfile inicial (Keril-valle).
- `25e35a5` — juego en vivo, recuperación y telemetría (Keril-valle).
- `4ce9c9e` — duplicado y bono por racha (Elian Fajardo Gutierrez).
- `a28e5dd` — optimización de respuestas y métricas HTTP seguras (Keril-valle, commit previo al trabajo de infraestructura/documentación; backend no modificado después).

## Frontend — `kahoot_front_grupo2`

| Autor | Commits | Evidencia principal |
|---|---:|---|
| Melissa Campos | 8 | Layout/UI, login Supabase, editor de quiz, sala del anfitrión, E2E, README y Dockerfile |
| Elian Fajardo Gutierrez | 6 | Animaciones/pet y mejoras visuales/funcionales |
| Keril-valle | 2 | Chatbot del profesor; Dockerfile local y validación de Supabase |

Commits representativos:

- `e6ac379` — inicialización Vite/React (Melissa Campos).
- `5de0902` — layout ProfeLink, componentes UI, cliente HTTP y login Supabase (Melissa Campos).
- `335585c` — panel de cuestionarios y editor V/F (Melissa Campos).
- `d78753e` — sala en vivo del anfitrión con Socket.IO (Melissa Campos).
- `7d6ab19` — E2E, README, OpenSpec y Dockerfile (Melissa Campos).
- `60aa56c` — chatbot del profesor (Keril-valle).
- `38b014f` — configuración del Dockerfile para API local, validación de Supabase público y healthcheck IPv4 (Keril-valle; commit/push a main expresamente autorizados durante esta conversación).
- `cd6c7ca` — animación/pet (Elian Fajardo Gutierrez).
- `7ee9859` — mensaje original `a` (Elian Fajardo Gutierrez); ese mensaje no permite atribuir por sí solo una funcionalidad concreta.

## Infraestructura y documentación de esta entrega

Los archivos de infraestructura se reunieron en el repositorio independiente https://github.com/Keril-valle/profelink-infra, a solicitud del usuario. No se movieron los repositorios de aplicación. Los registros históricos anteriores a esta creación indican correctamente que entonces la raíz original no estaba en Git. El Dockerfile frontend quedó registrado en 38b014f y el backend no tiene cambios de fuente. Las imágenes Docker Hub de keril777 se publicaron después de autorización expresa.

El `.gitignore` excluye clones, referencia, `.env` y temporales; se revisan los archivos antes del commit inicial. El historial propio de este repo permite verificar la autoría de la entrega de infraestructura sin atribuir a una persona trabajo funcional no demostrado. Véase `docs/repositorio-infra.md`.

## Limitación

No fue posible inferir aportes humanos adicionales fuera de los commits. Las cifras de aplicaciones se basan en sus historiales, no en el número de archivos copiados a este repositorio de infraestructura. No se atribuyen participantes humanos ni implementaciones funcionales nuevas a la preparación del paquete.

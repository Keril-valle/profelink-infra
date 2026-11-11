# Repositorio: profelink-infra

Remoto: https://github.com/Keril-valle/profelink-infra.git

Se clonó el repositorio vacío en una carpeta independiente `profelink-infra/`, sin inicializar Git sobre `ProyectoFinal` ni mover los repositorios de aplicación. El README de este repo es la guía operativa vigente; este documento conserva el contexto de preparación.

## Qué contiene

Un repositorio de infraestructura separado de los repositorios de aplicación, equivalente en propósito a `investigacion-webhooks-infra-`:

```text
profelink-infra/
  .gitignore
  .env.example
  compose.yaml
  compose.build.yaml
  scripts/
  README.md
  docs/
  Back-Proyecto2/          # clon local ignorado; repo propio
  kahoot_front_grupo2/     # clon local ignorado; repo propio
```

La carpeta `ProyectoFinal` original se conservó. Los clones de aplicaciones son hermanos de `profelink-infra`; no se duplicó su código ni se agregaron submódulos. Si se elige clonar aplicaciones dentro de infra, ajustar los contextos en el `.env` local. El `.gitignore` excluye también la referencia y cualquier clon anidado accidental.

El usuario proporcionó este remoto y autorizó preparar/publicar el repo. No se reutiliza el remoto de frontend/backend ni se reescribe su historial. Los registros anteriores que indican que la infraestructura no estaba en Git son evidencia histórica de antes de crear esta carpeta.

## Si los repositorios son hermanos

También puede usarse esta organización:

```text
carpeta-del-equipo/
  profelink-infra/
  Back-Proyecto2/
  kahoot_front_grupo2/
```

En el `.env` local de infraestructura:

```dotenv
BACKEND_CONTEXT=../Back-Proyecto2
FRONTEND_CONTEXT=../kahoot_front_grupo2
```

`compose.build.yaml` usa esas rutas para los contextos de build, y `start.ps1` busca allí los `.env` de las aplicaciones si existen. El modo `Published` no necesita esos clones: su configuración debe estar en el `.env` de infraestructura. Los scripts auxiliares de captura/desarrollo se elaboraron para la estructura interna original; la operación Docker usa `start.ps1`, `stop.ps1` y `status.ps1`.

## Base de datos: comparación con la referencia

| Aspecto | investigacion-webhooks-infra- | ProfeLink |
|---|---|---|
| PostgreSQL | Compose crea `webhooks-db` | Reutiliza `profelink-pg-test-answers` |
| Host de BD visto por el backend | `db:5432` | `profelink-pg-test-answers:5432` |
| Red | Predeterminada del Compose | Red externa `profelink-data`, compartida con la BD existente |
| Volumen | Define `db-data` | No define ni crea volúmenes de BD |
| Parada | Administra los servicios declarados | Administra solo API/web; conserva PostgreSQL y red externa |

El script verifica primero que la BD ya exista y esté corriendo. Si falta la red, crea **solo una red bridge**, y conecta la BD existente a ella sin eliminar su conexión previa. No ejecuta SQL de inicialización ni migraciones.

El ID `2495738d2ce911e3fa93c0ac4bc46b38d194695855c761f10c445f10aa133af5` es BuildKit (constructor de imágenes). La PostgreSQL verificada tiene ID `b19462f3430d...`, conserva su volumen original y usa el puerto interno 5432; desde Windows sigue disponible en `127.0.0.1:15433`.

## Ejecución actual

1. Completar los `.env` locales (nunca se suben al repo).
2. Si la BD está detenida, ejecutar `docker start profelink-pg-test-answers`. No crear otra.
3. Ejecutar `scripts/start.ps1`. Descarga las imágenes versionadas de `keril777`, prepara la red externa y levanta API/web. Como alternativa, `-Mode Local` combina ambos Compose y construye desde los clones; `-Mode Local -SkipBuild` reutiliza imágenes locales.
4. Abrir frontend `http://localhost:8080` y API `http://localhost:3000/health`.
5. Comprobar con `scripts/status.ps1`.
6. Detener API/web con `scripts/stop.ps1`. No detiene Docker Desktop ni PostgreSQL.

## Modo de descarga como la referencia

`scripts/start.ps1` (o `-Mode Published` explícito) usa el Compose base sin build: descarga `keril777/profelink-api:local-20261111-a28e5dd` y `keril777/profelink-web:local-20261111-38b014f`. Se publicaron con autorización expresa del usuario, se descargaron y pasaron arranque, login real y consulta REST sobre la BD existente. Ambas disponen también de `latest` y se conservó la API `v1` anterior.

Antes de `up`, el script inspecciona los estáticos de la web en un contenedor auxiliar que nunca se inicia y que no recibe credenciales ni red; luego lo elimina. La web final apunta a `http://localhost:3000`, no a Railway, y usa `VITE_USE_MOCKS=false`. Las variables VITE de runtime no corrigen una imagen ya compilada: para otro entorno se necesita otra compilación. La incompatibilidad anterior de la imagen `camilitofge` queda como historial.

En este modo, completar en el `.env` de infraestructura al menos `SUPABASE_URL`, `PROFELINK_DOCKER_DATABASE_URL` con las credenciales de la BD existente, y las referencias de imágenes. No se necesita Node para compilar ni código fuente de aplicaciones. La BD local ya debe tener el esquema/datos: este repo no los crea ni ejecuta migraciones.

No se reescribió JavaScript ni lógica funcional. El Dockerfile backend no cambió; el frontend incluye API local predeterminada, validación de variables públicas y healthcheck IPv4 (commit `38b014f`, ya publicado en `main`). Las publicaciones Docker Hub fueron posteriores y expresamente autorizadas. Los archivos de infraestructura de esta raíz aún no están en un repo remoto; solo la imagen pública no sustituye compartir también estos scripts/Compose.

No subir `.env`, tokens, contraseñas, service role, datos PostgreSQL ni directorios de los repositorios de aplicación. Antes de publicar el repo, revisar las capturas y los documentos de `docs/`.

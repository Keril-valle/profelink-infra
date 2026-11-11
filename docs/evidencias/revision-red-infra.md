# Conexión Docker como la referencia — 2026-11-11

## Inspección

- El ID facilitado `2495738d2ce9...` es `buildx_buildkit_desktop-linux`, imagen `moby/buildkit:buildx-stable-1`. No es PostgreSQL.
- La PostgreSQL correcta es `profelink-pg-test-answers`, ID `b19462f3430d...`. Estaba detenida y se reanudó con `docker start`, sin recrearla.
- En la referencia, `service-a` usa `db:5432` en una red Compose. No se modificó la referencia.

## Adaptación implementada

- Compose solo declara `api` y `web`.
- El script prepara la red bridge externa `profelink-data` y conecta el contenedor PostgreSQL existente a ella; mantiene su conexión anterior a `bridge`.
- La API conecta por nombre `profelink-pg-test-answers:5432`; desde Windows sigue usándose el puerto publicado `127.0.0.1:15433`.
- No se creó otra BD, ningún volumen ni un contenedor cliente PostgreSQL adicional. No se ejecutaron migraciones ni SQL de escritura.
- El contenedor `api` se recreó para aplicar la red; la PostgreSQL conservó ID y volumen.

## Resultados reales

La consulta desde `node`/`pg` dentro de la API resolvió DNS y leyó:

```text
host=profelink-pg-test-answers
port=5432
dnsResolved=true
database=profelink_test
quizzes=1
sessions=2
participants=60
answers=161
results=60
```

`stop.ps1` pasó y dejó PostgreSQL running/healthy con el volumen original `390af8bea614bcbb132c270b7a17e69d8d614573e3a1f251d3be628f98207665`. La red externa también se conservó. `start.ps1 -SkipBuild` volvió a iniciar API/web; API `/health` respondió 200 con `database:"up"`, frontend respondió 200.

Evidencias: `compose-network-start.txt`, `db-docker-dns.json`, `network-stop.txt`, `db-preserved-network-stop.txt`, `external-network-after-stop.txt`, `network-restart.txt`, `status-network.txt`.

Comprobación final en navegador: login real a `/app/curso`, sin banner mock y tres respuestas HTTP 200 de la API (`real-login-network.json`, `real-dashboard-network.png`). API y web quedaron healthy, y PostgreSQL running/healthy. El bloqueo de Word se liberó y se regeneró el documento definitivo `docs/entrega-final.docx`; la copia alternativa previa se conserva como histórica.

## Repositorio

Se prepararon `.gitignore`, rutas configurables de contextos y `docs/repositorio-infra.md` para un repositorio independiente `profelink-infra`. No se inicializó Git en la raíz, no se creó repositorio remoto y no se publicó nada. Frontend/backend siguen siendo repositorios separados; imágenes actuales publicadas siguen pendientes de autorización.

# Revisión después del reinicio — 2026-11-11

> Registro histórico de esa revisión. Actualización posterior: la conexión final se adaptó a DNS Docker en red externa y pasaron consulta SQL, parada y reinicio. Véanse `revision-red-infra.md`, `db-docker-dns.json` y `status-network.txt`. El error HTTP 500 descrito aquí no se reproduce en esa comprobación posterior.

## Comprobado en esta continuación

- Docker respondió inicialmente con versión de servidor `29.7.2`.
- PostgreSQL estaba detenida (`Exited (255)`), no eliminada. Se reanudó mediante `docker start profelink-pg-test-answers`, sin `docker run`, nuevas bases ni nuevos volúmenes.
- Contenedor identificado: `b19462f3430de160edec670608bf01b6cdfe287533f608700e2a041292ec3f26`.
- Volumen original: `390af8bea614bcbb132c270b7a17e69d8d614573e3a1f251d3be628f98207665`, montado en `/var/lib/postgresql/data`.
- `start.ps1 -SkipBuild` completó arranque y `/health`; luego se detectó banner demo en la imagen web existente.
- Se reconstruyeron las imágenes mediante `start.ps1` con los `.env` existentes, sin imprimir secretos. La reconstrucción y el arranque terminaron correctamente (`compose-build-resume.txt`).
- Login real verificado por navegador: `http://127.0.0.1:8080/app/curso`, sin banner demo, tres respuestas HTTP 200 de la API. Registro con timestamp UTC: `real-login-resume.json`; captura: `real-dashboard-resume.png`.
- El script valida ahora las variables públicas de Supabase antes del build real; las variables `VITE_*` requieren reconstrucción, no solo reinicio.

## Lo que no quedó validado al cierre

- La repetición de `stop.ps1` falló con HTTP 500 desde el motor Docker, en la ruta `/containers/json`. La consulta de estado también falló. No se reinició Docker ni se detuvo PostgreSQL de forma intencionada para investigar. No se afirma disponibilidad actual del motor.
- La rama que abre Docker Desktop desde apagado quedó interrumpida por el reinicio anterior. No se volvió a apagar el motor para probarla, porque interrumpiría la BD.
- Word (`WINWORD`) tenía abierto `docs/entrega-final.docx`; la escritura devolvió `EBUSY`. No se cerró Word ni se sobrescribieron cambios abiertos del usuario. El generador escribe `docs/entrega-final-actualizada.docx` como alternativa.
- Las pruebas automatizadas y las consultas de conteos guardadas antes son evidencia histórica; no se ejecutaron otra vez suites que escriben datos.

## Acción manual necesaria

1. Guardar y cerrar el documento abierto en Word.
2. Revisar Docker Desktop hasta que `docker info` responda; no restablecer Docker, borrar contenedores ni limpiar volúmenes.
3. Si la BD está detenida, reanudar solo el contenedor original con `docker start profelink-pg-test-answers`.
4. Ejecutar `scripts/start.ps1 -SkipBuild` y `scripts/status.ps1`. Repetir la prueba de parada segura cuando el motor esté estable.
5. Ejecutar `node scripts/generate-docx.mjs` para actualizar el nombre definitivo después de cerrar Word.

Las publicaciones Docker Hub y la partida con participantes reales continúan pendientes; no se crearon commits ni se hizo push.

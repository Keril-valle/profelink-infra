# Comprobación de solo lectura: servicios propios y BD PostgreSQL existente.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $env:PROFELINK_PG_CONTAINER -and (Test-Path '.env')) {
  foreach ($line in Get-Content '.env' -Encoding UTF8) {
    if ($line -match '^\s*PROFELINK_PG_CONTAINER\s*=\s*(.*)$') {
      $env:PROFELINK_PG_CONTAINER = $matches[1].Trim().Trim([char]34).Trim([char]39)
    }
  }
}

$container = if ($env:PROFELINK_PG_CONTAINER) { $env:PROFELINK_PG_CONTAINER } else { "profelink-pg-test-answers" }
Write-Host "== Contenedor PostgreSQL existente =="
docker inspect --format '{{.Name}} | running={{.State.Running}} | health={{.State.Health.Status}}' $container
if ($LASTEXITCODE -ne 0) { throw "No se encontró el contenedor $container." }
docker inspect --format 'Redes: {{range $name, $config := .NetworkSettings.Networks}}{{$name}} {{end}}' $container

Write-Host ""
Write-Host "== Consulta de solo lectura (SELECT 1) =="
$metadata = docker inspect --format '{{json .Config.Env}}' $container | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw "No se pudo consultar la configuracion del contenedor." }
$userSetting = $metadata | Where-Object { $_.StartsWith('POSTGRES_USER=') } | Select-Object -First 1
$databaseSetting = $metadata | Where-Object { $_.StartsWith('POSTGRES_DB=') } | Select-Object -First 1
$databaseUser = if ($userSetting) { ($userSetting -split '=', 2)[1] } else { 'postgres' }
$databaseName = if ($databaseSetting) { ($databaseSetting -split '=', 2)[1] } else { $databaseUser }
# No imprimir el array metadata: puede contener la contrasena del contenedor.
docker exec $container psql -U $databaseUser -d $databaseName -Atc "SELECT 1;"
if ($LASTEXITCODE -ne 0) { throw "La BD existente no respondió." }

Write-Host ""
Write-Host "== Conteo de datos existente (solo lectura) =="
docker exec $container psql -U $databaseUser -d $databaseName -Atc "SELECT 'quizzes=' || count(*) FROM quizzes; SELECT 'sessions=' || count(*) FROM game_sessions; SELECT 'participants=' || count(*) FROM session_participants; SELECT 'answers=' || count(*) FROM answers;"
if ($LASTEXITCODE -ne 0) { throw "No se pudieron leer los conteos de la BD existente." }

Write-Host ""
Write-Host "== Servicios propios =="
docker compose ps
Write-Host ""
try {
  $api = Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 3
  Write-Host "API /health: HTTP $($api.StatusCode) $($api.Content)"
} catch { Write-Host "API: no responde (puede estar detenida)." }
try {
  $web = Invoke-WebRequest -Uri "http://127.0.0.1:8080/" -UseBasicParsing -TimeoutSec 3
  Write-Host "Frontend: HTTP $($web.StatusCode)"
} catch { Write-Host "Frontend: no responde (puede estar detenido)." }

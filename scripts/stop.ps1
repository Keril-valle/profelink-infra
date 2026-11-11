# Detiene únicamente API y frontend del proyecto.
# NO detiene, elimina ni recrea el contenedor PostgreSQL existente.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Docker Compose tambien lee este archivo; usar el mismo nombre en el mensaje.
if (-not $env:PROFELINK_PG_CONTAINER -and (Test-Path '.env')) {
  foreach ($line in Get-Content '.env' -Encoding UTF8) {
    if ($line -match '^\s*PROFELINK_PG_CONTAINER\s*=\s*(.*)$') {
      $env:PROFELINK_PG_CONTAINER = $matches[1].Trim().Trim([char]34).Trim([char]39)
    }
  }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker no está disponible."
}

Write-Host "Deteniendo servicios propios (API y frontend)..."
docker compose down --remove-orphans
if ($LASTEXITCODE -ne 0) { throw "docker compose down falló." }

$container = if ($env:PROFELINK_PG_CONTAINER) { $env:PROFELINK_PG_CONTAINER } else { "profelink-pg-test-answers" }
Write-Host "Listo. La PostgreSQL '$container' no fue detenida ni modificada."

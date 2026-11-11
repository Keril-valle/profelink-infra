# Levanta API y frontend en Docker, reutilizando la PostgreSQL que YA existe.
# No crea una base de datos, no publica imágenes y no detiene el contenedor de PostgreSQL.
param(
  [ValidateSet('Local', 'Published')]
  [string]$Mode = 'Published',
  [switch]$SkipBuild
)

if ($Mode -eq 'Published' -and $SkipBuild) {
  throw "-SkipBuild solo aplica al modo Local; Published descarga las imágenes sin compilar."
}

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Import-DotEnv([string]$path) {
  if (-not (Test-Path $path)) { return }
  foreach ($line in Get-Content $path -Encoding UTF8) {
    if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') { continue }
    $name = $matches[1]
    $value = $matches[2].Trim()
    if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") { $value = $matches[1] }
    if (-not [Environment]::GetEnvironmentVariable($name)) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}

function Require-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Falta '$name'. Instala Docker Desktop y verifica que 'docker' esté en PATH."
  }
}

function Test-DockerEngine {
  $previous = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  try {
    docker info 1>$null 2>$null
    return $LASTEXITCODE -eq 0
  } finally {
    $ErrorActionPreference = $previous
  }
}

function Ensure-DockerEngine {
  if (Test-DockerEngine) { return }
  $candidates = @(
    (Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\Docker Desktop.exe'),
    (Join-Path $env:LOCALAPPDATA 'Docker\Docker Desktop.exe')
  ) | Where-Object { Test-Path $_ }
  $desktop = $candidates | Select-Object -First 1
  if (-not $desktop) {
    throw "Docker no está activo y no se encontró Docker Desktop. Inicia Docker Desktop manualmente."
  }
  Write-Host "Docker no está activo; abriendo Docker Desktop..."
  Start-Process -FilePath $desktop | Out-Null
  for ($i = 1; $i -le 60; $i++) {
    Start-Sleep -Seconds 3
    if (Test-DockerEngine) {
      Write-Host "Docker está listo."
      return
    }
  }
  throw "Docker Desktop no quedó listo después de 180 segundos. Inícialo manualmente y reintenta."
}

function Test-PublishedFrontend([string]$image) {
  # Leer estáticos sin arrancar la imagen ni darle credenciales/red/BD.
  $volumes = docker image inspect --format '{{json .Config.Volumes}}' $image
  if ($LASTEXITCODE -ne 0 -or ($volumes -join '').Trim() -ne 'null') {
    throw "No se puede inspeccionar la imagen web sin posibles volúmenes implícitos. Usa -Mode Local."
  }
  $name = 'profelink-image-check-' + [Guid]::NewGuid().ToString('N')
  $destination = Join-Path $root ('.tmp/published-validation/' + $name)
  New-Item -ItemType Directory -Force -Path $destination | Out-Null
  docker create --name $name --entrypoint /bin/true $image | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo preparar la inspección de la imagen web." }
  try {
    docker cp "${name}:/usr/share/nginx/html/assets" $destination
    if ($LASTEXITCODE -ne 0) { throw "No se pudieron inspeccionar los assets de la imagen web." }
    $scripts = @(Get-ChildItem (Join-Path $destination 'assets') -Filter '*.js' -File)
    $bundle = ($scripts | ForEach-Object { Get-Content $_.FullName -Raw -Encoding UTF8 }) -join "`n"
    $match = [regex]::Match($bundle, 'VITE_API_URL\s*:\s*[\x22\x27\x60](?<value>[^\x22\x27\x60]*)[\x22\x27\x60]')
    if (-not $match.Success) {
      throw "No se pudo verificar la URL API incorporada en la imagen web. No se inicia a ciegas; usa -Mode Local."
    }
    $apiUrl = $match.Groups['value'].Value.TrimEnd('/')
    if ($apiUrl -ne 'http://localhost:3000') {
      throw "La imagen web no está compilada para la API local http://localhost:3000. Cambiar VITE_API_URL en runtime no corrige el bundle. Se necesita una imagen compatible o ejecutar -Mode Local."
    }
    $supabase = [regex]::Match($bundle, 'VITE_SUPABASE_URL\s*:\s*[\x22\x27\x60](?<value>[^\x22\x27\x60]*)[\x22\x27\x60]')
    if (-not $supabase.Success -or $supabase.Groups['value'].Value.TrimEnd('/') -ne $env:SUPABASE_URL.TrimEnd('/')) {
      throw "El proyecto Supabase de la imagen web no coincide con la API local o no se pudo verificar. Usa -Mode Local."
    }
    $mocks = [regex]::Match($bundle, 'VITE_USE_MOCKS\s*:\s*[\x22\x27\x60](?<value>[^\x22\x27\x60]*)[\x22\x27\x60]')
    if (-not $mocks.Success -or $mocks.Groups['value'].Value -ne 'false') {
      throw "No se verificó VITE_USE_MOCKS=false en la imagen publicada. Usa -Mode Local."
    }
  } finally {
    # Solo el contenedor auxiliar creado aquí, nunca PostgreSQL ni volúmenes.
    docker rm $name | Out-Null
  }
}

Require-Command docker
Ensure-DockerEngine
docker compose version | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Docker Compose v2 no está disponible ('docker compose')."
}

Import-DotEnv ".env"
$backendContext = if ($env:BACKEND_CONTEXT) { $env:BACKEND_CONTEXT } else { "../Back-Proyecto2" }
$frontendContext = if ($env:FRONTEND_CONTEXT) { $env:FRONTEND_CONTEXT } else { "../kahoot_front_grupo2" }
Import-DotEnv (Join-Path $backendContext ".env")
Import-DotEnv (Join-Path $frontendContext ".env")

# Evitar que una imagen destinada a la API real caiga silenciosamente en mocks.
if ($Mode -eq 'Local' -and $env:VITE_USE_MOCKS -ne 'true' -and
    (-not $env:VITE_SUPABASE_URL -or -not $env:VITE_SUPABASE_ANON_KEY)) {
  throw "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Completa el .env del frontend antes de construir el modo real."
}
if (-not $env:SUPABASE_URL) {
  throw "Falta SUPABASE_URL para iniciar la API. Completa el .env del backend."
}

$container = if ($env:PROFELINK_PG_CONTAINER) { $env:PROFELINK_PG_CONTAINER } else { "profelink-pg-test-answers" }
$inspect = docker inspect $container 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "No existe el contenedor PostgreSQL '$container'. La entrega no crea otra BD; inicia el contenedor existente y vuelve a ejecutar."
}
$running = (docker inspect --format '{{.State.Running}}' $container).Trim()
if ($running -ne "true") {
  throw "PostgreSQL '$container' está detenida. Ejecuta 'docker start $container' y reintenta. Este script no la recrea ni la detiene."
}
if (-not $env:PROFELINK_DOCKER_DATABASE_URL -and -not $env:TEST_DATABASE_URL) {
  throw "Completa PROFELINK_DOCKER_DATABASE_URL en el .env de infraestructura o TEST_DATABASE_URL en el .env del backend. No se usa DATABASE_URL remoto."
}
try {
  $sourceUrl = if ($env:PROFELINK_DOCKER_DATABASE_URL) { $env:PROFELINK_DOCKER_DATABASE_URL } else { $env:TEST_DATABASE_URL }
  $databaseUri = [Uri]$sourceUrl
  if ($databaseUri.Scheme -notin @('postgres', 'postgresql') -or
      -not $databaseUri.Host -or -not $databaseUri.UserInfo -or $databaseUri.AbsolutePath -eq '/') {
    throw "URL inválida"
  }
  $databaseName = [Uri]::UnescapeDataString($databaseUri.AbsolutePath.TrimStart('/'))
  $databaseUser = [Uri]::UnescapeDataString(($databaseUri.UserInfo -split ':', 2)[0])
  # Conservar usuario, contraseña y base; cambiar solo transporte de host a Docker DNS.
  $builder = [UriBuilder]$databaseUri
  $builder.Host = $container
  $builder.Port = 5432
  $env:PROFELINK_DOCKER_DATABASE_URL = $builder.Uri.AbsoluteUri
} catch {
  throw "URL PostgreSQL inválida. Revisa las variables de conexión (no se imprime su contenido)."
}

$probe = docker exec $container psql -U $databaseUser -d $databaseName -Atc "SELECT 1;"
if ($LASTEXITCODE -ne 0 -or ($probe -join '').Trim() -ne '1') {
  throw "La BD existente no respondió a SELECT 1. No se inicia ni se crea otra instancia."
}

$network = if ($env:PROFELINK_PG_NETWORK) { $env:PROFELINK_PG_NETWORK } else { "profelink-data" }
$networks = @(docker network ls --format '{{.Name}}')
if ($LASTEXITCODE -ne 0) { throw "No se pudieron consultar las redes Docker." }
if ($networks -notcontains $network) {
  Write-Host "Creando solo la red compartida '$network' (no crea bases ni volúmenes)..."
  docker network create --driver bridge $network | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "No se pudo preparar la red de PostgreSQL." }
}
$networkDriver = (docker network inspect --format '{{.Driver}}' $network).Trim()
if ($LASTEXITCODE -ne 0 -or $networkDriver -ne 'bridge') {
  throw "La red compartida debe existir y utilizar el driver bridge."
}
$databaseContainer = @((($inspect -join "`n") | ConvertFrom-Json))[0]
$attachedNetworks = @($databaseContainer.NetworkSettings.Networks.PSObject.Properties.Name)
if ($attachedNetworks -notcontains $network) {
  docker network connect $network $container
  if ($LASTEXITCODE -ne 0) { throw "No se pudo conectar PostgreSQL a la red compartida." }
}
$env:CORS_ORIGIN = "http://localhost:5173,http://localhost:5174,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:8080"
if (-not $env:VITE_API_URL) { $env:VITE_API_URL = "http://localhost:3000" }

Write-Host "PostgreSQL existente: $container (se reutiliza; no se crea otra instancia)."
Write-Host "Conexión Docker: ${container}:5432; red externa: $network. SELECT 1 correcto."
$composeArguments = @('compose', '-f', (Join-Path $root 'compose.yaml'))
if ($Mode -eq 'Local') {
  $composeArguments += @('-f', (Join-Path $root 'compose.build.yaml'))
}
Write-Host "Validando configuración de Compose..."
& docker @composeArguments config -q
if ($LASTEXITCODE -ne 0) { throw "docker compose config falló." }

if ($Mode -eq 'Published') {
  Write-Host "Descargando imágenes publicadas (como en el proyecto de referencia)..."
  & docker @composeArguments pull
  if ($LASTEXITCODE -ne 0) { throw "Falló la descarga de imágenes. Revisa Docker Hub y las etiquetas." }
  $webImage = if ($env:PROFELINK_WEB_IMAGE) { $env:PROFELINK_WEB_IMAGE } else { 'keril777/profelink-web:local-20261111-38b014f' }
  Test-PublishedFrontend $webImage
} elseif (-not $SkipBuild) {
  Write-Host "Construyendo imágenes locales de API y frontend..."
  & docker @composeArguments build
  if ($LASTEXITCODE -ne 0) { throw "Falló docker compose build. Revisa los Dockerfiles y las variables de build." }
}

Write-Host "Iniciando servicios propios (sin tocar PostgreSQL)..."
& docker @composeArguments up -d --no-build
if ($LASTEXITCODE -ne 0) { throw "Falló docker compose up. Ejecuta 'docker compose logs api web' para revisar." }

$readyApi = $false
$readyWeb = $false
for ($i = 1; $i -le 90; $i++) {
  if (-not $readyApi) {
    try {
      $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 3
      $readyApi = $r.StatusCode -eq 200
    } catch { }
  }
  if (-not $readyWeb) {
    try {
      $r = Invoke-WebRequest -Uri "http://127.0.0.1:8080/" -UseBasicParsing -TimeoutSec 3
      $readyWeb = $r.StatusCode -eq 200
    } catch { }
  }
  if ($readyApi -and $readyWeb) { break }
  Start-Sleep -Seconds 2
}

if (-not $readyApi -or -not $readyWeb) {
  Write-Host "Los servicios no respondieron a tiempo." -ForegroundColor Yellow
  & docker @composeArguments ps
  throw "Revisa 'docker compose logs api web'. La BD existente no fue detenida."
}

Write-Host ""
Write-Host "ProfeLink listo." -ForegroundColor Green
Write-Host "  Frontend:       http://localhost:8080"
Write-Host "  API:            http://localhost:3000"
Write-Host "  Salud API:      http://localhost:3000/health"
Write-Host "  OpenAPI/Swagger: http://localhost:3000/docs"
Write-Host "  Visor REST:     http://localhost:5174 (cuando se sirve clients/rest-viewer)"
Write-Host ""
Write-Host "Para detener SOLO estos servicios: .\scripts\stop.ps1"
Write-Host "La PostgreSQL '$container' permanece intacta."

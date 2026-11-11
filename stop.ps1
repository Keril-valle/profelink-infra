# No detiene Docker Desktop ni la PostgreSQL existente.
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'scripts/stop.ps1')

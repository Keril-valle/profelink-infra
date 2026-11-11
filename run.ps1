# Descarga imagenes publicadas y levanta solo API/web.
param(
  [ValidateSet('Published', 'Local')]
  [string]$Mode = 'Published',
  [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'scripts/start.ps1') @PSBoundParameters

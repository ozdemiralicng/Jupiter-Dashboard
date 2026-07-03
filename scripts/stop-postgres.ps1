$ErrorActionPreference = "Stop"

$pgRoot = Join-Path $env:USERPROFILE "tools\postgresql-16.14\pgsql"
$dataDir = Join-Path $env:USERPROFILE "tools\postgresql-16.14\data"
$pgCtl = Join-Path $pgRoot "bin\pg_ctl.exe"

if (-not (Test-Path $pgCtl)) {
  throw "Portable PostgreSQL was not found at $pgRoot."
}

if (-not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  Write-Host "No PostgreSQL data directory exists yet."
  exit 0
}

& $pgCtl -D $dataDir -w stop

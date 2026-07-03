$ErrorActionPreference = "Stop"

$pgRoot = Join-Path $env:USERPROFILE "tools\postgresql-16.14\pgsql"
$pgReady = Join-Path $pgRoot "bin\pg_isready.exe"

if (-not (Test-Path $pgReady)) {
  throw "Portable PostgreSQL was not found at $pgRoot."
}

& $pgReady -h localhost -p 5432 -U trading

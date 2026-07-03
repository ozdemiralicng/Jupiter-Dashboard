$ErrorActionPreference = "Stop"

$pgRoot = Join-Path $env:USERPROFILE "tools\postgresql-16.14\pgsql"
$dataDir = Join-Path $env:USERPROFILE "tools\postgresql-16.14\data"
$passwordFile = Join-Path $env:USERPROFILE "tools\postgresql-16.14\pwfile.txt"
$logFile = Join-Path $env:USERPROFILE "tools\postgresql-16.14\postgres.log"
$bin = Join-Path $pgRoot "bin"

if (-not (Test-Path (Join-Path $bin "pg_ctl.exe"))) {
  throw "Portable PostgreSQL was not found at $pgRoot. Ask Codex to install the local PostgreSQL runtime again."
}

Set-Content -LiteralPath $passwordFile -Value "trading_password" -NoNewline

if (-not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  & (Join-Path $bin "initdb.exe") -D $dataDir -U trading -A scram-sha-256 "--pwfile=$passwordFile" --encoding=UTF8 --locale=C
}

& (Join-Path $bin "pg_isready.exe") -h localhost -p 5432 -U trading *> $null
if ($LASTEXITCODE -ne 0) {
  & (Join-Path $bin "pg_ctl.exe") -D $dataDir -l $logFile -o "-p 5432" -w start
} else {
  Write-Host "PostgreSQL is already running on port 5432."
}

$env:PGPASSWORD = "trading_password"
$databaseExists = & (Join-Path $bin "psql.exe") -h localhost -p 5432 -U trading -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'trading_copilot';"
if ($databaseExists.Trim() -ne "1") {
  & (Join-Path $bin "createdb.exe") -h localhost -p 5432 -U trading trading_copilot
}
Write-Host "PostgreSQL is ready. Database: trading_copilot"

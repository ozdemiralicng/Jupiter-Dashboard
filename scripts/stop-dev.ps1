$ErrorActionPreference = "Stop"

$ports = @(3000, 5173)

foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($connection in $connections) {
    $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
      Write-Host "Stopping $($process.ProcessName) PID $($process.Id) on port $port"
      Stop-Process -Id $process.Id -Force
    }
  }
}

Write-Host "Development ports are clear."

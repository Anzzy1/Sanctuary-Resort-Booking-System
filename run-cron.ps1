param([string]$Base = "http://localhost:3000")
$envPath = Join-Path $PSScriptRoot ".env"
$secretLine = Get-Content -LiteralPath $envPath | Where-Object { $_ -match '^CRON_SECRET=' } | Select-Object -First 1
if (-not $secretLine) { Write-Error "CRON_SECRET not found in .env"; exit 1 }
$secret = ($secretLine -replace '^CRON_SECRET=', '').Trim().Trim('"')
try {
  $res = Invoke-RestMethod -Uri "$Base/api/cron/expire-pending" -Headers @{ Authorization = "Bearer $secret" } -Method Get -TimeoutSec 30
  Write-Output "expired=$($res.expired) at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} catch {
  Write-Output "cron failed: $($_.Exception.Message) at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}
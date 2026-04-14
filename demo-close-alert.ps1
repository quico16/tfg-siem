$baseUrl = "http://localhost:8080"

Write-Host "=== DEMO CLOSE ALERT ===" -ForegroundColor Cyan

function Get-Json {
    param([string]$Url)
    return Invoke-RestMethod -Uri $Url -Method Get
}

function Patch-Json {
    param([string]$Url)
    return Invoke-RestMethod -Uri $Url -Method Patch
}

Write-Host "`n[1] Fetching open alerts..." -ForegroundColor Yellow
$openAlerts = Get-Json -Url "$baseUrl/api/alerts/company/1/open"
$openAlerts | Format-Table -AutoSize | Out-String | Write-Host

if (-not $openAlerts -or $openAlerts.Count -eq 0) {
    Write-Host "No open alerts found" -ForegroundColor Red
    exit
}

$alertId = $openAlerts[0].id
Write-Host "`n[2] Closing alert ID: $alertId" -ForegroundColor Yellow

$closedAlert = Patch-Json -Url "$baseUrl/api/alerts/$alertId/close"
$closedAlert | Format-List * | Out-String | Write-Host

Write-Host "`n[3] Open alerts after closing:" -ForegroundColor Yellow
$remainingOpenAlerts = Get-Json -Url "$baseUrl/api/alerts/company/1/open"
$remainingOpenAlerts | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "`n=== DEMO CLOSE ALERT COMPLETED ===" -ForegroundColor Cyan



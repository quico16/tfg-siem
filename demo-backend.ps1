$baseUrl = "http://localhost:8080"

Write-Host "=== DEMO BACKEND SIEM ===" -ForegroundColor Cyan

function Post-Json {
    param(
        [string]$Url,
        [hashtable]$Body
    )

    $json = $Body | ConvertTo-Json -Depth 5
    return Invoke-RestMethod -Uri $Url -Method Post -ContentType "application/json" -Body $json
}

function Get-Json {
    param(
        [string]$Url
    )

    Write-Host "URL => $Url" -ForegroundColor DarkGray

    try {
        return Invoke-RestMethod -Uri $Url -Method Get
    } catch {
        $response = $_.Exception.Response
        if ($response -ne $null) {
            $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
            $body = $reader.ReadToEnd()
            Write-Host "=== ERROR BODY ===" -ForegroundColor Red
            Write-Host $body -ForegroundColor Red
        } else {
            Write-Host "=== ERROR MESSAGE ===" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
        throw
    }
}

Write-Host "`n[1] GET /api/companies" -ForegroundColor Yellow
$companies = Get-Json -Url "$baseUrl/api/companies"
$companies | Format-Table -AutoSize | Out-String | Write-Host

if (-not $companies -or $companies.Count -eq 0) {
    Write-Host "No hay empresas. Ejecuta primero seed-data.ps1" -ForegroundColor Red
    exit
}

$companyId = $companies[0].id
Write-Host "`nUsando companyId = $companyId" -ForegroundColor Green

Write-Host "`n[2] GET /api/sources/company/$companyId" -ForegroundColor Yellow
$sources = Get-Json -Url "$baseUrl/api/sources/company/$companyId"
$sources | Format-Table -AutoSize | Out-String | Write-Host

if (-not $sources -or $sources.Count -eq 0) {
    Write-Host "No hay fuentes para la empresa. Ejecuta primero seed-data.ps1" -ForegroundColor Red
    exit
}

$firewall = $sources | Where-Object { $_.sourceType -eq "FIREWALL" -or $_.type -eq "FIREWALL" } | Select-Object -First 1
if (-not $firewall) {
    $firewall = $sources[0]
}

$sourceId = $firewall.id
Write-Host "`nUsando sourceId = $sourceId para demo crítica" -ForegroundColor Green

Write-Host "`n[3] POST /api/logs (CRITICAL demo)" -ForegroundColor Yellow
$criticalLog = Post-Json -Url "$baseUrl/api/logs" -Body @{
    timestamp = "2026-03-24T18:00:00"
    companyId = $companyId
    sourceId = $sourceId
    level = "CRITICAL"
    message = "Demo critical event triggered manually"
    ip = "172.16.0.10"
    rawLog = '{"event":"manual_demo_critical","action":"blocked","source":"demo-script"}'
}
$criticalLog | Format-List * | Out-String | Write-Host

Start-Sleep -Seconds 1

Write-Host "`n[4] GET /api/logs/company/$companyId" -ForegroundColor Yellow
$logs = Get-Json -Url "$baseUrl/api/logs/company/$companyId"
$logs | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "`n[5] GET /api/alerts/company/$companyId" -ForegroundColor Yellow
$alerts = Get-Json -Url "$baseUrl/api/alerts/company/$companyId"
$alerts | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "`n[6] GET /api/alerts/company/$companyId/open" -ForegroundColor Yellow
$openAlerts = Get-Json -Url "$baseUrl/api/alerts/company/$companyId/open"
$openAlerts | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "`n[7] GET /api/dashboard/company/$companyId/summary" -ForegroundColor Yellow
$summary = Get-Json -Url "$baseUrl/api/dashboard/company/$companyId/summary"
$summary | Format-List * | Out-String | Write-Host

Write-Host "`n[8] GET /api/dashboard/company/$companyId/levels" -ForegroundColor Yellow
$levels = Get-Json -Url "$baseUrl/api/dashboard/company/$companyId/levels"
$levels | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "`n[9] GET /api/logs/company/$companyId filtered by date" -ForegroundColor Yellow
$start = "2026-03-19T00:00:00"
$end = "2026-03-24T23:59:59"

$startEncoded = [System.Uri]::EscapeDataString($start)
$endEncoded = [System.Uri]::EscapeDataString($end)

$filterUrl = "$baseUrl/api/logs/company/$($companyId)?start=$($startEncoded)&end=$($endEncoded)"

$filteredLogs = Get-Json -Url $filterUrl
$filteredLogs | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "`n=== DEMO COMPLETADA ===" -ForegroundColor Cyan
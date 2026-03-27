$baseUrl = "http://localhost:8080"

Write-Host "=== SEED DATA SIEM ===" -ForegroundColor Cyan

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

    return Invoke-RestMethod -Uri $Url -Method Get
}

Write-Host "`n[1] Creando empresa..." -ForegroundColor Yellow
$companyResponse = Post-Json -Url "$baseUrl/api/companies" -Body @{
    name = "Empresa Demo 2"
}

$companyId = $companyResponse.id
Write-Host "Empresa creada con ID: $companyId" -ForegroundColor Green

Write-Host "`n[2] Creando fuentes..." -ForegroundColor Yellow

$firewallSource = Post-Json -Url "$baseUrl/api/sources" -Body @{
    name = "Firewall Principal"
    type = "FIREWALL"
    companyId = $companyId
}

$edrSource = Post-Json -Url "$baseUrl/api/sources" -Body @{
    name = "EDR CrowdStrike"
    type = "EDR"
    companyId = $companyId
}

$mailSource = Post-Json -Url "$baseUrl/api/sources" -Body @{
    name = "Mail Gateway"
    type = "MAIL"
    companyId = $companyId
}

$firewallId = $firewallSource.id
$edrId = $edrSource.id
$mailId = $mailSource.id

Write-Host "`n[3] Cargando logs de prueba..." -ForegroundColor Yellow

$logs = @(
    @{ timestamp="2026-03-20T08:15:00"; companyId=$companyId; sourceId=$firewallId; level="INFO"; message="Normal HTTPS allowed"; ip="192.168.1.10"; rawLog='{"event":"https"}' },
    @{ timestamp="2026-03-20T10:22:00"; companyId=$companyId; sourceId=$edrId; level="INFO"; message="User login successful"; ip="192.168.1.21"; rawLog='{"event":"login"}' },
    @{ timestamp="2026-03-20T12:05:00"; companyId=$companyId; sourceId=$mailId; level="INFO"; message="Email delivered"; ip="192.168.1.50"; rawLog='{"event":"mail"}' },

    @{ timestamp="2026-03-21T09:12:00"; companyId=$companyId; sourceId=$firewallId; level="INFO"; message="DNS query resolved"; ip="192.168.1.12"; rawLog='{"event":"dns"}' },
    @{ timestamp="2026-03-21T11:45:00"; companyId=$companyId; sourceId=$edrId; level="INFO"; message="AV scan completed"; ip="192.168.1.21"; rawLog='{"event":"av"}' },
    @{ timestamp="2026-03-21T15:20:00"; companyId=$companyId; sourceId=$mailId; level="INFO"; message="SMTP connection ok"; ip="192.168.1.50"; rawLog='{"event":"smtp"}' },

    @{ timestamp="2026-03-22T08:55:00"; companyId=$companyId; sourceId=$firewallId; level="WARNING"; message="Failed login attempts"; ip="192.168.1.5"; rawLog='{"event":"failed"}' },
    @{ timestamp="2026-03-22T09:02:00"; companyId=$companyId; sourceId=$firewallId; level="WARNING"; message="Failed login attempts"; ip="192.168.1.5"; rawLog='{"event":"failed"}' },
    @{ timestamp="2026-03-22T09:05:00"; companyId=$companyId; sourceId=$firewallId; level="WARNING"; message="Blocked SSH attempts"; ip="192.168.1.5"; rawLog='{"event":"ssh"}' },

    @{ timestamp="2026-03-23T10:30:00"; companyId=$companyId; sourceId=$edrId; level="WARNING"; message="Suspicious PowerShell"; ip="192.168.1.33"; rawLog='{"event":"powershell"}' },
    @{ timestamp="2026-03-23T13:10:00"; companyId=$companyId; sourceId=$mailId; level="WARNING"; message="Suspicious attachment"; ip="192.168.1.50"; rawLog='{"event":"attachment"}' },
    @{ timestamp="2026-03-23T14:22:00"; companyId=$companyId; sourceId=$mailId; level="WARNING"; message="Phishing indicators"; ip="192.168.1.50"; rawLog='{"event":"phishing"}' },

    @{ timestamp="2026-03-24T09:40:00"; companyId=$companyId; sourceId=$edrId; level="CRITICAL"; message="Malware detected"; ip="192.168.1.44"; rawLog='{"event":"malware"}' },
    @{ timestamp="2026-03-24T12:18:00"; companyId=$companyId; sourceId=$firewallId; level="CRITICAL"; message="Unauthorized access blocked"; ip="10.0.0.5"; rawLog='{"event":"blocked"}' },
    @{ timestamp="2026-03-24T16:55:00"; companyId=$companyId; sourceId=$mailId; level="CRITICAL"; message="Phishing delivered"; ip="192.168.1.60"; rawLog='{"event":"phishing"}' }
)

$createdLogs = @()

foreach ($log in $logs) {
    $response = Post-Json -Url "$baseUrl/api/logs" -Body $log
    $createdLogs += $response
    Write-Host "Log creado -> ID: $($response.id) | Level: $($response.level)"
}

Write-Host "`n[4] Resumen final del seed"
Write-Host "Total logs creados: $($createdLogs.Count)"

Write-Host "`n[5] Consultando alertas..."
$alerts = Get-Json -Url "$baseUrl/api/alerts/company/$companyId"
Write-Host "Total alertas: $($alerts.Count)"

Write-Host "`n=== SEED COMPLETADO ==="

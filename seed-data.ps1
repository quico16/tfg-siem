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

Write-Host "`n[1] Creating company..." -ForegroundColor Yellow
$companyResponse = Post-Json -Url "$baseUrl/api/companies" -Body @{
    name = "Demo Company"
}

$companyId = $companyResponse.id
Write-Host "Company created with ID: $companyId" -ForegroundColor Green

Write-Host "`n[2] Creating sources..." -ForegroundColor Yellow

$firewallSource = Post-Json -Url "$baseUrl/api/sources" -Body @{
    name = "Main Firewall"
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

Write-Host "FIREWALL source ID: $firewallId" -ForegroundColor Green
Write-Host "EDR source ID: $edrId" -ForegroundColor Green
Write-Host "MAIL source ID: $mailId" -ForegroundColor Green

Write-Host "`n[3] Loading sample logs..." -ForegroundColor Yellow

$logs = @(
    @{
        timestamp = "2026-03-18T08:15:00"
        companyId = $companyId
        sourceId = $firewallId
        level = "INFO"
        message = "Normal outbound HTTPS connection allowed"
        ip = "192.168.1.10"
        rawLog = '{"event":"outbound_connection","protocol":"HTTPS","action":"allowed","dst_ip":"8.8.8.8"}'
    },
    @{
        timestamp = "2026-03-18T09:05:00"
        companyId = $companyId
        sourceId = $edrId
        level = "INFO"
        message = "User login successful"
        ip = "192.168.1.21"
        rawLog = '{"event":"login_success","user":"jmartinez","host":"PC-021"}'
    },
    @{
        timestamp = "2026-03-18T10:10:00"
        companyId = $companyId
        sourceId = $mailId
        level = "INFO"
        message = "Email delivered successfully"
        ip = "192.168.1.50"
        rawLog = '{"event":"mail_delivered","sender":"admin@demo.com","recipient":"user@demo.com"}'
    },
    @{
        timestamp = "2026-03-19T08:20:00"
        companyId = $companyId
        sourceId = $firewallId
        level = "INFO"
        message = "DNS query resolved successfully"
        ip = "192.168.1.12"
        rawLog = '{"event":"dns_query","domain":"openai.com","status":"resolved"}'
    },
    @{
        timestamp = "2026-03-19T09:35:00"
        companyId = $companyId
        sourceId = $edrId
        level = "INFO"
        message = "Scheduled antivirus scan completed"
        ip = "192.168.1.21"
        rawLog = '{"event":"av_scan_complete","result":"clean","host":"PC-021"}'
    },
    @{
        timestamp = "2026-03-19T11:15:00"
        companyId = $companyId
        sourceId = $mailId
        level = "INFO"
        message = "Mail relay connection established"
        ip = "192.168.1.50"
        rawLog = '{"event":"smtp_connection","status":"ok","relay":"mail.demo.com"}'
    },
    @{
        timestamp = "2026-03-19T12:00:00"
        companyId = $companyId
        sourceId = $firewallId
        level = "WARNING"
        message = "Repeated failed login attempts detected"
        ip = "192.168.1.5"
        rawLog = '{"event":"failed_login","attempts":4,"src_ip":"192.168.1.5"}'
    },
    @{
        timestamp = "2026-03-19T12:02:00"
        companyId = $companyId
        sourceId = $firewallId
        level = "WARNING"
        message = "Repeated failed login attempts detected"
        ip = "192.168.1.5"
        rawLog = '{"event":"failed_login","attempts":5,"src_ip":"192.168.1.5"}'
    },
    @{
        timestamp = "2026-03-19T12:04:00"
        companyId = $companyId
        sourceId = $firewallId
        level = "WARNING"
        message = "Multiple blocked SSH attempts detected"
        ip = "192.168.1.5"
        rawLog = '{"event":"blocked_connection","dst_port":22,"action":"blocked","src_ip":"192.168.1.5"}'
    },
    @{
        timestamp = "2026-03-19T13:15:00"
        companyId = $companyId
        sourceId = $edrId
        level = "WARNING"
        message = "Suspicious PowerShell execution detected"
        ip = "192.168.1.33"
        rawLog = '{"event":"powershell_execution","command":"EncodedCommand","host":"PC-033"}'
    },
    @{
        timestamp = "2026-03-19T14:00:00"
        companyId = $companyId
        sourceId = $mailId
        level = "WARNING"
        message = "Suspicious email attachment detected"
        ip = "192.168.1.50"
        rawLog = '{"event":"suspicious_attachment","filename":"invoice.zip","sender":"unknown@external.com"}'
    },
    @{
        timestamp = "2026-03-19T14:05:00"
        companyId = $companyId
        sourceId = $mailId
        level = "WARNING"
        message = "Multiple phishing indicators detected"
        ip = "192.168.1.50"
        rawLog = '{"event":"phishing_detected","score":82,"sender":"alerts@fake-microsoft.com"}'
    },
    @{
        timestamp = "2026-03-19T15:00:00"
        companyId = $companyId
        sourceId = $edrId
        level = "CRITICAL"
        message = "Malware detected and quarantined"
        ip = "192.168.1.44"
        rawLog = '{"event":"malware_detected","threat":"Trojan.Generic","action":"quarantined","host":"PC-044"}'
    },
    @{
        timestamp = "2026-03-19T16:10:00"
        companyId = $companyId
        sourceId = $firewallId
        level = "CRITICAL"
        message = "Unauthorized access attempt blocked"
        ip = "10.0.0.5"
        rawLog = '{"event":"blocked_access","vendor":"pfSense","rule":"deny_all"}'
    },
    @{
        timestamp = "2026-03-19T17:20:00"
        companyId = $companyId
        sourceId = $mailId
        level = "CRITICAL"
        message = "Phishing email delivered to executive mailbox"
        ip = "192.168.1.60"
        rawLog = '{"event":"phishing_delivered","recipient":"ceo@demo.com","severity":"high"}'
    }
)

$createdLogs = @()

foreach ($log in $logs) {
    $response = Post-Json -Url "$baseUrl/api/logs" -Body $log
    $createdLogs += $response
    Write-Host "Log created -> ID: $($response.id) | Level: $($response.level) | Source: $($response.sourceName)" -ForegroundColor Green
}

Write-Host "`n[4] Final seed summary" -ForegroundColor Yellow
Write-Host "Company ID: $companyId"
Write-Host "Firewall ID: $firewallId"
Write-Host "EDR ID: $edrId"
Write-Host "Mail ID: $mailId"
Write-Host "Total created logs: $($createdLogs.Count)" -ForegroundColor Green

Write-Host "`n[5] Fetching automatically generated alerts..." -ForegroundColor Yellow
$alerts = Get-Json -Url "$baseUrl/api/alerts/company/$companyId"
$openAlerts = Get-Json -Url "$baseUrl/api/alerts/company/$companyId/open"

Write-Host "Total alerts: $($alerts.Count)" -ForegroundColor Green
Write-Host "Open alerts: $($openAlerts.Count)" -ForegroundColor Green

Write-Host "`n=== SEED COMPLETED ===" -ForegroundColor Cyan



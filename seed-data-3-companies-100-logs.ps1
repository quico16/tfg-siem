param(
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

$baseUrl = $BaseUrl.TrimEnd('/')
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Invoke-WithRetry {
    param(
        [scriptblock]$Operation,
        [int]$MaxRetries = 6,
        [int]$DelaySeconds = 3
    )

    $attempt = 1
    while ($true) {
        try {
            return & $Operation
        }
        catch {
            if ($attempt -ge $MaxRetries) { throw }
            Start-Sleep -Seconds ($DelaySeconds * $attempt)
            $attempt++
        }
    }
}

function Invoke-ApiGet {
    param([string]$Path)
    return Invoke-WithRetry -Operation {
        Invoke-RestMethod -Uri "$baseUrl$Path" -Method Get -TimeoutSec 120
    }
}

function Invoke-ApiPost {
    param(
        [string]$Path,
        [hashtable]$Body
    )

    $json = $Body | ConvertTo-Json -Depth 10
    return Invoke-WithRetry -Operation {
        Invoke-RestMethod -Uri "$baseUrl$Path" -Method Post -ContentType "application/json" -Body $json -TimeoutSec 120
    }
}

function Ensure-Company {
    param([string]$Name)

    $companies = Invoke-ApiGet -Path "/api/companies"
    $existing = $companies | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if ($existing) { return $existing }

    return Invoke-ApiPost -Path "/api/companies" -Body @{ name = $Name }
}

function Ensure-Source {
    param(
        [long]$CompanyId,
        [string]$Name,
        [string]$Type
    )

    $sources = Invoke-ApiGet -Path "/api/sources/company/$CompanyId"
    $existing = $sources | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if ($existing) { return $existing }

    return Invoke-ApiPost -Path "/api/sources" -Body @{
        name = $Name
        type = $Type
        companyId = $CompanyId
    }
}

function New-Log {
    param(
        [string]$Timestamp,
        [long]$CompanyId,
        [long]$SourceId,
        [string]$Level,
        [string]$Message,
        [string]$Ip,
        [string]$EventName
    )

    $rawPayload = @{
        timestamp = $Timestamp
        company = @{
            id = $CompanyId
        }
        source = @{
            id = $SourceId
        }
        level = $Level
        message = $Message
        ip = $Ip
        event = $EventName
        generator = "seed-data-3-companies-100-logs"
        # Simulates the unnormalized/original envelope that an external source could send.
        vendorPayload = @{
            event_name = $EventName
            event_time = $Timestamp
            source_id = $SourceId
            src_ip = $Ip
            severity_text = $Level
            msg = $Message
        }
        ingestMetadata = @{
            parser = "seed"
            normalized = $false
            format = "json"
        }
    }

    return Invoke-ApiPost -Path "/api/logs" -Body @{
        timestamp = $Timestamp
        companyId = $CompanyId
        sourceId = $SourceId
        level = $Level
        message = $Message
        ip = $Ip
        rawLog = ($rawPayload | ConvertTo-Json -Depth 10 -Compress)
    }
}

Write-Host "=== Seed 3 companies / 100 logs ===" -ForegroundColor Cyan

# 1) Ensure companies
$companyA = Ensure-Company -Name "Empresa Demo"
$companyB = Ensure-Company -Name "Empresa Demo 2"
$companyC = Ensure-Company -Name "Empresa Demo 3"

# 2) Ensure sources per company
$src = @{
    A = @{
        FIREWALL = (Ensure-Source -CompanyId $companyA.id -Name "Firewall Principal" -Type "FIREWALL").id
        EDR = (Ensure-Source -CompanyId $companyA.id -Name "EDR CrowdStrike" -Type "EDR").id
        MAIL = (Ensure-Source -CompanyId $companyA.id -Name "Mail Gateway" -Type "MAIL").id
    }
    B = @{
        FIREWALL = (Ensure-Source -CompanyId $companyB.id -Name "Firewall Principal" -Type "FIREWALL").id
        EDR = (Ensure-Source -CompanyId $companyB.id -Name "EDR CrowdStrike" -Type "EDR").id
        MAIL = (Ensure-Source -CompanyId $companyB.id -Name "Mail Gateway" -Type "MAIL").id
    }
    C = @{
        FIREWALL = (Ensure-Source -CompanyId $companyC.id -Name "Firewall Principal" -Type "FIREWALL").id
        EDR = (Ensure-Source -CompanyId $companyC.id -Name "EDR CrowdStrike" -Type "EDR").id
        MAIL = (Ensure-Source -CompanyId $companyC.id -Name "Mail Gateway" -Type "MAIL").id
    }
}

$now = Get-Date
$counter = 0
$createdLogs = @()

function Next-Timestamp {
    $script:counter++
    return $now.AddMinutes(-120 + $script:counter).ToString("yyyy-MM-ddTHH:mm:ss")
}

function Add-LogSafe {
    param(
        [long]$CompanyId,
        [long]$SourceId,
        [string]$Level,
        [string]$Message,
        [string]$Ip,
        [string]$EventName
    )

    $log = New-Log `
        -Timestamp (Next-Timestamp) `
        -CompanyId $CompanyId `
        -SourceId $SourceId `
        -Level $Level `
        -Message $Message `
        -Ip $Ip `
        -EventName $EventName

    $script:createdLogs += $log
}

# ----- Detection-focused logs -----
# BRUTE_FORCE_LOGIN (company A)
for ($i = 1; $i -le 5; $i++) {
    Add-LogSafe -CompanyId $companyA.id -SourceId $src.A.FIREWALL -Level "WARNING" `
        -Message "Failed login attempt detected on VPN portal" -Ip "185.10.10.10" -EventName "failed_login"
}

# PASSWORD_SPRAYING (company A, same IP across 2 sources)
for ($i = 1; $i -le 8; $i++) {
    $sourceId = if ($i % 2 -eq 0) { $src.A.FIREWALL } else { $src.A.EDR }
    Add-LogSafe -CompanyId $companyA.id -SourceId $sourceId -Level "WARNING" `
        -Message "Authentication failed for multiple user accounts" -Ip "185.10.10.11" -EventName "auth_failed"
}

# SEVERITY_ESCALATION_IP + CRITICAL_BURST_IP (company B)
Add-LogSafe -CompanyId $companyB.id -SourceId $src.B.FIREWALL -Level "INFO" `
    -Message "Initial suspicious perimeter telemetry" -Ip "77.77.77.77" -EventName "initial_signal"
Add-LogSafe -CompanyId $companyB.id -SourceId $src.B.FIREWALL -Level "WARNING" `
    -Message "Perimeter anomaly escalating" -Ip "77.77.77.77" -EventName "warning_signal"
Add-LogSafe -CompanyId $companyB.id -SourceId $src.B.FIREWALL -Level "CRITICAL" `
    -Message "Unauthorized access blocked on perimeter" -Ip "77.77.77.77" -EventName "critical_block"
Add-LogSafe -CompanyId $companyB.id -SourceId $src.B.FIREWALL -Level "CRITICAL" `
    -Message "Unauthorized access blocked on perimeter" -Ip "77.77.77.77" -EventName "critical_block_repeat"

# PHISHING + CROSS_COMPANY_SHARED_INDICATOR (A + B)
Add-LogSafe -CompanyId $companyA.id -SourceId $src.A.MAIL -Level "CRITICAL" `
    -Message "Shared phishing campaign delivered" -Ip "10.1.1.50" -EventName "phishing_campaign"
Add-LogSafe -CompanyId $companyB.id -SourceId $src.B.MAIL -Level "CRITICAL" `
    -Message "Shared phishing campaign delivered" -Ip "10.2.2.50" -EventName "phishing_campaign"

# RANSOMWARE (company C)
Add-LogSafe -CompanyId $companyC.id -SourceId $src.C.EDR -Level "CRITICAL" `
    -Message "Ransomware behavior blocked by endpoint controls" -Ip "10.3.3.20" -EventName "ransomware_blocked"

# LATERAL_MOVEMENT (company C)
Add-LogSafe -CompanyId $companyC.id -SourceId $src.C.EDR -Level "CRITICAL" `
    -Message "Lateral movement attempt observed via SMB spread" -Ip "10.3.3.30" -EventName "lateral_movement"

# Cross-company WARNING indicator (A + B)
Add-LogSafe -CompanyId $companyA.id -SourceId $src.A.MAIL -Level "WARNING" `
    -Message "Suspicious domain in incoming email" -Ip "10.1.1.51" -EventName "suspicious_domain"
Add-LogSafe -CompanyId $companyB.id -SourceId $src.B.MAIL -Level "WARNING" `
    -Message "Suspicious domain in incoming email" -Ip "10.2.2.51" -EventName "suspicious_domain"

# Cross-company CRITICAL indicator (B + C)
Add-LogSafe -CompanyId $companyB.id -SourceId $src.B.EDR -Level "CRITICAL" `
    -Message "Shared ransomware activity detected" -Ip "10.2.2.60" -EventName "shared_ransomware"
Add-LogSafe -CompanyId $companyC.id -SourceId $src.C.EDR -Level "CRITICAL" `
    -Message "Shared ransomware activity detected" -Ip "10.3.3.60" -EventName "shared_ransomware"

# ----- Filler logs to reach exactly 100 logs -----
function Add-FillerLogs {
    param(
        [long]$CompanyId,
        [hashtable]$CompanySources,
        [int]$Count,
        [string]$Prefix,
        [int]$IpOctet
    )

    for ($i = 1; $i -le $Count; $i++) {
        $sourceType = switch ($i % 3) {
            0 { "FIREWALL" }
            1 { "EDR" }
            default { "MAIL" }
        }

        $level = if ($i % 10 -eq 0) { "WARNING" } else { "INFO" }
        $message = "$Prefix routine telemetry event #$i"
        $ip = "192.168.$IpOctet.$i"
        $eventName = "routine_event_$i"

        Add-LogSafe `
            -CompanyId $CompanyId `
            -SourceId $CompanySources[$sourceType] `
            -Level $level `
            -Message $message `
            -Ip $ip `
            -EventName $eventName
    }
}

# Current detection logs = 25, filler target = 75
# Final distribution => A:34 logs, B:33 logs, C:33 logs
Add-FillerLogs -CompanyId $companyA.id -CompanySources $src.A -Count 19 -Prefix "Empresa Demo" -IpOctet 11
Add-FillerLogs -CompanyId $companyB.id -CompanySources $src.B -Count 26 -Prefix "Empresa Demo 2" -IpOctet 22
Add-FillerLogs -CompanyId $companyC.id -CompanySources $src.C -Count 30 -Prefix "Empresa Demo 3" -IpOctet 33

if ($createdLogs.Count -ne 100) {
    throw "Expected 100 created logs, got $($createdLogs.Count)"
}

$alertsA = Invoke-ApiGet -Path "/api/alerts/company/$($companyA.id)"
$alertsB = Invoke-ApiGet -Path "/api/alerts/company/$($companyB.id)"
$alertsC = Invoke-ApiGet -Path "/api/alerts/company/$($companyC.id)"
$allAlerts = @($alertsA + $alertsB + $alertsC)

Write-Host ""
Write-Host "Created logs: $($createdLogs.Count)" -ForegroundColor Green
Write-Host "Total alerts: $($allAlerts.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Alerts by ruleKey:" -ForegroundColor Yellow
$allAlerts |
    Group-Object ruleKey |
    Sort-Object Name |
    ForEach-Object {
        "{0,-35} {1,3}" -f $_.Name, $_.Count
    } |
    Write-Host

Write-Host ""
Write-Host "Done." -ForegroundColor Cyan

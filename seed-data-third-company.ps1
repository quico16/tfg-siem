$baseUrl = "http://localhost:8080"

Write-Host "=== SEED THIRD COMPANY ===" -ForegroundColor Cyan

function Invoke-ApiGet {
    param([string]$Url)
    return Invoke-RestMethod -Uri $Url -Method Get
}

function Invoke-ApiPost {
    param(
        [string]$Url,
        [hashtable]$Body
    )
    $json = $Body | ConvertTo-Json -Depth 10
    return Invoke-RestMethod -Uri $Url -Method Post -ContentType "application/json" -Body $json
}

function Ensure-Company {
    param([string]$Name)
    $companies = Invoke-ApiGet -Url "$baseUrl/api/companies"
    $existing = $companies | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if ($existing) {
        return $existing
    }

    return Invoke-ApiPost -Url "$baseUrl/api/companies" -Body @{ name = $Name }
}

function Ensure-Source {
    param(
        [long]$CompanyId,
        [string]$Name,
        [string]$Type
    )
    $sources = Invoke-ApiGet -Url "$baseUrl/api/sources/company/$CompanyId"
    $existing = $sources | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if ($existing) {
        return $existing
    }

    return Invoke-ApiPost -Url "$baseUrl/api/sources" -Body @{
        name = $Name
        type = $Type
        companyId = $CompanyId
    }
}

function Create-Log {
    param(
        [string]$Timestamp,
        [long]$CompanyId,
        [long]$SourceId,
        [string]$Level,
        [string]$Message,
        [string]$Ip,
        [string]$EventName
    )

    return Invoke-ApiPost -Url "$baseUrl/api/logs" -Body @{
        timestamp = $Timestamp
        companyId = $CompanyId
        sourceId = $SourceId
        level = $Level
        message = $Message
        ip = $Ip
        rawLog = "{`"event`":`"$EventName`",`"seed`":`"third-company`"}"
    }
}

$company = Ensure-Company -Name "Empresa Demo 3"
$companyId = [long]$company.id
Write-Host "Empresa objetivo: $($company.name) (ID: $companyId)" -ForegroundColor Green

$firewall = Ensure-Source -CompanyId $companyId -Name "Firewall Principal" -Type "FIREWALL"
$edr = Ensure-Source -CompanyId $companyId -Name "EDR CrowdStrike" -Type "EDR"
$mail = Ensure-Source -CompanyId $companyId -Name "Mail Gateway" -Type "MAIL"

$logs = @(
    @{ ts = "2026-04-10T08:10:00"; src = $firewall.id; lvl = "INFO"; msg = "Connection allowed to trusted host"; ip = "10.30.1.10"; evt = "allow_connection" },
    @{ ts = "2026-04-10T09:20:00"; src = $edr.id; lvl = "INFO"; msg = "Endpoint check completed"; ip = "10.30.1.21"; evt = "endpoint_check" },
    @{ ts = "2026-04-10T10:30:00"; src = $mail.id; lvl = "WARNING"; msg = "Suspicious attachment detected"; ip = "10.30.1.50"; evt = "mail_attachment_warning" },
    @{ ts = "2026-04-10T11:40:00"; src = $firewall.id; lvl = "WARNING"; msg = "Multiple denied SSH attempts"; ip = "185.71.66.9"; evt = "ssh_denied_attempts" },
    @{ ts = "2026-04-10T12:50:00"; src = $edr.id; lvl = "CRITICAL"; msg = "Malware execution blocked"; ip = "10.30.1.22"; evt = "malware_blocked" },
    @{ ts = "2026-04-10T13:15:00"; src = $mail.id; lvl = "CRITICAL"; msg = "Business email compromise pattern detected"; ip = "10.30.1.51"; evt = "bec_detected" }
)

$created = @()
foreach ($log in $logs) {
    $createdLog = Create-Log -Timestamp $log.ts -CompanyId $companyId -SourceId ([long]$log.src) -Level $log.lvl -Message $log.msg -Ip $log.ip -EventName $log.evt
    $created += $createdLog
    Write-Host "Log creat -> ID: $($createdLog.id) | Level: $($createdLog.level) | Missatge: $($createdLog.message)" -ForegroundColor Yellow
}

$alerts = Invoke-ApiGet -Url "$baseUrl/api/alerts/company/$companyId"
Write-Host "Total logs creats en aquesta execucio: $($created.Count)" -ForegroundColor Green
Write-Host "Alertes totals de l'empresa: $($alerts.Count)" -ForegroundColor Green

Write-Host "=== FI SEED THIRD COMPANY ===" -ForegroundColor Cyan

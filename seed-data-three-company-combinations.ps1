$baseUrl = "http://localhost:8080"

Write-Host "=== SEED 3-COMPANY COMBINATIONS ===" -ForegroundColor Cyan

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
        rawLog = "{`"event`":`"$EventName`",`"seed`":`"3-company-combo`"}"
    }
}

$companyNames = @("Empresa Demo", "Empresa Demo 2", "Empresa Demo 3")
$companyMap = @{}
$sourceMap = @{}

foreach ($companyName in $companyNames) {
    $company = Ensure-Company -Name $companyName
    $companyId = [long]$company.id
    $companyMap[$companyName] = $companyId

    $sourceMap[$companyName] = @{
        FIREWALL = (Ensure-Source -CompanyId $companyId -Name "Firewall Principal" -Type "FIREWALL").id
        EDR = (Ensure-Source -CompanyId $companyId -Name "EDR CrowdStrike" -Type "EDR").id
        MAIL = (Ensure-Source -CompanyId $companyId -Name "Mail Gateway" -Type "MAIL").id
    }
}

$baseTime = Get-Date "2026-04-11T08:00:00"
$counter = 0
$created = @()

function Add-CombinationLogs {
    param(
        [string[]]$Targets,
        [string]$SourceType,
        [string]$Level,
        [string]$Message,
        [string]$EventName
    )

    foreach ($companyName in $Targets) {
        $companyId = [long]$companyMap[$companyName]
        $sourceId = [long]$sourceMap[$companyName][$SourceType]
        $timestamp = $baseTime.AddMinutes($script:counter * 3).ToString("yyyy-MM-ddTHH:mm:ss")
        $ip = "10.99.$($script:counter % 10).$((20 + $script:counter) % 250)"

        $log = Create-Log -Timestamp $timestamp -CompanyId $companyId -SourceId $sourceId -Level $Level -Message $Message -Ip $ip -EventName $EventName
        $script:created += $log
        $script:counter++
    }
}

Add-CombinationLogs -Targets @("Empresa Demo", "Empresa Demo 2", "Empresa Demo 3") -SourceType "EDR" -Level "CRITICAL" -Message "Shared ransomware activity detected" -EventName "shared_ransomware"
Add-CombinationLogs -Targets @("Empresa Demo", "Empresa Demo 2") -SourceType "FIREWALL" -Level "CRITICAL" -Message "Credential stuffing attack detected" -EventName "credential_stuffing"
Add-CombinationLogs -Targets @("Empresa Demo 2", "Empresa Demo 3") -SourceType "MAIL" -Level "CRITICAL" -Message "Shared phishing campaign delivered" -EventName "shared_phishing_campaign"
Add-CombinationLogs -Targets @("Empresa Demo", "Empresa Demo 3") -SourceType "EDR" -Level "CRITICAL" -Message "Lateral movement attempt observed" -EventName "lateral_movement_attempt"

Add-CombinationLogs -Targets @("Empresa Demo") -SourceType "MAIL" -Level "CRITICAL" -Message "CEO fraud attempt blocked" -EventName "ceo_fraud"
Add-CombinationLogs -Targets @("Empresa Demo 2") -SourceType "FIREWALL" -Level "CRITICAL" -Message "Unauthorized VPN tunnel detected" -EventName "unauthorized_vpn"
Add-CombinationLogs -Targets @("Empresa Demo 3") -SourceType "EDR" -Level "CRITICAL" -Message "Privileged escalation exploit blocked" -EventName "privilege_escalation_blocked"

Add-CombinationLogs -Targets @("Empresa Demo", "Empresa Demo 2", "Empresa Demo 3") -SourceType "MAIL" -Level "WARNING" -Message "Suspicious domain in incoming email" -EventName "suspicious_domain_mail"
Add-CombinationLogs -Targets @("Empresa Demo", "Empresa Demo 3") -SourceType "FIREWALL" -Level "INFO" -Message "Routine policy update applied" -EventName "policy_update"

Write-Host "Logs creats en aquesta execucio: $($created.Count)" -ForegroundColor Green

foreach ($companyName in $companyNames) {
    $companyId = [long]$companyMap[$companyName]
    $alerts = Invoke-ApiGet -Url "$baseUrl/api/alerts/company/$companyId"
    $openAlerts = Invoke-ApiGet -Url "$baseUrl/api/alerts/company/$companyId/open"

    Write-Host ("{0} -> Alertes totals: {1} | Alertes obertes: {2}" -f $companyName, $alerts.Count, $openAlerts.Count) -ForegroundColor Yellow
}

Write-Host "=== FI SEED 3-COMPANY COMBINATIONS ===" -ForegroundColor Cyan

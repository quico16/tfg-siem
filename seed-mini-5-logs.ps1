param(
    [string]$BaseUrl = "https://tfg-siem.onrender.com"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$baseUrl = $BaseUrl.TrimEnd('/')

function Invoke-WithRetry {
    param(
        [scriptblock]$Operation,
        [int]$MaxRetries = 5,
        [int]$DelaySeconds = 2
    )

    $attempt = 1
    while ($true) {
        try {
            return & $Operation
        } catch {
            if ($attempt -ge $MaxRetries) { throw }
            Start-Sleep -Seconds ($DelaySeconds * $attempt)
            $attempt++
        }
    }
}

function Invoke-ApiGet {
    param([string]$Path)
    Invoke-WithRetry -Operation {
        Invoke-RestMethod -Uri "$baseUrl$Path" -Method Get -TimeoutSec 60
    }
}

function Invoke-ApiPost {
    param(
        [string]$Path,
        [hashtable]$Body
    )
    $json = $Body | ConvertTo-Json -Depth 10
    Invoke-WithRetry -Operation {
        Invoke-RestMethod -Uri "$baseUrl$Path" -Method Post -ContentType "application/json" -Body $json -TimeoutSec 60
    }
}

function Ensure-Company {
    param([string]$Name)
    $companies = Invoke-ApiGet -Path "/api/companies"
    $existing = $companies | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if ($existing) { return $existing }
    Invoke-ApiPost -Path "/api/companies" -Body @{ name = $Name }
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
    Invoke-ApiPost -Path "/api/sources" -Body @{
        name = $Name
        type = $Type
        companyId = $CompanyId
    }
}

Write-Host "=== Mini seed (5 logs) ===" -ForegroundColor Cyan

$company = Ensure-Company -Name "Empresa Mini Seed"
$source = Ensure-Source -CompanyId $company.id -Name "Firewall Mini Seed" -Type "FIREWALL"

$levels = @("INFO", "INFO", "WARNING", "WARNING", "CRITICAL")
for ($i = 0; $i -lt 5; $i++) {
    $timestamp = (Get-Date).AddMinutes(-5 + $i).ToString("yyyy-MM-ddTHH:mm:ss")
    $level = $levels[$i]
    $message = "Mini seed event #$($i + 1) ($level)"
    $raw = @{
        timestamp = $timestamp
        level = $level
        message = $message
        ip = "10.10.0.$($i + 1)"
        event = "mini_seed_event"
    } | ConvertTo-Json -Compress

    Invoke-ApiPost -Path "/api/logs" -Body @{
        timestamp = $timestamp
        companyId = $company.id
        sourceId = $source.id
        level = $level
        message = $message
        ip = "10.10.0.$($i + 1)"
        rawLog = $raw
    } | Out-Null
}

Write-Host "Done: company '$($company.name)' with 5 logs." -ForegroundColor Green

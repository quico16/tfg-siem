Write-Host "Running frontend lint..."
npm --prefix frontend run lint

if ($LASTEXITCODE -ne 0) {
  Write-Host "Commit blocked: fix frontend lint errors first."
  exit $LASTEXITCODE
}

Write-Host "Running backend lint..."
Push-Location backend
.\mvnw.cmd -q -DskipTests checkstyle:check
$backendExitCode = $LASTEXITCODE
Pop-Location

if ($backendExitCode -ne 0) {
  Write-Host "Commit blocked: fix backend lint errors first."
  exit $backendExitCode
}

Write-Host "Frontend and backend lint passed."

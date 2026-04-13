git config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) {
  Write-Host "Failed to configure git hooks path."
  exit $LASTEXITCODE
}

Write-Host "Git hooks path configured to .githooks"

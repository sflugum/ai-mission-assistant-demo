# Host-side smoke checks. Uses Invoke-RestMethod so JSON is not misparsed like curl.exe under PowerShell.
param(
  [string] $BaseUrl = $(if ($env:BACKEND_URL) { $env:BACKEND_URL.TrimEnd('/') } else { 'http://localhost:3001' }),
  [switch] $Analyze
)

Write-Host "GET $BaseUrl/health"
Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get | ConvertTo-Json -Compress

if ($Analyze) {
  $body = @{ input = 'Mission smoke test: verify API and JSON body handling.' } | ConvertTo-Json
  Write-Host "POST $BaseUrl/analyze"
  Invoke-RestMethod -Uri "$BaseUrl/analyze" -Method Post -ContentType 'application/json; charset=utf-8' -Body $body | ConvertTo-Json -Compress
}

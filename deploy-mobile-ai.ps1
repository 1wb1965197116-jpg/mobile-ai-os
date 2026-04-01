# Change $ProjectDir to your local path if needed
$ProjectDir = "$env:USERPROFILE\my-ai-project"
$BackendPath = Join-Path $ProjectDir "backend"
$FrontendPath = Join-Path $ProjectDir "frontend"

# --- Backend install ---
Set-Location $BackendPath
npm install

# --- PM2 ---
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    npm install -g pm2
}

# --- Start server ---
pm2 start server.js --name "mobile-ai-os"

# --- Frontend build (if using React) ---
Set-Location $FrontendPath
if (Test-Path "package.json") {
    npm install
    npm run build
}

# --- Detect local IP ---
$LocalIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "169.*" -and $_.IPAddress -notlike "127.*"
}).IPAddress[0]

Write-Host "Deployment complete!"
Write-Host "Access from iPhone: http://$LocalIP:3000"
Read-Host "Press Enter to exit"

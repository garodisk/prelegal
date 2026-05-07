$ErrorActionPreference = 'Stop'
docker compose up -d --build
Write-Host "Prelegal started at http://localhost:8000"

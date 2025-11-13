#!/usr/bin/env pwsh
# Quick Deploy Script for Viral Content Hunter
# Usage: .\quick-deploy.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$HerokuAppName = "",
    
    [Parameter(Mandatory=$false)]
    [string]$GoogleAIKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseURL = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseKey = ""
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔════════════════════════════════════════════╗
║   VIRAL CONTENT HUNTER - QUICK DEPLOY     ║
╚════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if Heroku CLI is installed
Write-Host "`n[1/5] Checking Heroku CLI..." -ForegroundColor Yellow
try {
    $herokuVersion = heroku --version
    Write-Host "✅ Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI not found!" -ForegroundColor Red
    Write-Host "Install from: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    exit 1
}

# Get app name if not provided
if ([string]::IsNullOrWhiteSpace($HerokuAppName)) {
    Write-Host "`n[2/5] Heroku App Configuration" -ForegroundColor Yellow
    $HerokuAppName = Read-Host "Enter Heroku app name (e.g., viral-hunter-api)"
    
    if ([string]::IsNullOrWhiteSpace($HerokuAppName)) {
        Write-Host "❌ App name is required!" -ForegroundColor Red
        exit 1
    }
}

# Check if app already exists
Write-Host "`nChecking if Heroku app exists..." -NoNewline
try {
    heroku apps:info -a $HerokuAppName 2>$null | Out-Null
    Write-Host " ✅ App exists" -ForegroundColor Green
    $appExists = $true
} catch {
    Write-Host " ℹ️  App does not exist, will create" -ForegroundColor Yellow
    $appExists = $false
}

# Get API keys if not provided
if ([string]::IsNullOrWhiteSpace($GoogleAIKey) -or 
    [string]::IsNullOrWhiteSpace($SupabaseURL) -or 
    [string]::IsNullOrWhiteSpace($SupabaseKey)) {
    
    Write-Host "`n[3/5] API Keys Configuration" -ForegroundColor Yellow
    Write-Host "You need to provide API keys. Get them from:" -ForegroundColor Cyan
    Write-Host "  • Google AI: https://makersuite.google.com/app/apikey" -ForegroundColor White
    Write-Host "  • Supabase: https://supabase.com/dashboard (Settings → API)" -ForegroundColor White
    Write-Host ""
    
    if ([string]::IsNullOrWhiteSpace($GoogleAIKey)) {
        $GoogleAIKey = Read-Host "Enter Google AI API Key"
    }
    
    if ([string]::IsNullOrWhiteSpace($SupabaseURL)) {
        $SupabaseURL = Read-Host "Enter Supabase Project URL"
    }
    
    if ([string]::IsNullOrWhiteSpace($SupabaseKey)) {
        $SupabaseKey = Read-Host "Enter Supabase Anon Key"
    }
}

# Validate inputs
if ([string]::IsNullOrWhiteSpace($GoogleAIKey) -or 
    [string]::IsNullOrWhiteSpace($SupabaseURL) -or 
    [string]::IsNullOrWhiteSpace($SupabaseKey)) {
    Write-Host "❌ All API keys are required!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/5] Deploying Backend to Heroku..." -ForegroundColor Yellow

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Create app if it doesn't exist
if (-not $appExists) {
    Write-Host "Creating Heroku app: $HerokuAppName" -ForegroundColor Cyan
    try {
        heroku create $HerokuAppName --region eu
        Write-Host "✅ App created" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create app. Name might be taken." -ForegroundColor Red
        Write-Host "Try a different name: ${HerokuAppName}-$(Get-Random -Maximum 9999)" -ForegroundColor Yellow
        exit 1
    }
}

# Set config vars
Write-Host "`nSetting environment variables..." -ForegroundColor Cyan
heroku config:set NODE_ENV=production -a $HerokuAppName
heroku config:set GOOGLE_AI_KEY=$GoogleAIKey -a $HerokuAppName
heroku config:set SUPABASE_URL=$SupabaseURL -a $HerokuAppName
heroku config:set SUPABASE_KEY=$SupabaseKey -a $HerokuAppName
Write-Host "✅ Config vars set" -ForegroundColor Green

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "`nInitializing git repository..." -ForegroundColor Cyan
    git init
    git add .
    git commit -m "Initial commit for Heroku deploy"
    Write-Host "✅ Git initialized" -ForegroundColor Green
}

# Add Heroku remote
Write-Host "`nConfiguring Heroku remote..." -ForegroundColor Cyan
try {
    git remote add heroku "https://git.heroku.com/${HerokuAppName}.git" 2>$null
} catch {
    # Remote might already exist, update it
    git remote set-url heroku "https://git.heroku.com/${HerokuAppName}.git"
}
Write-Host "✅ Heroku remote configured" -ForegroundColor Green

# Deploy to Heroku
Write-Host "`n[5/5] Pushing to Heroku (this may take a few minutes)..." -ForegroundColor Yellow
git push heroku main -f

# Check deployment status
Write-Host "`nChecking deployment status..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$appUrl = "https://${HerokuAppName}.herokuapp.com"
try {
    $response = Invoke-WebRequest -Uri "${appUrl}/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is live!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
}

# Success summary
Write-Host @"

╔════════════════════════════════════════════╗
║         🎉 DEPLOYMENT SUCCESSFUL! 🎉       ║
╚════════════════════════════════════════════╝

Backend URL: $appUrl

Next Steps:
1. Test backend health check:
   ${appUrl}/health

2. Deploy frontend to Vercel:
   cd ..\frontend
   npm install -g vercel
   vercel --prod

3. Set up GitHub Actions:
   • Push to GitHub
   • Add secrets in Settings → Secrets
   
4. Open DEPLOYMENT_PL.md for detailed guide

Commands to check status:
  heroku logs --tail -a $HerokuAppName
  heroku ps -a $HerokuAppName
  heroku open -a $HerokuAppName

Happy viral content hunting! 🚀

"@ -ForegroundColor Green

# Return to original directory
Set-Location $PSScriptRoot

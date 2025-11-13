# 🔍 Pre-Deploy Verification Script

Write-Host "================================" -ForegroundColor Cyan
Write-Host "VIRAL CONTENT HUNTER" -ForegroundColor Cyan
Write-Host "Pre-Deploy Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $major = [int]$matches[1]
        if ($major -ge 18) {
            Write-Host " ✅ $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host " ❌ Version $nodeVersion (need 18+)" -ForegroundColor Red
            $allGood = $false
        }
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " ✅ v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check Git
Write-Host "Checking Git..." -NoNewline
try {
    $gitVersion = git --version
    Write-Host " ✅ $gitVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check Heroku CLI
Write-Host "Checking Heroku CLI..." -NoNewline
try {
    $herokuVersion = heroku --version
    Write-Host " ✅ Installed" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Not installed (optional for manual deploy)" -ForegroundColor Yellow
}

# Check Vercel CLI
Write-Host "Checking Vercel CLI..." -NoNewline
try {
    $vercelVersion = vercel --version
    Write-Host " ✅ $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Not installed (optional for manual deploy)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "PROJECT STRUCTURE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check backend files
Write-Host "Backend structure..." -NoNewline
if ((Test-Path "backend/dist") -and 
    (Test-Path "backend/Procfile") -and 
    (Test-Path "backend/package.json")) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Missing files" -ForegroundColor Red
    $allGood = $false
}

# Check frontend files
Write-Host "Frontend structure..." -NoNewline
if ((Test-Path "frontend/dist") -and 
    (Test-Path "frontend/vercel.json") -and 
    (Test-Path "frontend/.env.production")) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Missing files" -ForegroundColor Red
    $allGood = $false
}

# Check GitHub Actions
Write-Host "GitHub Actions..." -NoNewline
if ((Test-Path ".github/workflows/deploy-heroku.yml") -and 
    (Test-Path ".github/workflows/scheduled-scraper.yml")) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Missing workflows" -ForegroundColor Red
    $allGood = $false
}

# Check docs
Write-Host "Documentation..." -NoNewline
if ((Test-Path "README.md") -and 
    (Test-Path "DEPLOYMENT_PL.md") -and 
    (Test-Path "STATUS.md")) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Some docs missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "DEPENDENCIES" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check backend dependencies
Write-Host "Backend node_modules..." -NoNewline
if (Test-Path "backend/node_modules") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Run: cd backend && npm install" -ForegroundColor Red
    $allGood = $false
}

# Check frontend dependencies
Write-Host "Frontend node_modules..." -NoNewline
if (Test-Path "frontend/node_modules") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Run: cd frontend && npm install" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "API KEYS CHECKLIST" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "⏳ Google AI Key: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
Write-Host "⏳ Supabase Project: https://supabase.com/dashboard" -ForegroundColor Yellow
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "You are ready to deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Get API keys (see above)" -ForegroundColor White
    Write-Host "2. Read DEPLOYMENT_PL.md" -ForegroundColor White
    Write-Host "3. Run: heroku login" -ForegroundColor White
    Write-Host "4. Deploy backend to Heroku" -ForegroundColor White
    Write-Host "5. Deploy frontend to Vercel" -ForegroundColor White
} else {
    Write-Host "❌ SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "Please fix the issues above before deploying." -ForegroundColor Red
}
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

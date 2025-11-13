# 🚀 Deployment Guide - Heroku + Vercel

## Prerequisites

- ✅ Heroku account with plan
- ✅ Heroku CLI installed
- ✅ Vercel account (free)
- ✅ GitHub account
- ✅ Google AI API Key
- ✅ Supabase account

---

## 📦 Step 1: Backend Deployment (Heroku)

### 1.1 Install Heroku CLI

**Windows:**
```powershell
# Using Chocolatey
choco install heroku-cli

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### 1.2 Login to Heroku

```powershell
heroku login
# Opens browser for authentication
```

### 1.3 Create Heroku App

```powershell
cd c:\Users\jakub\Downloads\Xly\backend

# Create app in EU region
heroku create viral-content-hunter-api --region eu

# Or if name is taken, Heroku will auto-generate
# heroku create --region eu
```

### 1.4 Set Environment Variables

```powershell
# Google AI Key
heroku config:set GOOGLE_AI_KEY=your_google_ai_key_here --app viral-content-hunter-api

# Supabase credentials
heroku config:set SUPABASE_URL=https://xxxxx.supabase.co --app viral-content-hunter-api
heroku config:set SUPABASE_KEY=your_supabase_anon_key --app viral-content-hunter-api

# Node environment
heroku config:set NODE_ENV=production --app viral-content-hunter-api

# Verify all configs
heroku config --app viral-content-hunter-api
```

### 1.5 Build and Deploy

```powershell
# Make sure you're in backend folder
cd c:\Users\jakub\Downloads\Xly\backend

# Build TypeScript
npm run build

# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Heroku deployment"

# Add Heroku remote
heroku git:remote -a viral-content-hunter-api

# Deploy!
git push heroku main

# If you're on a different branch (e.g., master):
# git push heroku master:main
```

### 1.6 Verify Deployment

```powershell
# Check logs
heroku logs --tail --app viral-content-hunter-api

# Check dyno status
heroku ps --app viral-content-hunter-api

# Test health endpoint
curl https://viral-content-hunter-api.herokuapp.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 1.7 Test API Endpoints

```powershell
# Test search
curl "https://viral-content-hunter-api.herokuapp.com/api/search?query=javascript&limit=5"

# Test AI generation (POST request)
curl -X POST https://viral-content-hunter-api.herokuapp.com/api/generate-captions `
  -H "Content-Type: application/json" `
  -d '{"topic":"AI trends 2025","tone":"engaging"}'
```

---

## 🌐 Step 2: Frontend Deployment (Vercel)

### 2.1 Install Vercel CLI

```powershell
npm install -g vercel
```

### 2.2 Login to Vercel

```powershell
vercel login
# Follow authentication prompts
```

### 2.3 Configure Environment

```powershell
cd c:\Users\jakub\Downloads\Xly\frontend

# Make sure .env.production exists
cat .env.production
# Should contain: VITE_API_URL=https://viral-content-hunter-api.herokuapp.com
```

### 2.4 Deploy to Vercel

```powershell
# Production deployment
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: viral-content-hunter
# - Directory: ./
# - Override settings? No
```

### 2.5 Set Environment Variables in Vercel

**Option 1: Via CLI**
```powershell
vercel env add VITE_API_URL production
# Enter: https://viral-content-hunter-api.herokuapp.com
```

**Option 2: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add `VITE_API_URL` = `https://viral-content-hunter-api.herokuapp.com`

### 2.6 Verify Deployment

Open your browser:
- Frontend: `https://viral-content-hunter.vercel.app`
- Test search functionality
- Test AI caption generation
- Check browser console for errors

---

## ⚙️ Step 3: GitHub Actions Setup

### 3.1 Get Heroku API Key

```powershell
# Get your Heroku API key
heroku authorizations:create -d "GitHub Actions Deploy"
# Copy the Token value
```

Or get from Heroku Dashboard:
1. Go to https://dashboard.heroku.com/account
2. Scroll to "API Key"
3. Click "Reveal"
4. Copy key

### 3.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Name | Value |
|------|-------|
| `HEROKU_API_KEY` | Your Heroku API key from step 3.1 |
| `GOOGLE_AI_KEY` | Your Google AI API key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon/public key |

### 3.3 Test GitHub Actions

```powershell
# Push to main branch
git add .
git commit -m "Setup GitHub Actions"
git push origin main

# Or manually trigger workflow
gh workflow run deploy-heroku.yml
gh workflow run scheduled-scraper.yml
```

Check status:
- Go to GitHub repo → Actions tab
- See workflow runs and logs

---

## 📊 Step 4: Supabase Setup

### 4.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill details:
   - Name: `viral-content-hunter`
   - Database password: (generate strong password)
   - Region: Select closest to you
4. Wait 2-3 minutes for project creation

### 4.2 Run SQL Schema

1. In Supabase Dashboard, go to SQL Editor
2. Click "New query"
3. Copy content from `supabase-schema.sql`
4. Paste and click "Run"
5. Verify tables created: Go to Table Editor

Expected tables:
- `post_metrics`

### 4.3 Get API Credentials

1. Settings → API
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (long string)
3. Update these in:
   - Heroku config vars
   - GitHub secrets
   - Local `.env` file

---

## 🎯 Step 5: Final Testing

### 5.1 Full End-to-End Test

1. **Open Frontend**: `https://viral-content-hunter.vercel.app`

2. **Test Search**:
   - Enter "javascript"
   - Click Search
   - Verify posts appear
   - Check viral scores

3. **Test AI Generation**:
   - Click on a post
   - Switch to "Generate Content" tab
   - Click "Generate"
   - Verify captions appear

4. **Check Backend Logs**:
   ```powershell
   heroku logs --tail --app viral-content-hunter-api
   ```

5. **Check Supabase**:
   - Table Editor → `post_metrics`
   - Verify data being saved

### 5.2 Scheduled Scraper Test

```powershell
# Manually trigger scheduled workflow
gh workflow run scheduled-scraper.yml

# Or via GitHub UI:
# Actions → Scheduled Scraper → Run workflow
```

Check:
- Workflow completes successfully
- Data appears in Supabase
- No errors in logs

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: "Application error" on Heroku**

```powershell
# Check logs
heroku logs --tail --app viral-content-hunter-api

# Common issues:
# 1. Build failed - check TypeScript compilation
npm run build

# 2. Missing env vars
heroku config --app viral-content-hunter-api

# 3. Port binding issue - ensure server uses process.env.PORT
```

**Problem: CORS errors**

Update [`backend/src/server.ts`](backend/src/server.ts):
```ts
app.use(cors({
  origin: [
    'https://viral-content-hunter.vercel.app',
    'http://localhost:5173',
  ],
}));
```

Redeploy:
```powershell
git add .
git commit -m "Fix CORS"
git push heroku main
```

### Frontend Issues

**Problem: API requests failing**

Check `.env.production`:
```powershell
cd frontend
cat .env.production
```

Should have:
```
VITE_API_URL=https://viral-content-hunter-api.herokuapp.com
```

Redeploy:
```powershell
vercel --prod
```

**Problem: Build fails on Vercel**

Check build logs in Vercel Dashboard.

Common fixes:
```powershell
# Locally test build
npm run build

# Fix TypeScript errors
npm run lint
```

### GitHub Actions Issues

**Problem: Workflow fails**

Check:
1. All secrets are set correctly
2. Heroku API key is valid
3. Build succeeds locally

Re-run workflow:
```powershell
gh run rerun <run-id> --failed
```

---

## 📈 Monitoring

### Heroku Dashboard

Monitor your app:
```
https://dashboard.heroku.com/apps/viral-content-hunter-api
```

Key metrics:
- Dyno hours used
- Response time
- Memory usage
- Error rate

### Real-time Logs

```powershell
# Stream logs in real-time
heroku logs --tail --app viral-content-hunter-api

# Filter by severity
heroku logs --tail --app viral-content-hunter-api | grep ERROR

# Last 1000 lines
heroku logs -n 1000 --app viral-content-hunter-api
```

### Restart App

```powershell
# If something goes wrong, restart
heroku restart --app viral-content-hunter-api
```

---

## 💰 Cost Estimate (with your Heroku plan)

Assuming you have Heroku Eco/Basic plan:

| Service | Cost | Notes |
|---------|------|-------|
| Heroku Dyno | Included in your plan | Backend hosting |
| Vercel | Free | Frontend hosting |
| Supabase | Free | Database (up to 500MB) |
| Google AI | Free | 60 requests/min |
| GitHub Actions | Free | 2000 min/month |

**Total**: Covered by your existing Heroku plan! 🎉

---

## 🚀 Next Steps

After successful deployment:

1. ✅ **Custom Domain** (optional):
   ```powershell
   heroku domains:add api.yoursite.com --app viral-content-hunter-api
   ```

2. ✅ **SSL Certificate** (automatic on Heroku)

3. ✅ **Monitoring**: Setup Sentry or LogRocket

4. ✅ **Analytics**: Add Google Analytics to frontend

5. ✅ **Scaling**: Monitor usage and scale dyno if needed
   ```powershell
   heroku ps:scale web=2 --app viral-content-hunter-api
   ```

---

## 📞 Support

- Heroku Docs: https://devcenter.heroku.com/
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

**Your app is live! 🎉**
- Frontend: https://viral-content-hunter.vercel.app
- Backend: https://viral-content-hunter-api.herokuapp.com
- API Docs: https://viral-content-hunter-api.herokuapp.com/api-docs

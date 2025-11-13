# 🚀 Quick Start Guide - Viral Content Hunter

Complete setup instructions from zero to running application.

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Git** installed
- ✅ **Google AI API Key** ([Get free key](https://makersuite.google.com/app/apikey))
- ✅ **Supabase Account** (free tier) ([Sign up](https://supabase.com))

## 🎯 Step-by-Step Setup

### 1️⃣ Clone & Navigate

```powershell
cd c:\Users\jakub\Downloads\Xly
```

---

### 2️⃣ Backend Setup

#### Install Dependencies

```powershell
cd backend
npm install
```

This will install:
- express, typescript, ts-node, nodemon
- cheerio, undici (scraping)
- @google/generative-ai (AI)
- @supabase/supabase-js (database)
- cors, dotenv, express-rate-limit

#### Configure Environment

```powershell
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3001
NODE_ENV=development

# Get from https://makersuite.google.com/app/apikey
GOOGLE_AI_KEY=your_google_ai_key_here

# Get from Supabase Dashboard > Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Rate limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SCRAPER_DELAY_MS=1000
```

#### Setup Supabase Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (wait 2-3 minutes for setup)
3. Go to **SQL Editor**
4. Copy contents of `supabase-schema.sql` and run it
5. Copy your **Project URL** and **anon/public key** to `.env`

#### Start Backend

```powershell
npm run dev
```

You should see:
```
🚀 ========================================
   Viral Content Hunter API
   ========================================
   Server running on http://localhost:3001
```

Test it:
```powershell
curl http://localhost:3001/health
```

---

### 3️⃣ Frontend Setup

Open **NEW terminal** (keep backend running):

```powershell
cd ..\frontend
npm install
```

This will install:
- react, react-dom
- vite
- axios, recharts
- tailwindcss

#### Configure Environment

```powershell
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

#### Start Frontend

```powershell
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
```

---

### 4️⃣ Open in Browser

Open: **http://localhost:5173**

You should see the **Viral Content Hunter** interface! 🎉

---

## ✅ Test the Application

### Test 1: Search Viral Posts

1. Type "javascript" in the search bar
2. Click "🔍 Search"
3. Wait 5-10 seconds
4. You should see top viral posts ranked by score

### Test 2: Generate AI Captions

1. Click on a post from search results
2. Switch to "🎨 Generate Content" tab
3. The post text should auto-fill
4. Select tone (e.g., "Funny")
5. Click "✨ Generate"
6. Wait for AI to generate caption variations

### Test 3: Check API Health

```powershell
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "uptime": 123.45,
  "environment": "development"
}
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error: Cannot find module 'express'**

```powershell
cd backend
rm -rf node_modules
rm package-lock.json
npm install
```

**Error: GOOGLE_AI_KEY not set**

- Check `.env` file exists in `backend/` folder
- Make sure `GOOGLE_AI_KEY=...` has no spaces around `=`
- Get key from: https://makersuite.google.com/app/apikey

### Frontend won't start

**Error: Cannot find module 'react'**

```powershell
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

**CORS Error in browser console**

- Make sure backend is running on port 3001
- Check `frontend/.env` has `VITE_API_URL=http://localhost:3001`

### Scraping not working

**Error: Failed to scrape posts from all Nitter instances**

- Nitter instances might be down (public service)
- Try again later or wait a few minutes between requests
- Check internet connection

### Supabase connection error

**Error: Supabase not initialized**

- Check `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`
- Make sure you ran the SQL schema in Supabase SQL Editor
- Verify keys from: Supabase Dashboard > Settings > API

---

## 📦 Project Structure

```
Xly/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── server.ts     # Main server file
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── .env
│
├── frontend/             # React app
│   ├── src/
│   │   ├── App.tsx       # Main component
│   │   ├── components/   # UI components
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── .env
│
├── .github/
│   └── workflows/        # GitHub Actions
│
└── README.md
```

---

## 🎯 Next Steps

Now that everything is running:

1. ✅ **Test all features** (search, generate, monitor)
2. ✅ **Add your own search queries** in `backend/src/scripts/cronScraper.ts`
3. ✅ **Customize UI** in `frontend/src/components/`
4. ✅ **Setup GitHub Actions** (see below)
5. ✅ **Deploy to production** (see Deployment Guide)

---

## ⏰ Setup Automated Scraping (Optional)

### GitHub Actions Setup

1. Push code to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/viral-content-hunter.git
   git push -u origin main
   ```

2. Add secrets to GitHub:
   - Go to: Settings > Secrets and variables > Actions
   - Add:
     - `GOOGLE_AI_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_KEY`

3. Enable GitHub Actions:
   - Go to: Actions tab
   - Enable workflows
   - The scraper will run every 6 hours automatically!

---

## 🚀 Deploy to Production

### Frontend (Vercel)

```powershell
cd frontend
npm install -g vercel
vercel login
vercel
```

Set environment variable on Vercel:
- `VITE_API_URL` = your backend URL

### Backend (Railway)

```powershell
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

Set environment variables on Railway dashboard.

---

## 📞 Support

Need help?

- 📖 Check [README.md](./README.md) for detailed docs
- 📖 Backend docs: [backend/README.md](./backend/README.md)
- 📖 Frontend docs: [frontend/README.md](./frontend/README.md)
- 🐛 Open an issue on GitHub

---

**Good luck building viral content! 🚀🔥**

# 🚀 Viral Content Hunter

**Zero-budget tool for finding viral posts, generating AI-powered content, and monitoring engagement metrics.**

## 📋 Features

- **🔍 Viral Post Discovery**: Find top-performing posts in your niche using advanced scoring algorithms
- **🤖 AI Content Generation**: Generate engaging captions and hashtags using Google AI
- **📊 Engagement Monitoring**: Track post metrics over time with visual dashboards
- **⏰ Automated Scheduling**: GitHub Actions-based scheduled scraping

## 🏗️ Architecture

```
my-full-stack-app/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── frontend/         # React + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── pages/
│   └── package.json
└── .github/
    └── workflows/    # Scheduled scrapers
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI API Key (free)
- Supabase account (free tier)

### Backend Setup

```powershell
cd backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```powershell
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔑 Environment Variables

### Backend `.env`

```
PORT=3001
GOOGLE_AI_KEY=your_google_ai_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
NODE_ENV=development
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:3001
```

## 📊 Viral Score Formula

```
score = (likes × 1 + retweets × 1.5 + replies × 2) / (hoursAgo^0.8)
```

This formula prioritizes:
- **Recent engagement** (time decay)
- **Replies** (highest weight - indicates conversation)
- **Retweets** (medium weight - indicates sharing)
- **Likes** (base engagement)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Cheerio (HTML parsing)
- Undici (HTTP client)
- Google Generative AI
- Supabase (PostgreSQL)

### Frontend
- React 18
- Vite
- TypeScript
- TailwindCSS
- Recharts (data visualization)
- Axios

### DevOps
- GitHub Actions (scheduling)
- Vercel / Cloudflare Pages (frontend hosting)
- Railway / Render (backend hosting)

## 📖 API Endpoints

### Search
- `GET /api/search?query={keyword}&limit={n}` - Find viral posts

### AI Generation
- `POST /api/generate-captions` - Generate post captions
- `POST /api/generate-hashtags` - Generate relevant hashtags

### Metrics
- `GET /api/metrics/history?post_id={id}` - Get post history
- `GET /api/metrics/growth?post_id={id}` - Calculate growth rate

## 🎯 MVP Roadmap

- [x] **MVP1**: Scraper + Ranking + Basic UI
- [ ] **MVP2**: AI Integration (Captions + Hashtags)
- [ ] **MVP3**: Monitoring + Dashboard + GitHub Actions
- [ ] **MVP4**: Polish + Deployment

## 🧪 Testing

```powershell
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🚢 Deployment

### Frontend (Vercel)

```powershell
cd frontend
npm run build
vercel deploy
```

### Backend (Railway)

```powershell
cd backend
# Connect to Railway via CLI or Git push
railway up
```

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🙏 Credits

Built with:
- [Google Generative AI](https://ai.google.dev/)
- [Nitter](https://github.com/zedeus/nitter) (Twitter frontend)
- [Supabase](https://supabase.com/) (Database)
- GitHub Student Pack resources

---

**Made with ❤️ for zero-budget creators**

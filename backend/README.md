# Backend - Viral Content Hunter API

Node.js + Express + TypeScript backend for viral post discovery and AI content generation.

## 🚀 Setup

```powershell
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

Server runs on `http://localhost:3001`

## 📁 Structure

```
src/
├── server.ts              # Main Express app
├── routes/
│   ├── search.ts          # Search endpoints
│   ├── ai.ts              # AI generation endpoints
│   └── metrics.ts         # Monitoring endpoints
├── controllers/
│   ├── searchController.ts
│   └── aiController.ts
├── services/
│   ├── scraperService.ts  # Nitter scraping logic
│   ├── aiService.ts       # Google AI integration
│   └── metricsService.ts  # Supabase metrics
├── middleware/
│   └── index.ts           # Rate limiting, error handling
└── types/
    └── index.ts           # TypeScript definitions
```

## 🔌 API Endpoints

### Search for Viral Posts

```http
GET /api/search?query={keyword}&limit={number}
```

**Example:**
```powershell
curl "http://localhost:3001/api/search?query=javascript&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "content": "Post text...",
      "author": "username",
      "likes": 1200,
      "retweets": 300,
      "replies": 150,
      "score": 465.4,
      "hoursAgo": 6
    }
  ],
  "count": 20
}
```

### Generate Captions

```http
POST /api/generate-captions
Content-Type: application/json

{
  "topic": "React hooks best practices",
  "tone": "engaging"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "variations": [
      {
        "text": "🚀 Master React Hooks...",
        "hashtags": ["#ReactJS", "#WebDev", "#JavaScript"],
        "reason": "Uses emoji for attention, focuses on learning"
      }
    ]
  }
}
```

### Generate Hashtags

```http
POST /api/generate-hashtags
Content-Type: application/json

{
  "topic": "AI and machine learning",
  "count": 10
}
```

### Get Post Metrics History

```http
GET /api/metrics/history?post_id={id}
```

### Calculate Growth Rate

```http
GET /api/metrics/growth?post_id={id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "likes_per_hour": 15.3,
    "retweets_per_hour": 4.2,
    "replies_per_hour": 2.1
  }
}
```

## 🧮 Viral Score Formula

The scoring algorithm prioritizes recent, highly-engaged posts:

```typescript
score = (likes × 1 + retweets × 1.5 + replies × 2) / Math.pow(hoursAgo, 0.8)
```

**Example Calculation:**
- Post: 1200 likes, 300 retweets, 150 replies, 6 hours old
- Raw engagement: 1200 + (300 × 1.5) + (150 × 2) = 1950
- Time normalization: 6^0.8 ≈ 4.193
- **Final score: 1950 / 4.193 ≈ 465.4**

## 🤖 AI Service (Google Generative AI)

Uses Google's Gemini Pro model for:
- Caption generation (multiple variations)
- Hashtag suggestions
- Content optimization

## 📊 Metrics Service (Supabase)

Stores post metrics snapshots for:
- Engagement tracking over time
- Growth rate calculations
- Viral curve visualization

## 🛡️ Middleware

- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for frontend origin
- **Error Handling**: Centralized error responses
- **Logging**: Winston for structured logs

## 🔧 Scripts

```powershell
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run scheduled scraper (for GitHub Actions)
npm run scrape:cron

# Sync metrics to database
npm run sync:metrics
```

## 🧪 Testing

```powershell
npm test
```

## 📦 Dependencies

### Core
- `express` - Web framework
- `typescript` - Type safety
- `dotenv` - Environment variables

### Scraping
- `cheerio` - HTML parsing
- `undici` - Fast HTTP client

### AI & Database
- `@google/generative-ai` - Google AI SDK
- `@supabase/supabase-js` - Supabase client

### Utilities
- `cors` - Cross-origin requests
- `express-rate-limit` - API rate limiting
- `winston` - Logging

## 🚢 Deployment

### Railway

```powershell
railway login
railway init
railway up
```

### Render

1. Connect GitHub repo
2. Set environment variables
3. Deploy!

## 🔐 Security

- API keys in environment variables
- Rate limiting enabled
- Input validation and sanitization
- CORS configured for specific origins

## 📝 License

MIT

# 🚀 Viral Content Hunter API - Documentation

**Base URL (Production):** `https://viral-content-hunter-api-1378f44663a0.herokuapp.com`

**Version:** 1.0.0

---

## 📋 Available Endpoints

### 1. **Health Check**
Check if API is running.

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T21:53:24.202Z",
  "uptime": 2108.498741,
  "environment": "production"
}
```

---

### 2. **Search Viral Posts**
Search for viral content from multiple sources (Reddit, Dev.to, Hacker News, RSS).

```http
GET /api/search?query={keyword}&limit={n}&source={platform}
```

**Parameters:**
- `query` (required): Search keyword (e.g., "javascript", "AI", "react")
- `limit` (optional): Max results (default: 20, max: 100)
- `source` (optional): Filter by platform: `all`, `reddit`, `devto`, `hackernews`, `rss`

**Example:**
```bash
curl "https://viral-content-hunter-api-1378f44663a0.herokuapp.com/api/search?query=AI&limit=5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hn_45916196",
      "platform": "hackernews",
      "author": "sagacity",
      "title": "Zed is our office",
      "content": "Zed is our office",
      "url": "https://zed.dev/blog/zed-is-our-office",
      "likes": 377,
      "comments": 188,
      "shares": 0,
      "timestamp": "2025-11-13T15:41:26.000Z",
      "score": 155.18,
      "platform_icon": "⚡"
    }
  ],
  "count": 5,
  "query": "AI",
  "source": "all"
}
```

---

### 3. **Generate AI Captions**
Generate viral caption variations for your topic using Google Gemini AI.

```http
POST /api/generate-captions
Content-Type: application/json
```

**Body:**
```json
{
  "topic": "viral AI content",
  "tone": "engaging"
}
```

**Parameters:**
- `topic` (required): Content topic
- `tone` (optional): `engaging`, `funny`, `informative`, `inspirational`

**Example:**
```bash
curl -X POST https://viral-content-hunter-api-1378f44663a0.herokuapp.com/api/generate-captions \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI trends","tone":"engaging"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "variations": [
      {
        "text": "🚀 AI trends: Unlock the power of viral content! 💡",
        "hashtags": ["#ViralContent", "#AI", "#SocialMedia"],
        "reason": "Hook with emoji + value proposition"
      }
    ]
  }
}
```

---

### 4. **Generate Hashtags**
Generate trending hashtags for your topic.

```http
POST /api/generate-hashtags
Content-Type: application/json
```

**Body:**
```json
{
  "topic": "javascript",
  "count": 10
}
```

**Parameters:**
- `topic` (required): Content topic
- `count` (optional): Number of hashtags (default: 10)

**Example:**
```bash
curl -X POST https://viral-content-hunter-api-1378f44663a0.herokuapp.com/api/generate-hashtags \
  -H "Content-Type: application/json" \
  -d '{"topic":"react","count":5}'
```

**Response:**
```json
{
  "success": true,
  "data": [
    "#react",
    "#javascript",
    "#webdev",
    "#frontend",
    "#coding"
  ]
}
```

---

### 5. **Suggest Posting Times**
Get optimal posting times for maximum engagement.

```http
POST /api/suggest-times
Content-Type: application/json
```

**Body:**
```json
{
  "timezone": "Europe/Warsaw"
}
```

**Example:**
```bash
curl -X POST https://viral-content-hunter-api-1378f44663a0.herokuapp.com/api/suggest-times \
  -H "Content-Type: application/json" \
  -d '{"timezone":"UTC"}'
```

**Response:**
```json
{
  "success": true,
  "data": [
    "9:00 AM - Morning engagement peak",
    "1:00 PM - Lunch hour browsing",
    "7:00 PM - Evening activity"
  ]
}
```

---

## 🌐 Data Sources

The API aggregates viral content from:

| Source | Platform | Icon | Status |
|--------|----------|------|--------|
| **Reddit** | reddit.com | 🤖 | ✅ Active |
| **Dev.to** | dev.to | 👨‍💻 | ✅ Active |
| **Hacker News** | news.ycombinator.com | ⚡ | ✅ Active |
| **RSS Feeds** | Multiple | 📰 | ✅ Active |

---

## 📊 Viral Score Algorithm

Posts are ranked by viral score:

```
score = (likes + comments * 2 + shares * 3) / (ageInHours + 1)^0.8
```

Higher scores = more viral content.

---

## 🔑 Authentication

Currently **no authentication required** (public API).

---

## ⚠️ Rate Limits

- **No rate limits** currently
- Recommended: Max 100 requests/minute

---

## 🚀 Frontend

**Live Frontend:** https://frontend-bwycoab4o-jkmb2business-9450s-projects.vercel.app

---

## 📞 Support

For issues or questions:
- GitHub: [Viral Content Hunter](https://github.com/yourusername/viral-content-hunter)
- Email: support@example.com

---

## 🎯 Quick Test

```bash
# Health check
curl https://viral-content-hunter-api-1378f44663a0.herokuapp.com/health

# Search posts
curl "https://viral-content-hunter-api-1378f44663a0.herokuapp.com/api/search?query=javascript&limit=5"

# Generate captions
curl -X POST https://viral-content-hunter-api-1378f44663a0.herokuapp.com/api/generate-captions \
  -H "Content-Type: application/json" \
  -d '{"topic":"viral content","tone":"engaging"}'
```

---

**Last Updated:** November 13, 2025
**API Status:** ✅ Operational

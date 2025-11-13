# Frontend - Viral Content Hunter

React + Vite + TypeScript frontend for discovering viral content and generating AI-powered captions.

## 🚀 Setup

```powershell
npm install
cp .env.example .env
# Edit .env to set VITE_API_URL
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📁 Structure

```
src/
├── App.tsx                    # Main application
├── index.tsx                  # Entry point
├── index.css                  # Global styles (Tailwind)
├── components/
│   ├── SearchBar.tsx          # Search input & logic
│   ├── ResultsList.tsx        # Display viral posts
│   ├── CaptionGenerator.tsx   # AI caption generation
│   └── Dashboard.tsx          # Engagement metrics
└── types/
    └── index.ts               # TypeScript definitions
```

## 🎨 Features

### 1. Search Viral Posts
- Search by keyword, hashtag, or niche
- Real-time scraping from Nitter
- Viral score ranking
- Engagement metrics display

### 2. AI Caption Generator
- Multiple caption variations
- Tone selection (funny, engaging, professional, etc.)
- Auto-generated hashtags
- Copy to clipboard

### 3. Engagement Dashboard
- Growth rate tracking (likes/retweets/replies per hour)
- Historical metrics visualization
- Interactive charts with Recharts

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Data visualization

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.2",
  "recharts": "^2.10.3",
  "tailwindcss": "^3.3.6"
}
```

## 🎨 Tailwind Configuration

The app uses custom color scheme:

```js
colors: {
  primary: {
    500: '#3b82f6',  // Blue
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

Background: Gradient from purple to indigo

## 🔧 Scripts

```powershell
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## 🌐 Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:3001
```

For production (Vercel/Cloudflare Pages):

```
VITE_API_URL=https://your-backend-api.com
```

## 🚢 Deployment

### Vercel

```powershell
npm run build
vercel deploy
```

### Cloudflare Pages

```powershell
npm run build
# Upload dist/ folder to Cloudflare Pages
```

Build settings:
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 18+

## 🎯 API Integration

The frontend connects to these backend endpoints:

```typescript
// Search
GET /api/search?query={keyword}&limit={n}

// AI Generation
POST /api/generate-captions
Body: { topic: string, tone: string }

POST /api/generate-hashtags
Body: { topic: string, count: number }

// Metrics
GET /api/metrics/history?post_id={id}
GET /api/metrics/growth?post_id={id}
```

## 🎨 Component Examples

### SearchBar Usage

```tsx
import { SearchBar } from './components/SearchBar';

<SearchBar onResults={(posts) => setPosts(posts)} />
```

### ResultsList Usage

```tsx
import { ResultsList } from './components/ResultsList';

<ResultsList 
  posts={posts} 
  onSelectPost={(post) => setSelected(post)} 
/>
```

### CaptionGenerator Usage

```tsx
import { CaptionGenerator } from './components/CaptionGenerator';

<CaptionGenerator selectedPost={post.content} />
```

## 📊 Dashboard Features

- **Growth Rate Cards**: Likes, retweets, replies per hour
- **Line Chart**: Historical engagement over time
- **Auto-refresh**: Updates when new data available

## 🐛 Troubleshooting

### Backend Connection Issues

```
Failed to connect to API
```

**Solution**: Make sure backend is running on port 3001

### CORS Errors

**Solution**: Check backend CORS configuration allows your frontend origin

### Build Errors

```
Cannot find module 'react'
```

**Solution**: Run `npm install` again

## 📝 License

MIT

# Twikit Integration - Setup Guide

## Quick Start

### 1. Install Python Dependencies

```powershell
cd backend\python
python -m pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```powershell
cd backend
npm install
```

### 3. Configure Twitter Credentials (Optional)

Edit `backend\.env`:

```bash
TWITTER_USERNAME=your_twitter_username
TWITTER_EMAIL=your_twitter_email
TWITTER_PASSWORD=your_twitter_password
```

**Note:** If you don't provide credentials, the app will use Nitter/mock data as fallback.

### 4. Configure Redis (Optional)

Redis provides caching to reduce API calls. If not configured, the app uses in-memory caching.

**Install Redis:**
- Windows: Download from https://github.com/microsoftarchive/redis/releases
- Mac: `brew install redis`
- Linux: `sudo apt-get install redis-server`

**Configure:**
```bash
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true
CACHE_TTL=86400
```

### 5. Rebuild and Start

```powershell
# Backend
cd backend
npm run build
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

## How It Works

### Architecture

```
Express API → twikitScraper.ts → pythonBridge.ts → Python Process → twikit library → Twitter
     ↓                                                                                   ↓
  Cache Service ←──────────────────────────────────────────────────────────────────────┘
```

### Fallback Chain

1. **Cache** - Check if recent data exists (24h TTL)
2. **Twikit** - Try Python twikit scraper
3. **Nitter** - Fallback to Nitter public instances
4. **Mock** - Generate demo data

### Files Created

**Python:**
- `backend/python/twikit_bridge.py` - JSON-RPC bridge for twikit
- `backend/python/requirements.txt` - Python dependencies

**Node.js:**
- `backend/src/services/pythonBridge.ts` - Child process manager
- `backend/src/services/twikitScraper.ts` - High-level scraper wrapper
- `backend/src/services/cacheService.ts` - Redis/memory caching
- `backend/src/types/index.ts` - Updated TypeScript types

**Configuration:**
- `backend/.env.example` - Updated environment template
- `backend/package.json` - Added redis dependency

## Testing

### Test Python Bridge

```powershell
cd backend\python
python twikit_bridge.py
```

Should output: `{"status": "ready", "version": "1.0.0"}`

Press Ctrl+C to exit.

### Test Full Stack

1. Start backend: `cd backend && npm run dev`
2. Search for something: http://localhost:3001/api/search?q=AI&platform=twitter
3. Check logs for:
   - `[TwikitScraper] Initialized successfully` (if credentials provided)
   - `[CacheService] Redis connected` (if Redis available)
   - `✅ Twitter: Twikit found X posts` (if working)

## Troubleshooting

### Python not found
```powershell
# Check Python installation
python --version  # Should be 3.11+

# Or use python3
python3 --version
```

### twikit not installed
```powershell
cd backend\python
pip install -r requirements.txt
```

### Redis connection failed
Redis is optional. The app works without it using memory cache. To disable Redis warnings:

```bash
CACHE_ENABLED=false
```

### Twitter login failed
- Check credentials are correct
- Try logging in manually at twitter.com first
- Twitter may require phone verification for new accounts
- Leave credentials empty to use fallback methods

### Python process crashes
Check `backend/src/services/pythonBridge.ts` logs. The bridge auto-restarts up to 3 times.

## Performance Tips

1. **Enable Redis** - Reduces Twitter API calls by 95%+ (24h cache)
2. **Set longer TTL** - Increase CACHE_TTL for less frequent updates
3. **Use multiple Twitter accounts** - Rotate accounts to avoid rate limits
4. **Monitor logs** - Watch for `[TwikitScraper]` and `[CacheService]` messages

## Production Deployment

See `DEPLOYMENT.md` for full production setup with Docker, environment variables, and monitoring.

**Key considerations:**
- Set `NODE_ENV=production`
- Use managed Redis (Redis Cloud, AWS ElastiCache)
- Rotate Twitter credentials periodically
- Monitor Python process health
- Set up logging/alerting for failures

## Next Steps

✅ Python bridge created
✅ Node.js wrapper implemented  
✅ Cache service configured
✅ Unified scraper updated
✅ Types updated
⏳ Install dependencies
⏳ Configure credentials
⏳ Test integration
⏳ Deploy to production

See `backend/README.md` for API documentation.

import express, { Request, Response } from 'express';
import { searchAllSources, computeViralScore } from '../services/multiSourceScraper';

const router = express.Router();

/**
 * GET /api/search
 * Find viral posts in a niche from multiple sources
 * 
 * Query params:
 *   - query: Search keyword/hashtag (required)
 *   - limit: Max results (default: 20, max: 100)
 *   - source: Filter by source (all, reddit, devto, hackernews, rss)
 * 
 * Example: /api/search?query=javascript&limit=30&source=reddit
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query = 'javascript', limit = '20', source = 'all' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Query parameter is required and must be a string' 
      });
    }

    const parsedLimit = Math.min(parseInt(limit as string) || 20, 100);

    console.log(`\n📡 API Search Request: "${query}" (limit: ${parsedLimit}, source: ${source})\n`);
    
    let posts = await searchAllSources(query, parsedLimit);

    // Filter by source if specified
    if (source && source !== 'all') {
      posts = posts.filter(p => p.platform === source);
    }

    // Add viral scores and platform icons
    const ranked = posts.map(p => ({
      ...p,
      score: computeViralScore(p),
      platform_icon: {
        reddit: '🤖',
        devto: '👨‍💻',
        hackernews: '⚡',
        rss: '📰'
      }[p.platform]
    }));

    res.json({ 
      success: true, 
      data: ranked,
      count: ranked.length,
      query,
      source: source || 'all'
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ 
      success: false, 
      error: (err as Error).message 
    });
  }
});

export default router;

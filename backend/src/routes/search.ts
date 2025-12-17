import express, { Request, Response } from 'express';
import { searchAllSources, computeViralScore } from '../services/unifiedScraper';

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
    const { query = 'javascript', limit = '20', source, platform } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Query parameter is required and must be a string' 
      });
    }

    const parsedLimit = Math.min(parseInt(limit as string) || 20, 100);
    
    // Accept both 'source' and 'platform' parameters
    const filterPlatform = (source || platform || 'all') as string;

    console.log(`\n📡 API Search Request: "${query}" (limit: ${parsedLimit}, platform: ${filterPlatform})\n`);
    
    // Pass platform filter to searchAllSources for more efficient scraping
    let posts = await searchAllSources(query, parsedLimit, filterPlatform);

    // Double-check filter (in case searchAllSources returns mixed results)
    if (filterPlatform && filterPlatform !== 'all') {
      posts = posts.filter(p => p.platform.toLowerCase() === filterPlatform.toLowerCase());
    }

    // Recompute viral scores (already has icon from unifiedScraper)
    const ranked = posts.map(p => ({
      ...p,
      score: computeViralScore(p)
    }));

    res.json({ 
      success: true, 
      data: ranked,
      count: ranked.length,
      query,
      platform: filterPlatform,
      sources: [...new Set(ranked.map(p => p.platform))]
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

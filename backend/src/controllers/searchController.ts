import { Request, Response } from 'express';
import { fetchNitterSearch, rankPostsByScore } from '../services/scraperService';

/**
 * GET /api/search
 * Search for viral posts by query
 */
export async function getViralPosts(req: Request, res: Response): Promise<void> {
  try {
    const { query = 'javascript', limit = 20 } = req.query;

    // Validate inputs
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Query parameter is required and must be a string',
      });
      return;
    }

    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 100',
      });
      return;
    }

    console.log(`🔍 Searching for: "${query}" (limit: ${limitNum})`);

    // Fetch and rank posts
    const posts = await fetchNitterSearch(query, limitNum);
    const rankedPosts = rankPostsByScore(posts);

    res.json({
      success: true,
      data: rankedPosts,
      count: rankedPosts.length,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

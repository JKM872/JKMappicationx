import express from 'express';
import { getTrendingTopics, getTrendingByCategory } from '../services/trendingService';

const router = express.Router();

/**
 * GET /api/trending
 * Get trending topics from all platforms
 */
router.get('/', async (req, res) => {
  try {
    const topics = await getTrendingTopics();
    res.json({
      success: true,
      data: topics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * GET /api/trending/:category
 * Get trending topics by category (tech, social, community)
 */
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const topics = await getTrendingByCategory(category);
    res.json({
      success: true,
      data: topics,
      category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trending by category error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;

